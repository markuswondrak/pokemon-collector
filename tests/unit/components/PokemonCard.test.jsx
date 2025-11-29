import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

    const img = screen.getByAltText('Pikachu');
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

  it('should have proper CSS classes for styling', () => {
    const { container } = render(
      <PokemonCard
        pokemon={mockPokemon}
        onCollect={mockOnCollect}
        onAddToWishlist={mockOnAddToWishlist}
        onRemove={mockOnRemove}
      />
    );

    expect(container.querySelector('.pokemon-card')).toBeInTheDocument();
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
    expect(buttons.length).toBeGreaterThan(0);
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

    const wishlistBtn = screen.queryByRole('button', { name: /wishlist/i });
    if (wishlistBtn) {
      expect(wishlistBtn).toBeDisabled();
    }
  });
});
