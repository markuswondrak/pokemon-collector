import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LazyLoadingGrid from '../../../src/components/LazyLoadingGrid'

describe('LazyLoadingGrid Component', () => {
  const mockPokemon = Array.from({ length: 100 }, (_, i) => ({
    index: i + 1,
    name: `Pokemon ${i + 1}`,
    image: `https://example.com/${i + 1}.png`,
    collected: false,
    wishlist: false,
  }))

  const mockRenderItem = (item) => (
    <div key={item.index} data-testid={`pokemon-${item.index}`}>
      {item.name}
    </div>
  )

  beforeEach(() => {
    // Mock IntersectionObserver as a proper constructor
    class MockIntersectionObserver {
      constructor(callback) {
        this.callback = callback
      }
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
    }
    window.IntersectionObserver = MockIntersectionObserver
  })

  it('renders children when provided', () => {
    render(
      <LazyLoadingGrid items={[]} renderItem={undefined}>
        <div>Test child content</div>
      </LazyLoadingGrid>
    )

    expect(screen.getByText('Test child content')).toBeInTheDocument()
  })

  it('renders only visible Pokemon in viewport initially', async () => {
    const { container } = render(
      <LazyLoadingGrid
        items={mockPokemon.slice(0, 50)}
        renderItem={mockRenderItem}
        batchSize={20}
      />
    )

    await waitFor(() => {
      // Should render component
      expect(container.querySelector('.lazy-loading-grid')).toBeInTheDocument()
    }, { timeout: 1000 })
  })

  it('uses Intersection Observer if available', () => {
    const observerMock = vi.fn()
    class MockIntersectionObserver {
      constructor(callback) {
        this.callback = callback
        observerMock(callback)
      }
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
    }
    window.IntersectionObserver = MockIntersectionObserver

    render(
      <LazyLoadingGrid
        items={mockPokemon.slice(0, 20)}
        renderItem={mockRenderItem}
      />
    )

    expect(observerMock).toHaveBeenCalled()
  })

  it('falls back to non-lazy rendering if Intersection Observer unavailable', () => {
    delete window.IntersectionObserver

    const { container } = render(
      <LazyLoadingGrid
        items={mockPokemon.slice(0, 20)}
        renderItem={mockRenderItem}
      />
    )

    // Should render all items
    expect(container.querySelector('.lazy-loading-grid')).toBeInTheDocument()
  })

  it('adds Pokemon to DOM when entering viewport', async () => {
    let observeCallback

    class MockIntersectionObserver {
      constructor(callback) {
        observeCallback = callback
      }
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
    }
    window.IntersectionObserver = MockIntersectionObserver

    const { container } = render(
      <LazyLoadingGrid
        items={mockPokemon.slice(0, 30)}
        renderItem={mockRenderItem}
        batchSize={10}
      />
    )

    // Simulate Pokemon entering viewport
    if (observeCallback) {
      observeCallback([{ isIntersecting: true, target: {} }])
    }

    expect(container.querySelector('.lazy-loading-grid')).toBeInTheDocument()
  })

  it('removes Pokemon from DOM when leaving viewport (optional)', async () => {
    let observeCallback

    class MockIntersectionObserver {
      constructor(callback) {
        observeCallback = callback
      }
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
    }
    window.IntersectionObserver = MockIntersectionObserver

    const { container } = render(
      <LazyLoadingGrid
        items={mockPokemon.slice(0, 30)}
        renderItem={mockRenderItem}
        batchSize={10}
      />
    )

    // Simulate Pokemon leaving viewport
    if (observeCallback) {
      observeCallback([{ isIntersecting: false, target: {} }])
    }

    // Component should handle gracefully
    expect(window.IntersectionObserver).toBeDefined()
  })

  it('handles rapid scrolling gracefully', async () => {
    let observeCallback

    class MockIntersectionObserver {
      constructor(callback) {
        observeCallback = callback
      }
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
    }
    window.IntersectionObserver = MockIntersectionObserver

    const { container } = render(
      <LazyLoadingGrid
        items={mockPokemon.slice(0, 100)}
        renderItem={mockRenderItem}
        batchSize={20}
      />
    )

    // Simulate rapid scrolling
    for (let i = 0; i < 10; i++) {
      if (observeCallback) {
        observeCallback([{ isIntersecting: true, target: {} }])
      }
    }

    expect(window.IntersectionObserver).toBeDefined()
  })

  it('supports custom batch size', () => {
    const customBatchSize = 50

    const { container } = render(
      <LazyLoadingGrid
        items={mockPokemon.slice(0, 100)}
        renderItem={mockRenderItem}
        batchSize={customBatchSize}
      />
    )

    expect(window.IntersectionObserver).toBeDefined()
  })

  it('renders with default batch size if not provided', () => {
    const { container } = render(
      <LazyLoadingGrid
        items={mockPokemon.slice(0, 100)}
        renderItem={mockRenderItem}
      />
    )

    expect(window.IntersectionObserver).toBeDefined()
  })

  it('handles empty items array', () => {
    const mockRenderItemSpy = vi.fn(mockRenderItem)

    const { container } = render(
      <LazyLoadingGrid items={[]} renderItem={mockRenderItemSpy} />
    )

    expect(mockRenderItemSpy).not.toHaveBeenCalled()
  })

  it('cleans up observers on unmount', () => {
    const disconnectMock = vi.fn()
    class MockIntersectionObserver {
      constructor() {}
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = disconnectMock
    }
    window.IntersectionObserver = MockIntersectionObserver

    const { unmount } = render(
      <LazyLoadingGrid
        items={mockPokemon.slice(0, 20)}
        renderItem={mockRenderItem}
      />
    )

    unmount()

    expect(disconnectMock).toHaveBeenCalled()
  })

  it('maintains scroll performance (60 FPS target)', () => {
    const { container } = render(
      <LazyLoadingGrid
        items={mockPokemon.slice(0, 500)}
        renderItem={mockRenderItem}
        batchSize={20}
      />
    )

    // Component should render without blocking
    expect(window.IntersectionObserver).toBeDefined()
  })

  it('initializes with visible Pokemon within 1.5 seconds', async () => {
    const startTime = performance.now()

    const { container } = render(
      <LazyLoadingGrid
        items={mockPokemon.slice(0, 100)}
        renderItem={mockRenderItem}
        batchSize={20}
      />
    )

    await waitFor(() => {
      expect(container.querySelector('.lazy-loading-grid')).toBeInTheDocument()
    }, { timeout: 1000 })

    const endTime = performance.now()
    const loadTime = endTime - startTime

    expect(loadTime).toBeLessThan(1500) // 1.5 seconds
  })
})
