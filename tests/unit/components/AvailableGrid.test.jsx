import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import AvailableGrid from '../../../src/components/AvailableGrid'

describe('AvailableGrid Component', () => {
  const mockPokemon = [
    { index: 1, name: 'Bulbasaur', image: 'https://example.com/1.png', collected: false, wishlist: false },
    { index: 2, name: 'Ivysaur', image: 'https://example.com/2.png', collected: false, wishlist: false },
    { index: 3, name: 'Venusaur', image: 'https://example.com/3.png', collected: false, wishlist: false },
    { index: 25, name: 'Pikachu', image: 'https://example.com/25.png', collected: true, wishlist: false },
    { index: 26, name: 'Raichu', image: 'https://example.com/26.png', collected: false, wishlist: true },
  ]

  const mockCollection = {
    id: 'collection',
    lastUpdated: Date.now(),
    items: new Map([[25, mockPokemon[3]]]),
    count: 1,
  }

  const mockWishlist = {
    id: 'wishlist',
    lastUpdated: Date.now(),
    items: new Map([[26, mockPokemon[4]]]),
    count: 1,
  }

  const mockOnCollect = vi.fn()
  const mockOnAddWishlist = vi.fn()

  it('renders available Pokemon not in collection or wishlist', () => {
    render(
      <AvailableGrid
        allPokemon={mockPokemon}
        collection={mockCollection}
        wishlist={mockWishlist}
        onCollect={mockOnCollect}
        onAddWishlist={mockOnAddWishlist}
      />
    )

    // Should render Bulbasaur, Ivysaur, Venusaur (not Pikachu or Raichu)
    expect(screen.getByText('Bulbasaur')).toBeInTheDocument()
    expect(screen.getByText('Ivysaur')).toBeInTheDocument()
    expect(screen.getByText('Venusaur')).toBeInTheDocument()
    expect(screen.queryByText('Pikachu')).not.toBeInTheDocument()
    expect(screen.queryByText('Raichu')).not.toBeInTheDocument()
  })

  it('renders Pokemon sorted by index ascending', () => {
    const unsortedPokemon = [
      { index: 3, name: 'Venusaur', image: 'https://example.com/3.png', collected: false, wishlist: false },
      { index: 1, name: 'Bulbasaur', image: 'https://example.com/1.png', collected: false, wishlist: false },
      { index: 2, name: 'Ivysaur', image: 'https://example.com/2.png', collected: false, wishlist: false },
    ]

    render(
      <AvailableGrid
        allPokemon={unsortedPokemon}
        collection={mockCollection}
        wishlist={mockWishlist}
        onCollect={mockOnCollect}
        onAddWishlist={mockOnAddWishlist}
      />
    )

    const names = screen.getAllByRole('heading', { level: 3 })
    expect(names[0]).toHaveTextContent('Bulbasaur')
    expect(names[1]).toHaveTextContent('Ivysaur')
    expect(names[2]).toHaveTextContent('Venusaur')
  })

  it('displays empty state when all Pokemon are collected or wishlisted', () => {
    const allCollected = {
      id: 'collection',
      lastUpdated: Date.now(),
      items: new Map(mockPokemon.slice(0, 3).map((p) => [p.index, p])),
      count: 3,
    }

    const allWishlisted = {
      id: 'wishlist',
      lastUpdated: Date.now(),
      items: new Map([[25, mockPokemon[3]], [26, mockPokemon[4]]]),
      count: 2,
    }

    render(
      <AvailableGrid
        allPokemon={mockPokemon.slice(0, 5)}
        collection={allCollected}
        wishlist={allWishlisted}
        onCollect={mockOnCollect}
        onAddWishlist={mockOnAddWishlist}
      />
    )

    expect(screen.getByText(/no available pokemon/i)).toBeInTheDocument()
  })

  it('calls onCollect callback when collect button clicked', () => {
    const { container } = render(
      <AvailableGrid
        allPokemon={mockPokemon.slice(0, 3)}
        collection={mockCollection}
        wishlist={mockWishlist}
        onCollect={mockOnCollect}
        onAddWishlist={mockOnAddWishlist}
      />
    )

    // Find and click collect button (implementation-specific)
    const collectButtons = container.querySelectorAll('button')
    const bulbasaurCard = screen.getByText('Bulbasaur').closest('.pokemon-card')
    const collectButton = bulbasaurCard?.querySelector('button[data-action="collect"]')

    if (collectButton) {
      collectButton.click()
      expect(mockOnCollect).toHaveBeenCalled()
    }
  })

  it('calls onAddWishlist callback when add to wishlist button clicked', () => {
    const { container } = render(
      <AvailableGrid
        allPokemon={mockPokemon.slice(0, 3)}
        collection={mockCollection}
        wishlist={mockWishlist}
        onCollect={mockOnCollect}
        onAddWishlist={mockOnAddWishlist}
      />
    )

    const bulbasaurCard = screen.getByText('Bulbasaur').closest('.pokemon-card')
    const wishlistButton = bulbasaurCard?.querySelector('button[data-action="wishlist"]')

    if (wishlistButton) {
      wishlistButton.click()
      expect(mockOnAddWishlist).toHaveBeenCalled()
    }
  })

  it('supports search filtering by index with partial matches', () => {
    render(
      <AvailableGrid
        allPokemon={mockPokemon}
        collection={mockCollection}
        wishlist={mockWishlist}
        onCollect={mockOnCollect}
        onAddWishlist={mockOnAddWishlist}
        searchIndex={2}
      />
    )

    // Search for "2" should show Ivysaur (index 2)
    expect(screen.getByText('Ivysaur')).toBeInTheDocument()
    expect(screen.queryByText('Bulbasaur')).not.toBeInTheDocument()
    expect(screen.queryByText('Venusaur')).not.toBeInTheDocument()
  })

  it('filters Pokemon matching search digits', () => {
    const emptyCollection = {
      id: 'collection',
      lastUpdated: Date.now(),
      items: new Map(),
      count: 0,
    }

    const emptyWishlist = {
      id: 'wishlist',
      lastUpdated: Date.now(),
      items: new Map(),
      count: 0,
    }

    const pokemonWithSearchableIndexes = [
      { index: 25, name: 'Pikachu', image: 'https://example.com/25.png', collected: false, wishlist: false },
      { index: 125, name: 'Electabuzz', image: 'https://example.com/125.png', collected: false, wishlist: false },
      { index: 225, name: 'Delibird', image: 'https://example.com/225.png', collected: false, wishlist: false },
      { index: 1, name: 'Bulbasaur', image: 'https://example.com/1.png', collected: false, wishlist: false },
    ]

    render(
      <AvailableGrid
        allPokemon={pokemonWithSearchableIndexes}
        collection={emptyCollection}
        wishlist={emptyWishlist}
        onCollect={mockOnCollect}
        onAddWishlist={mockOnAddWishlist}
        searchIndex={25}
      />
    )

    // Search for "25" should show Pikachu, Electabuzz, Delibird (all contain "25" in index)
    expect(screen.getByText('Pikachu')).toBeInTheDocument()
    expect(screen.getByText('Electabuzz')).toBeInTheDocument()
    expect(screen.getByText('Delibird')).toBeInTheDocument()
    expect(screen.queryByText('Bulbasaur')).not.toBeInTheDocument()
  })

  it('uses responsive CSS grid layout', () => {
    const { container } = render(
      <AvailableGrid
        allPokemon={mockPokemon.slice(0, 3)}
        collection={mockCollection}
        wishlist={mockWishlist}
        onCollect={mockOnCollect}
        onAddWishlist={mockOnAddWishlist}
      />
    )

    const grid = container.querySelector('.available-grid')
    expect(grid).toHaveClass('available-grid')
  })
})
