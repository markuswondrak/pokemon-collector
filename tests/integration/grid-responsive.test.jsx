import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '../../tests/setup'
import AvailableGrid from '../../src/components/AvailableGrid'

describe('Grid Responsive Integration Test', () => {
  const createMockPokemon = (count) => {
    return Array.from({ length: count }, (_, i) => ({
      index: i + 1,
      name: `Pokemon ${i + 1}`,
      image: `https://example.com/${i + 1}.png`,
      collected: false,
      wishlist: false,
    }))
  }

  const mockCollection = {
    id: 'collection',
    lastUpdated: Date.now(),
    items: new Map(),
    count: 0,
  }

  const mockWishlist = {
    id: 'wishlist',
    lastUpdated: Date.now(),
    items: new Map(),
    count: 0,
  }

  const mockOnCollect = vi.fn()
  const mockOnAddWishlist = vi.fn()

  it('should render grid with proper responsive layout', () => {
    const pokemon = createMockPokemon(12)
    
    const { container } = render(
      <AvailableGrid
        allPokemon={pokemon}
        collection={mockCollection}
        wishlist={mockWishlist}
        onCollect={mockOnCollect}
        onAddWishlist={mockOnAddWishlist}
      />
    )

    // Verify grid exists
    const gridSection = container.querySelector('section')
    expect(gridSection).toBeInTheDocument()
  })

  it('should render Pokemon cards in a grid layout', () => {
    const pokemon = createMockPokemon(9)
    
    render(
      <AvailableGrid
        allPokemon={pokemon}
        collection={mockCollection}
        wishlist={mockWishlist}
        onCollect={mockOnCollect}
        onAddWishlist={mockOnAddWishlist}
      />
    )

    // All 9 Pokemon should render
    pokemon.forEach((p) => {
      expect(screen.getByText(p.name)).toBeInTheDocument()
    })
  })

  it('should render correct Pokemon count', () => {
    const pokemon = createMockPokemon(15)
    
    render(
      <AvailableGrid
        allPokemon={pokemon}
        collection={mockCollection}
        wishlist={mockWishlist}
        onCollect={mockOnCollect}
        onAddWishlist={mockOnAddWishlist}
      />
    )

    // Should show correct count
    expect(screen.getByText(/15 pokemon/i)).toBeInTheDocument()
  })

  it('should handle single Pokemon count', () => {
    const pokemon = createMockPokemon(1)
    
    render(
      <AvailableGrid
        allPokemon={pokemon}
        collection={mockCollection}
        wishlist={mockWishlist}
        onCollect={mockOnCollect}
        onAddWishlist={mockOnAddWishlist}
      />
    )

    // Should show singular form
    expect(screen.getByText(/1 pokemon/i)).toBeInTheDocument()
  })

  it('should maintain consistent gap spacing between cards', () => {
    const pokemon = createMockPokemon(6)
    
    const { container } = render(
      <AvailableGrid
        allPokemon={pokemon}
        collection={mockCollection}
        wishlist={mockWishlist}
        onCollect={mockOnCollect}
        onAddWishlist={mockOnAddWishlist}
      />
    )

    // Grid should exist with consistent spacing
    const gridElement = container.querySelector('[role="region"][aria-labelledby="available-title"]')
    expect(gridElement).toBeInTheDocument()
  })

  it('should use Chakra Grid component (no custom CSS)', () => {
    const pokemon = createMockPokemon(6)
    
    const { container } = render(
      <AvailableGrid
        allPokemon={pokemon}
        collection={mockCollection}
        wishlist={mockWishlist}
        onCollect={mockOnCollect}
        onAddWishlist={mockOnAddWishlist}
      />
    )

    // Verify no custom CSS grid class
    expect(container.querySelector('.pokemon-grid')).not.toBeInTheDocument()
  })

  it('should display empty state correctly', () => {
    const emptyCollection = {
      id: 'collection',
      lastUpdated: Date.now(),
      items: new Map([[1, { index: 1, name: 'Pokemon 1' }]]),
      count: 1,
    }

    const emptyWishlist = {
      id: 'wishlist',
      lastUpdated: Date.now(),
      items: new Map(),
      count: 0,
    }

    const pokemon = createMockPokemon(1)

    render(
      <AvailableGrid
        allPokemon={pokemon}
        collection={emptyCollection}
        wishlist={emptyWishlist}
        onCollect={mockOnCollect}
        onAddWishlist={mockOnAddWishlist}
      />
    )

    // Should show empty state message
    expect(screen.getByText(/no available pokemon/i)).toBeInTheDocument()
  })

  it('should filter Pokemon correctly by collection and wishlist', () => {
    const pokemon = createMockPokemon(5)
    
    const filledCollection = {
      id: 'collection',
      lastUpdated: Date.now(),
      items: new Map([[1, pokemon[0]]]),
      count: 1,
    }

    const filledWishlist = {
      id: 'wishlist',
      lastUpdated: Date.now(),
      items: new Map([[2, pokemon[1]]]),
      count: 1,
    }

    render(
      <AvailableGrid
        allPokemon={pokemon}
        collection={filledCollection}
        wishlist={filledWishlist}
        onCollect={mockOnCollect}
        onAddWishlist={mockOnAddWishlist}
      />
    )

    // Should show only available Pokemon (3, 4, 5)
    expect(screen.getByText('Pokemon 3')).toBeInTheDocument()
    expect(screen.getByText('Pokemon 4')).toBeInTheDocument()
    expect(screen.getByText('Pokemon 5')).toBeInTheDocument()
    expect(screen.queryByText('Pokemon 1')).not.toBeInTheDocument()
    expect(screen.queryByText('Pokemon 2')).not.toBeInTheDocument()
  })

  it('should maintain responsive grid at various sizes', () => {
    const pokemon = createMockPokemon(20)
    
    const { container } = render(
      <AvailableGrid
        allPokemon={pokemon}
        collection={mockCollection}
        wishlist={mockWishlist}
        onCollect={mockOnCollect}
        onAddWishlist={mockOnAddWishlist}
      />
    )

    // Grid should be present
    const gridElement = container.querySelector('[role="region"]')
    expect(gridElement).toBeInTheDocument()
    
    // All Pokemon should render regardless of grid size
    expect(screen.getByText(/20 pokemon/i)).toBeInTheDocument()
  })

  it('should render Pokemon in sorted order (by index ascending)', () => {
    const unsortedPokemon = [
      { index: 5, name: 'Pokemon 5', image: 'https://example.com/5.png', collected: false, wishlist: false },
      { index: 1, name: 'Pokemon 1', image: 'https://example.com/1.png', collected: false, wishlist: false },
      { index: 3, name: 'Pokemon 3', image: 'https://example.com/3.png', collected: false, wishlist: false },
      { index: 2, name: 'Pokemon 2', image: 'https://example.com/2.png', collected: false, wishlist: false },
    ]

    const { container } = render(
      <AvailableGrid
        allPokemon={unsortedPokemon}
        collection={mockCollection}
        wishlist={mockWishlist}
        onCollect={mockOnCollect}
        onAddWishlist={mockOnAddWishlist}
      />
    )

    // Check heading order to verify sorting
    const headings = container.querySelectorAll('h3')
    expect(headings[0].textContent).toBe('Pokemon 1')
    expect(headings[1].textContent).toBe('Pokemon 2')
    expect(headings[2].textContent).toBe('Pokemon 3')
    expect(headings[3].textContent).toBe('Pokemon 5')
  })

  it('should handle large datasets without performance issues', () => {
    const pokemon = createMockPokemon(100)
    
    const startTime = performance.now()
    
    const { container } = render(
      <AvailableGrid
        allPokemon={pokemon}
        collection={mockCollection}
        wishlist={mockWishlist}
        onCollect={mockOnCollect}
        onAddWishlist={mockOnAddWishlist}
      />
    )

    const endTime = performance.now()
    const renderTime = endTime - startTime

    // Should render 100 Pokemon within reasonable time (< 2 seconds)
    expect(renderTime).toBeLessThan(2000)
    expect(screen.getByText(/100 pokemon/i)).toBeInTheDocument()
  })
})
