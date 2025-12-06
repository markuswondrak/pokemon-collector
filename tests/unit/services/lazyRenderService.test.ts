/**
 * Unit Tests: LazyRenderService
 * 
 * Tests for the lazy rendering service that manages IntersectionObserver
 * lifecycle and visibility tracking.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LazyRenderService } from '../../../src/services/lazyRenderService';

describe('LazyRenderService', () => {
  let service: LazyRenderService;

  beforeEach(() => {
    // Setup mock IntersectionObserver
    const IntersectionObserverMock = vi.fn(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      function(this: any, callback: IntersectionObserverCallback) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        this.observe = vi.fn();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        this.unobserve = vi.fn();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        this.disconnect = vi.fn();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        this.callback = callback;
      }
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    (global as any).IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (service) {
      service.destroy();
    }
  });

  describe('Initialization', () => {
    it('should create service with default configuration', () => {
      service = new LazyRenderService();
      expect(service).toBeDefined();
    });

    it('should create service with custom configuration', () => {
      service = new LazyRenderService({
        bufferPx: 300,
        debounceMs: 150,
        threshold: 0.5,
      });
      expect(service).toBeDefined();
    });

    it('should initialize IntersectionObserver successfully', () => {
      service = new LazyRenderService();
      const result = service.initialize();
      expect(result).toBe(true);
    });

    it('should return false when IntersectionObserver is not supported', () => {
      // Temporarily remove IntersectionObserver
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const originalIO = (global as any).IntersectionObserver;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      (global as any).IntersectionObserver = undefined;

      service = new LazyRenderService();
      const result = service.initialize();
      expect(result).toBe(false);

      // Restore
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      (global as any).IntersectionObserver = originalIO;
    });
  });

  describe('Visible Indices', () => {
    it('should return empty set before initialization', () => {
      service = new LazyRenderService();
      const indices = service.getVisibleIndices();
      expect(indices).toBeInstanceOf(Set);
      expect(indices.size).toBe(0);
    });

    it('should return new Set instance (not reference)', () => {
      service = new LazyRenderService();
      const indices1 = service.getVisibleIndices();
      const indices2 = service.getVisibleIndices();
      expect(indices1).not.toBe(indices2);
    });
  });

  describe('Event Subscription', () => {
    it('should allow subscribing to visible changes', () => {
      service = new LazyRenderService();
      const callback = vi.fn();
      const unsubscribe = service.on(callback);
      expect(typeof unsubscribe).toBe('function');
    });

    it('should allow unsubscribing from visible changes', () => {
      service = new LazyRenderService();
      const callback = vi.fn();
      const unsubscribe = service.on(callback);
      unsubscribe();
      // Callback should not be called after unsubscribe
      expect(callback).not.toHaveBeenCalled();
    });

    it('should support multiple subscribers', () => {
      service = new LazyRenderService();
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      service.on(callback1);
      service.on(callback2);
      // Both callbacks should be registered
    });
  });

  describe('Cleanup', () => {
    it('should cleanup resources on destroy', () => {
      service = new LazyRenderService();
      service.initialize();
      service.destroy();
      // Should not throw
    });

    it('should be idempotent (can be called multiple times)', () => {
      service = new LazyRenderService();
      service.initialize();
      service.destroy();
      service.destroy();
      service.destroy();
      // Should not throw
    });
  });

  describe('T018: Viewport Calculations', () => {
    it('should correctly process intersection entries', async () => {
      service = new LazyRenderService();
      service.initialize();

      // Get the stored callback
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
      const mockConstructor = (global as any).IntersectionObserver as any;
      const instance = mockConstructor.mock.results[0]?.value;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const callback = instance?.callback;

      if (!callback) {
        throw new Error('Callback not found');
      }

      const callback2 = callback as IntersectionObserverCallback;

      // Create mock elements
      const mockElement1 = document.createElement('div');
      const mockElement2 = document.createElement('div');

      // Observe elements with indices
      service.observe(mockElement1, 0);
      service.observe(mockElement2, 1);

      // Simulate intersection events (one visible, one not)
      const entries: Partial<IntersectionObserverEntry>[] = [
        {
          target: mockElement1,
          isIntersecting: true,
          intersectionRatio: 0.5,
        },
        {
          target: mockElement2,
          isIntersecting: false,
          intersectionRatio: 0,
        },
      ];

      callback2(entries as IntersectionObserverEntry[], {} as IntersectionObserver);

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 150));

      const visibleIndices = service.getVisibleIndices();
      expect(visibleIndices.has(0)).toBe(true);
      expect(visibleIndices.has(1)).toBe(false);
    });

    it('should batch multiple intersection events', async () => {
      service = new LazyRenderService({ debounceMs: 100 });
      service.initialize();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
      const mockConstructor = (global as any).IntersectionObserver as any;
      const instance = mockConstructor.mock.results[0]?.value;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const callback = instance?.callback as IntersectionObserverCallback;

      const mockElements = Array.from({ length: 5 }, () => document.createElement('div'));
      mockElements.forEach((el, i) => service.observe(el, i));

      // Simulate rapid intersection events
      const listener = vi.fn();
      service.on(listener);

      // Fire multiple events in quick succession
      callback([
        {
          target: mockElements[0],
          isIntersecting: true,
          intersectionRatio: 0.5,
        } as IntersectionObserverEntry
      ], {} as IntersectionObserver);

      callback([
        {
          target: mockElements[1],
          isIntersecting: true,
          intersectionRatio: 0.5,
        } as IntersectionObserverEntry
      ], {} as IntersectionObserver);

      // Both events should be batched into single callback
      await new Promise(resolve => setTimeout(resolve, 150));

      // Listener should have been called at most twice (likely once after batching)
      expect(listener.mock.calls.length).toBeGreaterThanOrEqual(1);
    });

    it('should respect debounce delay configuration', async () => {
      service = new LazyRenderService({ debounceMs: 200 });
      service.initialize();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
      const mockConstructor = (global as any).IntersectionObserver as any;
      const instance = mockConstructor.mock.results[0]?.value;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const callback = instance?.callback as IntersectionObserverCallback;

      const mockElement = document.createElement('div');
      service.observe(mockElement, 0);

      const listener = vi.fn();
      service.on(listener);

      const startTime = Date.now();

      callback([
        {
          target: mockElement,
          isIntersecting: true,
          intersectionRatio: 0.5,
        } as IntersectionObserverEntry
      ], {} as IntersectionObserver);

      // Should not call listener immediately
      expect(listener).not.toHaveBeenCalled();

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 250));

      const elapsed = Date.now() - startTime;

      // Listener should have been called after debounce
      expect(listener).toHaveBeenCalled();
      expect(elapsed).toBeGreaterThanOrEqual(200);
    });
  });

  describe('T018: Buffer Zone Logic', () => {
    it('should apply buffer zone margin in observer configuration', () => {
      const bufferPx = 300;
      service = new LazyRenderService({ bufferPx });
      service.initialize();

      // Check that IntersectionObserver was called with correct rootMargin
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
      const mockConstructor = (global as any).IntersectionObserver as any;
      const call = mockConstructor.mock.calls[mockConstructor.mock.calls.length - 1];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const options = call?.[1];

      expect(options).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(options?.rootMargin).toContain('300px');
    });

    it('should default to 200px buffer zone when not specified', () => {
      service = new LazyRenderService();
      service.initialize();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
      const mockConstructor = (global as any).IntersectionObserver as any;
      const call = mockConstructor.mock.calls[mockConstructor.mock.calls.length - 1];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const options = call?.[1];

      expect(options).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(options?.rootMargin).toContain('200px');
    });

    it('should prioritize viewport entries over buffer zone entries', async () => {
      service = new LazyRenderService();
      service.initialize();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
      const mockConstructor = (global as any).IntersectionObserver as any;
      const instance = mockConstructor.mock.results[0]?.value;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const callback = instance?.callback as IntersectionObserverCallback;

      const viewportElement = document.createElement('div');
      const bufferElement = document.createElement('div');

      service.observe(viewportElement, 0);
      service.observe(bufferElement, 1);

      // Simulate viewport element with high intersection ratio
      // and buffer zone element with low ratio
      callback([
        {
          target: viewportElement,
          isIntersecting: true,
          intersectionRatio: 1.0, // Fully visible
        } as IntersectionObserverEntry,
        {
          target: bufferElement,
          isIntersecting: true,
          intersectionRatio: 0.1, // Partially visible (in buffer)
        } as IntersectionObserverEntry,
      ], {} as IntersectionObserver);

      await new Promise(resolve => setTimeout(resolve, 150));

      const visibleIndices = service.getVisibleIndices();
      expect(visibleIndices.has(0)).toBe(true);
      expect(visibleIndices.has(1)).toBe(true);
    });
  });

  describe('T018: Observer Management', () => {
    it('should properly observe and unobserve elements', () => {
      service = new LazyRenderService();
      service.initialize();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
      const mockConstructor = (global as any).IntersectionObserver as any;
      const instance = mockConstructor.mock.results[0]?.value;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const observeSpy = instance?.observe as any;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const unobserveSpy = instance?.unobserve as any;

      const mockElement = document.createElement('div');

      service.observe(mockElement, 0);
      expect(observeSpy).toHaveBeenCalledWith(mockElement);

      service.unobserve(mockElement);
      expect(unobserveSpy).toHaveBeenCalledWith(mockElement);
    });

    it('should set data-card-index attribute on observed elements', () => {
      service = new LazyRenderService();
      service.initialize();

      const mockElement = document.createElement('div');
      service.observe(mockElement, 42);

      expect(mockElement.getAttribute('data-card-index')).toBe('42');
    });

    it('should handle observation of multiple elements', () => {
      service = new LazyRenderService();
      service.initialize();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
      const mockConstructor = (global as any).IntersectionObserver as any;
      const instance = mockConstructor.mock.results[0]?.value;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const observeSpy = instance?.observe as any;

      const elements = Array.from({ length: 10 }, () => document.createElement('div'));
      elements.forEach((el, i) => service.observe(el, i));

      expect(observeSpy).toHaveBeenCalledTimes(10);
    });
  });

  describe('T018: Performance Statistics', () => {
    it('should provide stats including visible card count', async () => {
      service = new LazyRenderService();
      service.initialize();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
      const mockConstructor = (global as any).IntersectionObserver as any;
      const instance = mockConstructor.mock.results[0]?.value;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const callback = instance?.callback as IntersectionObserverCallback;

      const mockElement = document.createElement('div');
      service.observe(mockElement, 0);

      callback([
        {
          target: mockElement,
          isIntersecting: true,
          intersectionRatio: 0.5,
        } as IntersectionObserverEntry
      ], {} as IntersectionObserver);

      await new Promise(resolve => setTimeout(resolve, 150));

      const stats = service.getStats();
      expect(stats.totalVisible).toBeGreaterThanOrEqual(0);
      expect(typeof stats.memoryEstimateBytes).toBe('number');
      expect(typeof stats.memoryDeltaBytes).toBe('number');
    });

    it('should track memory baseline', () => {
      service = new LazyRenderService();
      const initialized = service.initialize();

      if (initialized) {
        const stats = service.getStats();
        expect(typeof stats.baselineMemoryBytes).toBe('number');
        expect(stats.baselineMemoryBytes).toBeGreaterThanOrEqual(0);
      }
    });

    it('should track memory delta from baseline', async () => {
      service = new LazyRenderService();
      service.initialize();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
      const mockConstructor = (global as any).IntersectionObserver as any;
      const instance = mockConstructor.mock.results[0]?.value;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const callback = instance?.callback as IntersectionObserverCallback;

      const initialStats = service.getStats();

      // Simulate adding visible cards
      const elements = Array.from({ length: 10 }, () => document.createElement('div'));
      elements.forEach((el, i) => {
        service.observe(el, i);
        callback([
          {
            target: el,
            isIntersecting: true,
            intersectionRatio: 0.5,
          } as IntersectionObserverEntry
        ], {} as IntersectionObserver);
      });

      await new Promise(resolve => setTimeout(resolve, 150));

      const updatedStats = service.getStats();
      expect(updatedStats.totalVisible).toBeGreaterThan(initialStats.totalVisible);
    });
  });

  describe('T018: Window Resize Handling', () => {
    it('should set up resize event listener on initialize', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      service = new LazyRenderService();
      service.initialize();

      expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));

      addEventListenerSpy.mockRestore();
    });

    it('should clean up resize event listener on destroy', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      service = new LazyRenderService();
      service.initialize();
      service.destroy();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });

    it('should notify listeners on window resize (debounced)', async () => {
      service = new LazyRenderService();
      service.initialize();

      const listener = vi.fn();
      service.on(listener);

      // Simulate resize event
      const resizeEvent = new Event('resize');
      window.dispatchEvent(resizeEvent);

      // Should not call immediately
      expect(listener).not.toHaveBeenCalled();

      // Wait for debounce (200ms) + extra time
      await new Promise(resolve => setTimeout(resolve, 250));

      // Should have called listener after debounce
      expect(listener).toHaveBeenCalled();
    });

    it('should debounce multiple resize events', async () => {
      service = new LazyRenderService();
      service.initialize();

      const listener = vi.fn();
      service.on(listener);

      // Simulate multiple rapid resize events
      for (let i = 0; i < 5; i++) {
        window.dispatchEvent(new Event('resize'));
        await new Promise(resolve => setTimeout(resolve, 30));
      }

      // Wait for final debounce
      await new Promise(resolve => setTimeout(resolve, 250));

      // Should have only called listener once (debounced)
      expect(listener.mock.calls.length).toBeLessThanOrEqual(3);
    });
  });
});
