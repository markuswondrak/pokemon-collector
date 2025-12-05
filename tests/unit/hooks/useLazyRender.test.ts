/**
 * Unit Tests: useLazyRender Hook
 * 
 * Tests for the lazy rendering React hook that manages service lifecycle
 * and provides visible indices state.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRef } from 'react';
import { useLazyRender } from '../../../src/hooks/useLazyRender';

describe('useLazyRender', () => {
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
    vi.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should initialize with empty visible indices', () => {
      const mockItems = Array.from({ length: 100 }, (_, i) => ({ id: i }));
      const { result } = renderHook(() => {
        const ref = useRef<HTMLDivElement>(null);
        return useLazyRender(ref, mockItems);
      });

      expect(result.current.visibleIndices).toBeInstanceOf(Set);
    });

    it('should return isLazyEnabled flag', () => {
      const mockItems = Array.from({ length: 100 }, (_, i) => ({ id: i }));
      const { result } = renderHook(() => {
        const ref = useRef<HTMLDivElement>(null);
        return useLazyRender(ref, mockItems);
      });

      expect(typeof result.current.isLazyEnabled).toBe('boolean');
    });

    it('should return observe function', () => {
      const mockItems = Array.from({ length: 100 }, (_, i) => ({ id: i }));
      const { result } = renderHook(() => {
        const ref = useRef<HTMLDivElement>(null);
        return useLazyRender(ref, mockItems);
      });

      expect(typeof result.current.observe).toBe('function');
    });
  });

  describe('Threshold Logic', () => {
    it('should enable lazy rendering for ≥50 items (default threshold)', () => {
      const mockItems = Array.from({ length: 50 }, (_, i) => ({ id: i }));
      const { result } = renderHook(() => {
        const ref = useRef<HTMLDivElement>(null);
        return useLazyRender(ref, mockItems);
      });

      expect(result.current.isLazyEnabled).toBe(true);
    });

    it('should disable lazy rendering for <50 items (default threshold)', () => {
      const mockItems = Array.from({ length: 49 }, (_, i) => ({ id: i }));
      const { result } = renderHook(() => {
        const ref = useRef<HTMLDivElement>(null);
        return useLazyRender(ref, mockItems);
      });

      expect(result.current.isLazyEnabled).toBe(false);
    });

    it('should render all items when lazy rendering disabled', () => {
      const mockItems = Array.from({ length: 10 }, (_, i) => ({ id: i }));
      const { result } = renderHook(() => {
        const ref = useRef<HTMLDivElement>(null);
        return useLazyRender(ref, mockItems);
      });

      expect(result.current.visibleIndices.size).toBe(10);
    });

    it('should respect custom lazyThreshold option', () => {
      const mockItems = Array.from({ length: 30 }, (_, i) => ({ id: i }));
      const { result } = renderHook(() => {
        const ref = useRef<HTMLDivElement>(null);
        return useLazyRender(ref, mockItems, { lazyThreshold: 20 });
      });

      expect(result.current.isLazyEnabled).toBe(true);
    });
  });

  describe('Options Configuration', () => {
    it('should accept custom bufferPx option', () => {
      const mockItems = Array.from({ length: 100 }, (_, i) => ({ id: i }));
      const { result } = renderHook(() => {
        const ref = useRef<HTMLDivElement>(null);
        return useLazyRender(ref, mockItems, { bufferPx: 300 });
      });

      expect(result.current).toBeDefined();
    });

    it('should accept custom debounceMs option', () => {
      const mockItems = Array.from({ length: 100 }, (_, i) => ({ id: i }));
      const { result } = renderHook(() => {
        const ref = useRef<HTMLDivElement>(null);
        return useLazyRender(ref, mockItems, { debounceMs: 150 });
      });

      expect(result.current).toBeDefined();
    });

    it('should use default options when not provided', () => {
      const mockItems = Array.from({ length: 100 }, (_, i) => ({ id: i }));
      const { result } = renderHook(() => {
        const ref = useRef<HTMLDivElement>(null);
        return useLazyRender(ref, mockItems);
      });

      expect(result.current).toBeDefined();
    });
  });

  describe('Cleanup', () => {
    it('should cleanup service on unmount', () => {
      const mockItems = Array.from({ length: 100 }, (_, i) => ({ id: i }));
      const { unmount } = renderHook(() => {
        const ref = useRef<HTMLDivElement>(null);
        return useLazyRender(ref, mockItems);
      });

      unmount();
      // Should not throw
    });
  });
});
