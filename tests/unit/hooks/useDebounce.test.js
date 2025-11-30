import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useDebounce } from '../../../src/hooks/useDebounce'

describe('useDebounce Hook (T001)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('should debounce value after specified delay (300ms default)', () => {
    const { result, rerender } = renderHook(
      ({ value, options }) => useDebounce(value, options),
      { initialProps: { value: 'pika', options: { delay: 300 } } }
    )

    expect(result.current.debouncedValue).toBeUndefined()

    act(() => {
      vi.advanceTimersByTime(299)
    })

    expect(result.current.debouncedValue).toBeUndefined()

    act(() => {
      vi.advanceTimersByTime(1)
    })

    expect(result.current.debouncedValue).toBe('pika')
  })

  it('should reset timer when value changes during debounce', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, { delay: 300 }),
      { initialProps: { value: 'p' } }
    )

    expect(result.current.debouncedValue).toBeUndefined()

    act(() => {
      vi.advanceTimersByTime(200)
    })

    rerender({ value: 'pi' })

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(result.current.debouncedValue).toBeUndefined()

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(result.current.debouncedValue).toBe('pi')
  })

  it('should cleanup timer on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')

    const { unmount } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'test' } }
    )

    unmount()

    expect(clearTimeoutSpy).toHaveBeenCalled()
    clearTimeoutSpy.mockRestore()
  })

  it('should expose isDebouncing state during debounce', () => {
    const { result } = renderHook(
      ({ value }) => useDebounce(value, { delay: 300 }),
      { initialProps: { value: 'pika' } }
    )

    expect(result.current.isDebouncing).toBe(true)

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current.isDebouncing).toBe(false)
  })

  it('should support custom delay', () => {
    const { result } = renderHook(
      ({ value, options }) => useDebounce(value, options),
      { initialProps: { value: 'test', options: { delay: 500 } } }
    )

    expect(result.current.debouncedValue).toBeUndefined()

    act(() => {
      vi.advanceTimersByTime(499)
    })

    expect(result.current.debouncedValue).toBeUndefined()

    act(() => {
      vi.advanceTimersByTime(1)
    })

    expect(result.current.debouncedValue).toBe('test')
  })

  it('should handle empty string values', () => {
    const { result } = renderHook(
      ({ value }) => useDebounce(value, { delay: 300 }),
      { initialProps: { value: '' } }
    )

    expect(result.current.debouncedValue).toBeUndefined()

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current.debouncedValue).toBe('')
  })

  it('should debounce multiple value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, { delay: 300 }),
      { initialProps: { value: '' } }
    )

    rerender({ value: 'p' })
    act(() => {
      vi.advanceTimersByTime(150)
    })

    rerender({ value: 'pi' })
    act(() => {
      vi.advanceTimersByTime(150)
    })

    rerender({ value: 'pik' })
    act(() => {
      vi.advanceTimersByTime(150)
    })

    expect(result.current.debouncedValue).toBeUndefined()

    act(() => {
      vi.advanceTimersByTime(150)
    })

    expect(result.current.debouncedValue).toBe('pik')
  })
})
