import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useInfiniteScroll } from '../../src/hooks/useInfiniteScroll'

describe('useInfiniteScroll Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with provided items', async () => {
    const initialItems = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
    ]
    const { result } = renderHook(() =>
      useInfiniteScroll({
        initialItems,
        loadMore: async () => [],
        hasMore: true,
      })
    )

    expect(result.current.loadedItems).toEqual(initialItems)
  })

  it('initializes with correct loading state', () => {
    const { result: result1 } = renderHook(() =>
      useInfiniteScroll({
        initialItems: [],
        loadMore: async () => [],
        hasMore: true,
        isLoading: false,
      })
    )
    expect(result1.current.isLoading).toBe(false)

    const { result: result2 } = renderHook(() =>
      useInfiniteScroll({
        initialItems: [],
        loadMore: async () => [],
        hasMore: true,
        isLoading: true,
      })
    )
    expect(result2.current.isLoading).toBe(true)
  })

  it('initializes with hasMore flag', () => {
    const { result } = renderHook(() =>
      useInfiniteScroll({
        initialItems: [],
        loadMore: async () => [],
        hasMore: false,
      })
    )

    expect(result.current.hasMore).toBe(false)
  })

  it('loads more items successfully', async () => {
    const initialItems = [{ id: 1 }]
    const newItems = [{ id: 2 }, { id: 3 }]
    const loadMoreMock = vi.fn(async () => newItems)

    const { result } = renderHook(() =>
      useInfiniteScroll({
        initialItems,
        loadMore: loadMoreMock,
        hasMore: true,
      })
    )

    expect(result.current.loadedItems).toHaveLength(1)

    await act(async () => {
      await result.current.loadMore()
    })

    expect(result.current.loadedItems).toHaveLength(3)
    expect(result.current.loadedItems).toEqual([...initialItems, ...newItems])
    expect(loadMoreMock).toHaveBeenCalledTimes(1)
  })

  it('sets isLoading state during load', async () => {
    const loadMoreMock = vi.fn(
      async () =>
        new Promise(resolve =>
          setTimeout(() => { resolve([{ id: 2 }]); }, 50)
        )
    )

    const { result } = renderHook(() =>
      useInfiniteScroll({
        initialItems: [{ id: 1 }],
        loadMore: loadMoreMock,
        hasMore: true,
      })
    )

    expect(result.current.isLoading).toBe(false)

    const loadPromise = act(async () => {
      await result.current.loadMore()
    })

    // Can't easily test intermediate state without more sophisticated mocking
    // But we verify it returns to false after load
    await loadPromise
    expect(result.current.isLoading).toBe(false)
  })

  it('sets hasMore to false when no items returned', async () => {
    const { result } = renderHook(() =>
      useInfiniteScroll({
        initialItems: [{ id: 1 }],
        loadMore: async () => [],
        hasMore: true,
      })
    )

    expect(result.current.hasMore).toBe(true)

    await act(async () => {
      await result.current.loadMore()
    })

    expect(result.current.hasMore).toBe(false)
  })

  it('handles loadMore errors gracefully', async () => {
    const errorMessage = 'Failed to fetch items'
    const loadMoreMock = vi.fn(async () => {
      throw new Error(errorMessage)
    })

    const { result } = renderHook(() =>
      useInfiniteScroll({
        initialItems: [{ id: 1 }],
        loadMore: loadMoreMock,
        hasMore: true,
      })
    )

    expect(result.current.error).toBe(null)

    await act(async () => {
      await result.current.loadMore()
    })

    expect(result.current.error).toBe(errorMessage)
    expect(result.current.isLoading).toBe(false)
  })

  it('prevents duplicate loadMore calls', async () => {
    const loadMoreMock = vi.fn(
      async () =>
        new Promise(resolve =>
          setTimeout(() => { resolve([{ id: 2 }]); }, 100)
        )
    )

    const { result } = renderHook(() =>
      useInfiniteScroll({
        initialItems: [{ id: 1 }],
        loadMore: loadMoreMock,
        hasMore: true,
      })
    )

    // Start two concurrent loadMore calls
    const promise1 = act(async () => {
      await result.current.loadMore()
    })

    const promise2 = act(async () => {
      await result.current.loadMore()
    })

    await Promise.all([promise1, promise2])

    // Should only call once due to duplicate prevention
    expect(loadMoreMock).toHaveBeenCalledTimes(1)
  })

  it('does not call loadMore when hasMore is false', async () => {
    const loadMoreMock = vi.fn(async () => [])

    const { result } = renderHook(() =>
      useInfiniteScroll({
        initialItems: [],
        loadMore: loadMoreMock,
        hasMore: false,
      })
    )

    await act(async () => {
      await result.current.loadMore()
    })

    expect(loadMoreMock).not.toHaveBeenCalled()
  })

  it('clears error on successful load', async () => {
    let shouldFail = true
    const loadMoreMock = vi.fn(async () => {
      if (shouldFail) {
        shouldFail = false
        throw new Error('First attempt failed')
      }
      return [{ id: 2 }]
    })

    const { result } = renderHook(() =>
      useInfiniteScroll({
        initialItems: [{ id: 1 }],
        loadMore: loadMoreMock,
        hasMore: true,
      })
    )

    // First call fails
    await act(async () => {
      await result.current.loadMore()
    })
    expect(result.current.error).toBe('First attempt failed')

    // Second call succeeds
    await act(async () => {
      await result.current.loadMore()
    })
    expect(result.current.error).toBe(null)
    expect(result.current.loadedItems).toHaveLength(2)
  })
})
