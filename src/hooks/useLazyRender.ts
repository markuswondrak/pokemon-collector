/**
 * useLazyRender Hook
 * 
 * Custom React hook for lazy rendering of card lists.
 * Manages LazyRenderService lifecycle and provides visible indices state.
 * 
 * Features:
 * - Automatic service lifecycle management
 * - Threshold-based lazy rendering (enable for ≥50 items)
 * - Configurable buffer and debounce settings
 * - Clean teardown on unmount
 */

import { useEffect, useState, useRef, RefObject, useMemo } from 'react';
import { LazyRenderService, LazyRenderConfig } from '../services/lazyRenderService';

export interface UseLazyRenderOptions {
  bufferPx?: number;      // Buffer zone margin (default: 200px)
  debounceMs?: number;    // Debounce delay (default: 100ms)
  lazyThreshold?: number; // Min items to enable lazy rendering (default: 50)
}

export interface UseLazyRenderResult {
  visibleIndices: Set<number>;
  isLazyEnabled: boolean;
  observe: (element: HTMLElement | null, index: number) => void;
  getStats: () => RenderStats;
}

export interface RenderStats {
  totalRendered: number;
  initialRenderTimeMs: number;
  memoryEstimateBytes: number;
  memoryDeltaBytes: number;
}

/**
 * Hook for lazy rendering card lists with IntersectionObserver
 * 
 * @param containerRef Ref to the container element
 * @param items Array of items to render
 * @param options Configuration options
 * @returns Visible indices set and helper functions
 */
export function useLazyRender(
  _containerRef: RefObject<HTMLElement>,
  items: unknown[],
  options: UseLazyRenderOptions = {}
): UseLazyRenderResult {
  const {
    bufferPx = 200,
    debounceMs = 100,
    lazyThreshold = 50,
  } = options;

  // Determine if lazy rendering should be enabled
  const isLazyEnabled = items.length >= lazyThreshold;

  // Compute all indices for non-lazy mode
  const allIndices = useMemo(
    () => new Set(Array.from({ length: items.length }, (_, i) => i)),
    [items.length]
  );

  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set());
  const serviceRef = useRef<LazyRenderService | null>(null);
  const observedElementsRef = useRef<Map<number, HTMLElement>>(new Map());
  const renderStatsRef = useRef<RenderStats>({
    totalRendered: isLazyEnabled ? 0 : items.length,
    initialRenderTimeMs: 0,
    memoryEstimateBytes: 0,
    memoryDeltaBytes: 0,
  });
  const performanceMarkIdRef = useRef<string | null>(null);
  const initialRenderMeasuredRef = useRef(false);

  // Initialize service - separate effect to avoid setState issues
  useEffect(() => {
    if (!isLazyEnabled) {
      // For non-lazy mode, just render all indices without service
      return;
    }

    // Create and initialize service
    const service = new LazyRenderService({
      bufferPx,
      debounceMs,
      threshold: 0,
    } as LazyRenderConfig);

    const supported = service.initialize();
    if (!supported) {
      // Fallback handled by returning allIndices below
      service.destroy();
      return;
    }

    serviceRef.current = service;

    // Start performance timing for initial render
    if (typeof performance !== 'undefined' && typeof performance.mark === 'function') {
      const markId = `lazy-render-start-${performance.now().toFixed(3)}`;
      performance.mark(markId);
      performanceMarkIdRef.current = markId;
    }

    // Subscribe to visible indices changes
    const unsubscribe = service.on((indices) => {
      setVisibleIndices(indices);

      // Measure initial render time once the first batch becomes visible
      if (!initialRenderMeasuredRef.current && indices.size > 0 && performanceMarkIdRef.current && typeof performance !== 'undefined' && typeof performance.mark === 'function' && typeof performance.measure === 'function') {
        const endMark = `lazy-render-first-visible-${performance.now().toFixed(3)}`;
        performance.mark(endMark);
        const measureName = `lazy-render-initial-${performance.now().toFixed(3)}`;
        performance.measure(measureName, performanceMarkIdRef.current, endMark);
        const measures = performance.getEntriesByName(measureName);
        const duration = measures.length > 0 ? measures[measures.length - 1]?.duration ?? 0 : 0;
        renderStatsRef.current = {
          ...renderStatsRef.current,
          initialRenderTimeMs: duration,
        };
        if (typeof performance.clearMarks === 'function') {
          performance.clearMarks(performanceMarkIdRef.current);
          performance.clearMarks(endMark);
        }
        if (typeof performance.clearMeasures === 'function') {
          performance.clearMeasures(measureName);
        }
        initialRenderMeasuredRef.current = true;
      }

      // Update memory stats when visible indices change
      const stats = service.getStats();
      renderStatsRef.current = {
        ...renderStatsRef.current,
        totalRendered: indices.size,
        memoryEstimateBytes: stats.memoryEstimateBytes,
        memoryDeltaBytes: stats.memoryDeltaBytes,
      };
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
      service.destroy();
      serviceRef.current = null;
    };
  }, [isLazyEnabled, bufferPx, debounceMs]);

  // Reset when items change (search filter) - separate effect
  useEffect(() => {
    initialRenderMeasuredRef.current = false
    performanceMarkIdRef.current = null
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisibleIndices(new Set())
    observedElementsRef.current.clear()
  }, [items.length]) // Use items.length instead of full items array

  // Observe function to be called from refs
  const observe = (element: HTMLElement | null, index: number): void => {
    const service = serviceRef.current;
    if (!service || !element) return;

    // Unobserve previous element at this index
    const prevElement = observedElementsRef.current.get(index);
    if (prevElement) {
      service.unobserve(prevElement);
    }

    // Observe new element
    service.observe(element, index);
    observedElementsRef.current.set(index, element);
  };

  // Keep stats consistent when lazy rendering disabled
  useEffect(() => {
    if (!isLazyEnabled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisibleIndices(allIndices)
      renderStatsRef.current = {
        totalRendered: items.length,
        initialRenderTimeMs: renderStatsRef.current.initialRenderTimeMs,
        memoryEstimateBytes: items.length * 50 * 1024,
        memoryDeltaBytes: 0,
      }
    }
  }, [allIndices, isLazyEnabled, items.length])

  return {
    visibleIndices: isLazyEnabled ? visibleIndices : allIndices,
    isLazyEnabled,
    observe,
    getStats: () => ({ ...renderStatsRef.current }),
  };
}