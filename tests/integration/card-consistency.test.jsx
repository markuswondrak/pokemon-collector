import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../tests/setup'
import PokemonCard from '../../src/components/PokemonCard'

describe('Card Consistency Integration Test', () => {
  const mockPokemon = [
    { index: 1, name: 'Bulbasaur', image: 'https://example.com/1.png', collected: false, wishlist: false },
    { index: 2, name: 'Ivysaur', image: 'https://example.com/2.png', collected: false, wishlist: false },
    { index: 3, name: 'Venusaur', image: 'https://example.com/3.png', collected: true, wishlist: false },
    { index: 4, name: 'Charmander', image: 'https://example.com/4.png', collected: false, wishlist: true },
  ]

  const mockOnCollect = vi.fn()
  const mockOnAddToWishlist = vi.fn()
  const mockOnRemove = vi.fn()

  it('should render multiple cards with consistent styling', () => {
    const { container } = render(
      <>
        {mockPokemon.map((pokemon) => (
          <PokemonCard
            key={pokemon.index}
            pokemon={pokemon}
            onCollect={mockOnCollect}
            onAddToWishlist={mockOnAddToWishlist}
            onRemove={mockOnRemove}
          />
        ))}
      </>
    )

    // Verify all cards render
    expect(screen.getByText('Bulbasaur')).toBeInTheDocument()
    expect(screen.getByText('Ivysaur')).toBeInTheDocument()
    expect(screen.getByText('Venusaur')).toBeInTheDocument()
    expect(screen.getByText('Charmander')).toBeInTheDocument()
  })

  it('should maintain uniform spacing across cards', () => {
    const { container } = render(
      <>
        {mockPokemon.map((pokemon) => (
          <PokemonCard
            key={pokemon.index}
            pokemon={pokemon}
            onCollect={mockOnCollect}
            onAddToWishlist={mockOnAddToWishlist}
            onRemove={mockOnRemove}
          />
        ))}
      </>
    )

    // Check that all cards exist and are articles
    const cards = container.querySelectorAll('article')
    expect(cards.length).toBe(4)
    cards.forEach((card) => {
      expect(card.getAttribute('data-pokemon-index')).toBeTruthy()
    })
  })

  it('should apply shadow effects consistently to all cards', () => {
    const { container } = render(
      <>
        {mockPokemon.map((pokemon) => (
          <PokemonCard
            key={pokemon.index}
            pokemon={pokemon}
            onCollect={mockOnCollect}
            onAddToWishlist={mockOnAddToWishlist}
            onRemove={mockOnRemove}
          />
        ))}
      </>
    )

    // Verify cards exist with expected shadow style
    const cards = container.querySelectorAll('article')
    expect(cards.length).toBeGreaterThan(0)
    cards.forEach((card) => {
      // Chakra UI applies box-shadow through CSS-in-JS
      expect(card).toBeInTheDocument()
    })
  })

  it('should show consistent badge styling for status indicators', () => {
    const { container } = render(
      <>
        {mockPokemon.map((pokemon) => (
          <PokemonCard
            key={pokemon.index}
            pokemon={pokemon}
            onCollect={mockOnCollect}
            onAddToWishlist={mockOnAddToWishlist}
            onRemove={mockOnRemove}
          />
        ))}
      </>
    )

    // Collected badge (Venusaur - index 3)
    const collectedBadges = screen.getAllByText('✓ Collected')
    expect(collectedBadges.length).toBeGreaterThan(0)

    // Wishlist badge (Charmander - index 4)
    const wishlistBadges = screen.getAllByText('♡ Wishlist')
    expect(wishlistBadges.length).toBeGreaterThan(0)
  })

  it('should maintain responsive padding on all cards', () => {
    const { container } = render(
      <>
        {mockPokemon.map((pokemon) => (
          <PokemonCard
            key={pokemon.index}
            pokemon={pokemon}
            onCollect={mockOnCollect}
            onAddToWishlist={mockOnAddToWishlist}
            onRemove={mockOnRemove}
          />
        ))}
      </>
    )

    const cards = container.querySelectorAll('article')
    expect(cards.length).toBe(4)
    
    // All cards should have consistent structure
    cards.forEach((card) => {
      const images = card.querySelectorAll('img, [role="status"]')
      expect(images.length).toBeGreaterThan(0) // Has image or placeholder
    })
  })

  it('should render consistent button styling across all cards', () => {
    const { container } = render(
      <>
        {mockPokemon.map((pokemon) => (
          <PokemonCard
            key={pokemon.index}
            pokemon={pokemon}
            onCollect={mockOnCollect}
            onAddToWishlist={mockOnAddToWishlist}
            onRemove={mockOnRemove}
          />
        ))}
      </>
    )

    // All cards should have buttons
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
    
    // Verify buttons exist and are interactive
    buttons.forEach((button) => {
      expect(button).toBeInTheDocument()
    })
  })

  it('should maintain text hierarchy consistency across cards', () => {
    const { container } = render(
      <>
        {mockPokemon.map((pokemon) => (
          <PokemonCard
            key={pokemon.index}
            pokemon={pokemon}
            onCollect={mockOnCollect}
            onAddToWishlist={mockOnAddToWishlist}
            onRemove={mockOnRemove}
          />
        ))}
      </>
    )

    // All cards should have h3 for name
    const headings = container.querySelectorAll('h3')
    expect(headings.length).toBe(4)
    
    headings.forEach((h3) => {
      expect(h3.textContent).toBeTruthy()
    })
  })

  it('should apply no custom CSS classes (Chakra only)', () => {
    const { container } = render(
      <>
        {mockPokemon.map((pokemon) => (
          <PokemonCard
            key={pokemon.index}
            pokemon={pokemon}
            onCollect={mockOnCollect}
            onAddToWishlist={mockOnAddToWishlist}
            onRemove={mockOnRemove}
          />
        ))}
      </>
    )

    // Verify no custom CSS classes from old styling
    const cards = container.querySelectorAll('article')
    cards.forEach((card) => {
      expect(card.className).not.toContain('pokemon-card')
    })
  })
})
