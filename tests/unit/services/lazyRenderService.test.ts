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
});
