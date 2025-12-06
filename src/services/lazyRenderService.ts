/**
 * LazyRenderService
 * 
 * Manages lazy rendering of Pokemon cards using IntersectionObserver API.
 * Tracks visible card indices and provides event-based updates for React components.
 * 
 * Features:
 * - IntersectionObserver-based visibility detection
 * - 200px buffer zone for pre-rendering
 * - Debounced intersection events (100ms)
 * - Prioritized render queue (viewport > buffer > deferred)
 * - Memory-efficient WeakMap tracking
 */

import {
  LAZY_RENDER_BUFFER_SIZE,
  LAZY_RENDER_BATCH_DELAY,
  LAZY_RENDER_INTERSECTION_THRESHOLD
} from '../utils/constants'

export interface LazyRenderConfig {
  bufferPx: number;      // Buffer zone margin (default: 200px)
  debounceMs: number;    // Debounce delay for intersection events (default: 100ms)
  threshold: number;     // IntersectionObserver threshold (default: 0)
}

export type VisibleChangeCallback = (visibleIndices: Set<number>) => void;

/**
 * Service class for managing lazy card rendering with IntersectionObserver
 */
export class LazyRenderService {
  private observer: IntersectionObserver | null = null;
  private visibleIndices: Set<number> = new Set();
  private config: LazyRenderConfig;
  private listeners: Set<VisibleChangeCallback> = new Set();
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private resizeDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private elementIndexMap: WeakMap<HTMLElement, number> = new WeakMap();
  private baselineMemoryBytes: number | null = null;
  private readonly estimatedBytesPerCard = 50 * 1024; // ~50KB per card baseline
  private readonly boundResizeHandler = this.handleResize.bind(this);

  constructor(config: Partial<LazyRenderConfig> = {}) {
    this.config = {
      bufferPx: config.bufferPx ?? LAZY_RENDER_BUFFER_SIZE,
      debounceMs: config.debounceMs ?? LAZY_RENDER_BATCH_DELAY,
      threshold: config.threshold ?? LAZY_RENDER_INTERSECTION_THRESHOLD,
    };
  }

  /**
   * Initialize the IntersectionObserver and detect feature support
   * @returns true if IntersectionObserver is supported, false otherwise
   */
  initialize(): boolean {
    // Feature detection
    if (typeof IntersectionObserver === 'undefined') {
      console.warn('IntersectionObserver not supported - falling back to rendering all cards');
      return false;
    }

    // Capture baseline memory before any rendering work occurs
    this.baselineMemoryBytes = this.getCurrentMemoryUsage();

    // Create observer instance with configuration
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        rootMargin: `${String(this.config.bufferPx)}px`,
        threshold: this.config.threshold,
      }
    );

    // Set up resize handler
    this.setupResizeHandler();

    return true;
  }

  /**
   * Set up window resize handler with debouncing
   */
  private setupResizeHandler(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('resize', this.boundResizeHandler);
  }

  /**
   * Handle window resize events (debounced to 200ms)
   */
  private handleResize(): void {
    // Clear existing resize debounce timer
    if (this.resizeDebounceTimer !== null) {
      clearTimeout(this.resizeDebounceTimer);
    }

    // Debounce resize handling to 200ms
    this.resizeDebounceTimer = setTimeout(() => {
      // Notify listeners to recalculate visible cards
      this.notifyListeners();
      this.resizeDebounceTimer = null;
    }, 200);
  }

  /**
   * Get currently visible card indices
   * @returns Set of visible card indices
   */
  getVisibleIndices(): Set<number> {
    return new Set(this.visibleIndices);
  }

  /**
   * Handle intersection events (debounced with priority processing)
   */
  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    // Clear existing debounce timer
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
    }

    // Debounce updates
    this.debounceTimer = setTimeout(() => {
      // Prioritize entries: immediate (in viewport) > upcoming (entering) > deferred (leaving)
      const immediate: IntersectionObserverEntry[] = [];
      const upcoming: IntersectionObserverEntry[] = [];
      const deferred: IntersectionObserverEntry[] = [];

      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0) {
          // Card is visible in viewport - highest priority
          immediate.push(entry);
        } else if (entry.isIntersecting) {
          // Card is in buffer zone - medium priority
          upcoming.push(entry);
        } else {
          // Card left viewport - lowest priority
          deferred.push(entry);
        }
      });

      // Process in priority order: immediate → upcoming → deferred
      const prioritizedEntries = [...immediate, ...upcoming, ...deferred];

      // Process intersection entries
      prioritizedEntries.forEach((entry) => {
        const index = this.elementIndexMap.get(entry.target as HTMLElement);
        if (typeof index !== 'number') return;

        if (entry.isIntersecting) {
          this.visibleIndices.add(index);
        } else {
          this.visibleIndices.delete(index);
        }
      });

      // Notify listeners
      this.notifyListeners();
    }, this.config.debounceMs);
  }

  /**
   * Subscribe to visible indices changes
   * @param callback Function to call when visible indices change
   * @returns Unsubscribe function
   */
  on(callback: VisibleChangeCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Remove listener (alternative to unsubscribe function)
   */
  off(callback: VisibleChangeCallback): void {
    this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of visible indices change
   */
  private notifyListeners(): void {
    this.listeners.forEach((callback) => {
      callback(this.getVisibleIndices());
    });
  }

  /**
   * Observe a card element
   * @param element Card DOM element to observe
   * @param index Card index in the list
   */
  observe(element: HTMLElement, index: number): void {
    if (!this.observer) return;
    element.setAttribute('data-card-index', String(index));
    this.elementIndexMap.set(element, index);
    this.observer.observe(element);
  }

  /**
   * Unobserve a card element
   * @param element Card DOM element to stop observing
   */
  unobserve(element: HTMLElement): void {
    if (!this.observer) return;
    this.observer.unobserve(element);
    this.elementIndexMap.delete(element);
  }

  /**
   * Cleanup and disconnect observer
   */
  destroy(): void {
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    if (this.resizeDebounceTimer !== null) {
      clearTimeout(this.resizeDebounceTimer);
      this.resizeDebounceTimer = null;
    }

    // Remove resize event listener
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.boundResizeHandler);
    }

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    this.visibleIndices.clear();
    this.listeners.clear();
    this.elementIndexMap = new WeakMap();
    this.baselineMemoryBytes = null;
  }

  /**
   * Get performance and memory statistics
   */
  getStats(): {
    totalVisible: number;
    memoryEstimateBytes: number;
    memoryDeltaBytes: number;
    baselineMemoryBytes: number;
  } {
    const currentMemory = this.getCurrentMemoryUsage();
    const baseline = this.baselineMemoryBytes ?? currentMemory;

    return {
      totalVisible: this.visibleIndices.size,
      memoryEstimateBytes: currentMemory,
      memoryDeltaBytes: currentMemory - baseline,
      baselineMemoryBytes: baseline,
    };
  }

  /**
   * Estimate current memory usage using performance.memory when available,
   * otherwise fall back to a card-count-based approximation.
   */
  private getCurrentMemoryUsage(): number {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as Performance & { memory?: { usedJSHeapSize?: number } }).memory;
      if (memory?.usedJSHeapSize) {
        return memory.usedJSHeapSize;
      }
    }

    return this.visibleIndices.size * this.estimatedBytesPerCard;
  }
}
