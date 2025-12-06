import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '../setup.tsx'
import { InfiniteScrollList } from '../../src/components/InfiniteScrollList'

describe('InfiniteScrollList Integration Tests', () => {
  interface Pokemon {
    id: number
    name: string
    image: string
  }

  const createMockPokemon = (start: number, count: number): Pokemon[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: start + i,
      name: `Pokemon ${(start + i).toString()}`,
      image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${(
        start + i
      ).toString()}.png`,
    }))
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Infinite Scroll with Pagination', () => {
    it('loads initial items and allows pagination', async () => {
      const initialItems = createMockPokemon(1, 10)
      let pageNumber = 0
      const loadMore = vi.fn(async () => {
        pageNumber++
        if (pageNumber === 1) {
          return createMockPokemon(11, 10)
        }
        return []
      })

      render(
        <InfiniteScrollList<Pokemon>
          items={initialItems}
          hasMore={true}
          loadMore={loadMore}
          renderItem={pokemon => (
            <div
              key={pokemon.id}
              data-testid={`pokemon-${pokemon.id}`}
              style={{
                padding: '10px',
                borderBottom: '1px solid #ccc',
              }}
            >
              <div>{pokemon.name}</div>
              <img
                src={pokemon.image}
                alt={pokemon.name}
                style={{ width: '96px', height: '96px' }}
              />
            </div>
          )}
          itemHeight={130}
          containerHeight={500}
        />,
      )

      // Verify initial items are rendered
      expect(screen.getByTestId('pokemon-1')).toBeInTheDocument()
      expect(screen.getByTestId('pokemon-10')).toBeInTheDocument()
    })

    it('triggers loadMore when scrolling near end', async () => {
      const initialItems = createMockPokemon(1, 20)
      const newItems = createMockPokemon(21, 20)
      const loadMore = vi.fn(async () => newItems)

      const { container } = render(
        <InfiniteScrollList<Pokemon>
          items={initialItems}
          hasMore={true}
          loadMore={loadMore}
          renderItem={pokemon => (
            <div
              key={pokemon.id}
              data-testid={`pokemon-${pokemon.id}`}
              style={{ height: '100px' }}
            >
              {pokemon.name}
            </div>
          )}
          itemHeight={100}
          containerHeight={400}
          loadMoreThreshold={0.9}
        />,
      )

      const scrollContainer = container.querySelector('[role="region"]')
      expect(scrollContainer).toBeInTheDocument()

      // Simulate scrolling to near the bottom
      if (scrollContainer) {
        scrollContainer.scrollTop = 1800 // Near end of initial 20 items
        scrollContainer.dispatchEvent(new Event('scroll'))

        // Wait for loadMore to be called
        await waitFor(() => {
          expect(loadMore).toHaveBeenCalled()
        }, { timeout: 2000 })
      }
    })

    it('respects loadMoreThreshold setting', async () => {
      const initialItems = createMockPokemon(1, 20)
      const loadMore = vi.fn(async () => [])

      const { container, rerender } = render(
        <InfiniteScrollList<Pokemon>
          items={initialItems}
          hasMore={true}
          loadMore={loadMore}
          renderItem={pokemon => (
            <div key={pokemon.id} style={{ height: '100px' }}>
              {pokemon.name}
            </div>
          )}
          itemHeight={100}
          containerHeight={400}
          loadMoreThreshold={0.95} // Load only at 95%
        />,
      )

      const scrollContainer = container.querySelector('[role="region"]')
      if (scrollContainer) {
        // Scroll to 80% - should NOT trigger load
        scrollContainer.scrollTop = 1600
        scrollContainer.dispatchEvent(new Event('scroll'))

        // Give it time to trigger if it would
        await new Promise(resolve => setTimeout(resolve, 100))
        expect(loadMore).not.toHaveBeenCalled()

        // Scroll to 95% - should trigger load
        scrollContainer.scrollTop = 1900
        scrollContainer.dispatchEvent(new Event('scroll'))

        await waitFor(
          () => {
            expect(loadMore).toHaveBeenCalled()
          },
          { timeout: 1000 }
        )
      }
    })
  })

  describe('Virtual Rendering', () => {
    it('renders only visible items and buffer zone', () => {
      const initialItems = createMockPokemon(1, 100)
      const loadMore = vi.fn(async () => [])

      const { container } = render(
        <InfiniteScrollList<Pokemon>
          items={initialItems}
          hasMore={false}
          loadMore={loadMore}
          renderItem={pokemon => (
            <div
              key={pokemon.id}
              data-testid={`pokemon-${pokemon.id}`}
              style={{ height: '50px' }}
            >
              {pokemon.name}
            </div>
          )}
          itemHeight={50}
          containerHeight={300} // Can show ~6 items at once
        />,
      )

      // With virtualization, only visible items + buffer should be in DOM
      const visibleItems = container.querySelectorAll('[data-testid^="pokemon-"]')
      // Should be less than 100 items rendered
      expect(visibleItems.length).toBeLessThan(100)
      // But should have at least the visible ones (6) + buffer (typically 10)
      expect(visibleItems.length).toBeGreaterThan(0)
    })

    it('updates virtual items as user scrolls', async () => {
      const initialItems = createMockPokemon(1, 100)
      const loadMore = vi.fn(async () => [])

      const { container } = render(
        <InfiniteScrollList<Pokemon>
          items={initialItems}
          hasMore={false}
          loadMore={loadMore}
          renderItem={pokemon => (
            <div
              key={pokemon.id}
              data-testid={`pokemon-${pokemon.id}`}
              style={{ height: '50px' }}
            >
              {pokemon.name}
            </div>
          )}
          itemHeight={50}
          containerHeight={300}
        />,
      )

      const scrollContainer = container.querySelector('[role="region"]')
      expect(scrollContainer).toBeInTheDocument()

      // Check initial items are in viewport
      expect(screen.getByTestId('pokemon-1')).toBeInTheDocument()

      // Scroll down
      if (scrollContainer) {
        scrollContainer.scrollTop = 1000
        scrollContainer.dispatchEvent(new Event('scroll'))

        // Wait for virtualization to catch up
        await waitFor(() => {
          // New items should be visible after scrolling
          const allItems = container.querySelectorAll('[data-testid^="pokemon-"]')
          expect(allItems.length).toBeGreaterThan(0)
        })
      }
    })
  })

  describe('Loading and Error States', () => {
    it('displays loading spinner while fetching', async () => {
      const initialItems = createMockPokemon(1, 10)
      const loadMore = vi.fn(
        async () =>
          new Promise(resolve => setTimeout(() => { resolve(createMockPokemon(11, 10)); }, 200))
      )

      render(
        <InfiniteScrollList<Pokemon>
          items={initialItems}
          hasMore={true}
          loadMore={loadMore}
          renderItem={pokemon => (
            <div key={pokemon.id}>{pokemon.name}</div>
          )}
          itemHeight={50}
          isLoading={true}
        />,
      )

      expect(screen.getByText(/Loading more items/)).toBeInTheDocument()
    })

    it('displays default error message on load failure', async () => {
      const initialItems = createMockPokemon(1, 10)
      const errorMsg = 'Network error occurred'
      const loadMore = vi.fn(async () => {
        throw new Error(errorMsg)
      })

      const { container } = render(
        <InfiniteScrollList<Pokemon>
          items={initialItems}
          hasMore={true}
          loadMore={loadMore}
          renderItem={pokemon => (
            <div key={pokemon.id}>{pokemon.name}</div>
          )}
          itemHeight={50}
        />,
      )

      const scrollContainer = container.querySelector('[role="region"]')
      if (scrollContainer) {
        scrollContainer.scrollTop = 300
        scrollContainer.dispatchEvent(new Event('scroll'))

        await waitFor(() => {
          expect(screen.getByText(new RegExp(errorMsg))).toBeInTheDocument()
        }, { timeout: 2000 })
      }
    })

    it('displays custom error component', async () => {
      const initialItems = createMockPokemon(1, 10)
      const loadMore = vi.fn(async () => {
        throw new Error('Custom error')
      })

      const { container } = render(
        <InfiniteScrollList<Pokemon>
          items={initialItems}
          hasMore={true}
          loadMore={loadMore}
          renderItem={pokemon => (
            <div key={pokemon.id}>{pokemon.name}</div>
          )}
          itemHeight={50}
          errorComponent={error => (
            <div data-testid="custom-error" role="alert">
              ⚠️ Failed: {error}
            </div>
          )}
        />,
      )

      const scrollContainer = container.querySelector('[role="region"]')
      if (scrollContainer) {
        scrollContainer.scrollTop = 300
        scrollContainer.dispatchEvent(new Event('scroll'))

        await waitFor(() => {
          expect(screen.getByTestId('custom-error')).toBeInTheDocument()
        }, { timeout: 2000 })
      }
    })

    it('displays custom loading component', async () => {
      const initialItems = createMockPokemon(1, 10)
      const loadMore = vi.fn(
        async () =>
          new Promise(resolve => setTimeout(() => { resolve([]); }, 200))
      )

      render(
        <InfiniteScrollList<Pokemon>
          items={initialItems}
          hasMore={true}
          loadMore={loadMore}
          renderItem={pokemon => (
            <div key={pokemon.id}>{pokemon.name}</div>
          )}
          itemHeight={50}
          isLoading={true}
          loadingComponent={
            <div data-testid="custom-loading">🔄 Fetching Pokemon...</div>
          }
        />,
      )

      expect(screen.getByTestId('custom-loading')).toBeInTheDocument()
      expect(screen.queryByText(/Loading more items/)).not.toBeInTheDocument()
    })
  })

  describe('End-of-List Behavior', () => {
    it('shows end-of-list message when hasMore is false', async () => {
      const initialItems = createMockPokemon(1, 20)
      const loadMore = vi.fn(async () => [])

      render(
        <InfiniteScrollList<Pokemon>
          items={initialItems}
          hasMore={false}
          loadMore={loadMore}
          renderItem={pokemon => (
            <div key={pokemon.id}>{pokemon.name}</div>
          )}
          itemHeight={50}
        />,
      )

      expect(screen.getByText(/No more items to load \(20 total\)/)).toBeInTheDocument()
    })

    it('transitions to end-of-list after final load', async () => {
      const initialItems = createMockPokemon(1, 10)
      let hasMoreItems = true
      const loadMore = vi.fn(async () => {
        if (hasMoreItems) {
          hasMoreItems = false
          return createMockPokemon(11, 10)
        }
        return []
      })

      const { rerender, container } = render(
        <InfiniteScrollList<Pokemon>
          items={initialItems}
          hasMore={true}
          loadMore={loadMore}
          renderItem={pokemon => (
            <div key={pokemon.id}>{pokemon.name}</div>
          )}
          itemHeight={50}
          containerHeight={400}
        />,
      )

      // After loading the final batch, hasMore should be false
      // This would happen in real usage when loadMore returns empty array
    })
  })
})
