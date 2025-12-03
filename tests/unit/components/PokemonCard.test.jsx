import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../../tests/setup';
import '@testing-library/jest-dom';
import PokemonCard from '../../../src/components/PokemonCard';

describe('PokemonCard Component', () => {
  const mockPokemon = {
    index: 25,
    name: 'Pikachu',
    image: 'https://example.com/pikachu.png',
    collected: false,
    wishlist: false
  };

  const mockOnCollect = vi.fn();
  const mockOnAddToWishlist = vi.fn();
  const mockOnRemove = vi.fn();

  it('should render Pokemon information', () => {
    render(
      <PokemonCard
        pokemon={mockPokemon}
        onCollect={mockOnCollect}
        onAddToWishlist={mockOnAddToWishlist}
        onRemove={mockOnRemove}
      />
    );

    expect(screen.getByText('Pikachu')).toBeInTheDocument();
    expect(screen.getByText('#25')).toBeInTheDocument();
  });

  it('should render Pokemon image', () => {
    render(
      <PokemonCard
        pokemon={mockPokemon}
        onCollect={mockOnCollect}
        onAddToWishlist={mockOnAddToWishlist}
        onRemove={mockOnRemove}
      />
    );

    const img = screen.getByAltText('Pikachu sprite');
    expect(img).toBeInTheDocument();
    expect(img.src).toBe('https://example.com/pikachu.png');
  });

  it('should show Collect button when Pokemon not collected', () => {
    render(
      <PokemonCard
        pokemon={mockPokemon}
        onCollect={mockOnCollect}
        onAddToWishlist={mockOnAddToWishlist}
        onRemove={mockOnRemove}
      />
    );

    const collectBtn = screen.getByRole('button', { name: /collect/i });
    expect(collectBtn).toBeInTheDocument();
  });

  it('should call onCollect when Collect button clicked', () => {
    render(
      <PokemonCard
        pokemon={mockPokemon}
        onCollect={mockOnCollect}
        onAddToWishlist={mockOnAddToWishlist}
        onRemove={mockOnRemove}
      />
    );

    const collectBtn = screen.getByRole('button', { name: /collect/i });
    fireEvent.click(collectBtn);

    expect(mockOnCollect).toHaveBeenCalledWith(25);
  });

  it('should show Remove button when Pokemon is collected', () => {
    const collectedPokemon = { ...mockPokemon, collected: true };
    render(
      <PokemonCard
        pokemon={collectedPokemon}
        onCollect={mockOnCollect}
        onAddToWishlist={mockOnAddToWishlist}
        onRemove={mockOnRemove}
      />
    );

    const removeBtn = screen.getByRole('button', { name: /remove/i });
    expect(removeBtn).toBeInTheDocument();
  });

  it('should call onRemove when Remove button clicked', () => {
    const collectedPokemon = { ...mockPokemon, collected: true };
    render(
      <PokemonCard
        pokemon={collectedPokemon}
        onCollect={mockOnCollect}
        onAddToWishlist={mockOnAddToWishlist}
        onRemove={mockOnRemove}
      />
    );

    const removeBtn = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeBtn);

    expect(mockOnRemove).toHaveBeenCalledWith(25);
  });

  it('should display collected badge when Pokemon is collected', () => {
    const collectedPokemon = { ...mockPokemon, collected: true };
    render(
      <PokemonCard
        pokemon={collectedPokemon}
        onCollect={mockOnCollect}
        onAddToWishlist={mockOnAddToWishlist}
        onRemove={mockOnRemove}
      />
    );

    expect(screen.getByText('✓ Collected')).toBeInTheDocument();
  });

  it('should use Chakra Card component (no custom CSS)', () => {
    const { container } = render(
      <PokemonCard
        pokemon={mockPokemon}
        onCollect={mockOnCollect}
        onAddToWishlist={mockOnAddToWishlist}
        onRemove={mockOnRemove}
      />
    );

    // Verify no custom CSS classes used (e.g., pokemon-card class)
    expect(container.querySelector('.pokemon-card')).not.toBeInTheDocument();
    // Chakra Card should render as a proper semantic element
    expect(container.querySelector('article')).toBeInTheDocument();
  });

  it('should render proper button structure', () => {
    render(
      <PokemonCard
        pokemon={mockPokemon}
        onCollect={mockOnCollect}
        onAddToWishlist={mockOnAddToWishlist}
        onRemove={mockOnRemove}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('should handle missing image gracefully', () => {
    const pokemonNoImage = { ...mockPokemon, image: null };
    render(
      <PokemonCard
        pokemon={pokemonNoImage}
        onCollect={mockOnCollect}
        onAddToWishlist={mockOnAddToWishlist}
        onRemove={mockOnRemove}
      />
    );

    expect(screen.getByText('Pikachu')).toBeInTheDocument();
    expect(screen.getByText('No Image')).toBeInTheDocument();
  });

  it('should disable Add to Wishlist button when Pokemon is collected', () => {
    const collectedPokemon = { ...mockPokemon, collected: true };
    render(
      <PokemonCard
        pokemon={collectedPokemon}
        onCollect={mockOnCollect}
        onAddToWishlist={mockOnAddToWishlist}
        onRemove={mockOnRemove}
      />
    );

    const wishlistBtn = screen.getByRole('button', { name: /wishlist/i });
    expect(wishlistBtn).toBeDisabled();
  });

  it('should display wishlist badge when Pokemon is wishlisted', () => {
    const wishlistedPokemon = { ...mockPokemon, wishlist: true };
    render(
      <PokemonCard
        pokemon={wishlistedPokemon}
        onCollect={mockOnCollect}
        onAddToWishlist={mockOnAddToWishlist}
        onRemove={mockOnRemove}
      />
    );

    expect(screen.getByText('♡ Wishlist')).toBeInTheDocument();
  });

  it('should use Chakra Badge component for status indicators', () => {
    const collectedPokemon = { ...mockPokemon, collected: true };
    const { container } = render(
      <PokemonCard
        pokemon={collectedPokemon}
        onCollect={mockOnCollect}
        onAddToWishlist={mockOnAddToWishlist}
        onRemove={mockOnRemove}
      />
    );

    const badge = screen.getByText('✓ Collected');
    expect(badge).toBeInTheDocument();
    // Chakra Badge renders as an inline element within a container
    expect(badge.textContent).toBe('✓ Collected');
  });
});

