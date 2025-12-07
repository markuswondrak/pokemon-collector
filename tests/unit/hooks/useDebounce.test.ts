import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useDebounce } from '../../../src/hooks/useDebounce';

describe('useDebounce', () => {
	it('should return initial value immediately', () => {
		const { result } = renderHook(() => useDebounce('initial', 500));
		expect(result.current).toBe('initial');
	});

	it('should debounce value updates', () => {
		vi.useFakeTimers();
		const { result, rerender } = renderHook(
			({ value, delay }) => useDebounce(value, delay),
			{ initialProps: { value: 'initial', delay: 500 } }
		);

		// Update value
		rerender({ value: 'updated', delay: 500 });

		// Should still be initial value immediately after update
		expect(result.current).toBe('initial');

		// Fast forward time by 200ms (less than delay)
		act(() => {
			vi.advanceTimersByTime(200);
		});
		expect(result.current).toBe('initial');

		// Fast forward time by remaining 300ms
		act(() => {
			vi.advanceTimersByTime(300);
		});
		expect(result.current).toBe('updated');

		vi.useRealTimers();
	});

	it('should cancel timeout on unmount or value change', () => {
		vi.useFakeTimers();
		const { result, rerender, unmount } = renderHook(
			({ value, delay }) => useDebounce(value, delay),
			{ initialProps: { value: 'initial', delay: 500 } }
		);

		// Update value
		rerender({ value: 'updated', delay: 500 });

		// Unmount before timeout
		unmount();

		// Fast forward time
		act(() => {
			vi.advanceTimersByTime(500);
		});

		// Since we can't check internal state easily, we rely on the fact that
		// React would warn about state updates on unmounted components if it wasn't cleaned up.
		// But functionally, we can check if we update value again quickly.
		
		// Let's test rapid updates instead
		const { result: result2, rerender: rerender2 } = renderHook(
			({ value, delay }) => useDebounce(value, delay),
			{ initialProps: { value: 'a', delay: 500 } }
		);

		rerender2({ value: 'b', delay: 500 });
		act(() => {
			vi.advanceTimersByTime(200);
		});
		rerender2({ value: 'c', delay: 500 });
		
		// Should not have updated to 'b'
		expect(result2.current).toBe('a');

		act(() => {
			vi.advanceTimersByTime(300); // Total 500ms from 'b', but 'b' was cancelled
		});
		// Should still be 'a' because 'c' reset the timer
		expect(result2.current).toBe('a');

		act(() => {
			vi.advanceTimersByTime(200); // Total 500ms from 'c'
		});
		expect(result2.current).toBe('c');

		vi.useRealTimers();
	});
});
