import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import WishlistList from '../../../src/components/WishlistList';

describe('WishlistList Component', () => {
  const mockWishlist = [
    {
      index: 25,
      name: 'Pikachu',
      image: 'https://example.com/pikachu.png',
      collected: false,
      wishlist: true
    },
    {
      index: 26,
      name: 'Raichu',
      image: 'https://example.com/raichu.png',
      collected: false,
      wishlist: true
    }
  ];

  it('should render wishlist title', () => {
    render(
      <WishlistList
        pokemon={mockWishlist}
        title="My Wishlist"
        onRemoveWishlist={() => {}}
        onCollect={() => {}}
      />
    );

    expect(screen.getByText('My Wishlist')).toBeInTheDocument();
  });

  it('should render all wishlisted Pokemon', () => {
    render(
      <WishlistList
        pokemon={mockWishlist}
        title="My Wishlist"
        onRemoveWishlist={() => {}}
        onCollect={() => {}}
      />
    );

    expect(screen.getByText('Pikachu')).toBeInTheDocument();
    expect(screen.getByText('Raichu')).toBeInTheDocument();
  });

  it('should display Pokemon count', () => {
    render(
      <WishlistList
        pokemon={mockWishlist}
        title="My Wishlist"
        onRemoveWishlist={() => {}}
        onCollect={() => {}}
      />
    );

    expect(screen.getByText(/2 pokemon/i)).toBeInTheDocument();
  });

  it('should show empty message when no Pokemon', () => {
    render(
      <WishlistList
        pokemon={[]}
        title="My Wishlist"
        onRemoveWishlist={() => {}}
        onCollect={() => {}}
      />
    );

    expect(screen.getByText(/no pokemon/i)).toBeInTheDocument();
  });

  it('should render wishlist badge for each Pokemon', () => {
    render(
      <WishlistList
        pokemon={mockWishlist}
        title="My Wishlist"
        onRemoveWishlist={() => {}}
        onCollect={() => {}}
      />
    );

    const badges = screen.getAllByText(/wishlist/i);
    expect(badges.length).toBeGreaterThanOrEqual(2);
  });

  it('should display Pokemon indices', () => {
    render(
      <WishlistList
        pokemon={mockWishlist}
        title="My Wishlist"
        onRemoveWishlist={() => {}}
        onCollect={() => {}}
      />
    );

    expect(screen.getByText('#25')).toBeInTheDocument();
    expect(screen.getByText('#26')).toBeInTheDocument();
  });

  it('should render Pokemon images with correct URLs', () => {
    render(
      <WishlistList
        pokemon={mockWishlist}
        title="My Wishlist"
        onRemoveWishlist={() => {}}
        onCollect={() => {}}
      />
    );

    const images = screen.getAllByRole('img');
    expect(images[0].src).toContain('pikachu');
    expect(images[1].src).toContain('raichu');
  });

  it('should have proper CSS class for styling', () => {
    const { container } = render(
      <WishlistList
        pokemon={mockWishlist}
        title="My Wishlist"
        onRemoveWishlist={() => {}}
        onCollect={() => {}}
      />
    );

    expect(container.querySelector('.collection-list')).toBeInTheDocument();
  });

  it('should render list items as individual cards', () => {
    const { container } = render(
      <WishlistList
        pokemon={mockWishlist}
        title="My Wishlist"
        onRemoveWishlist={() => {}}
        onCollect={() => {}}
      />
    );

    const cards = container.querySelectorAll('.pokemon-card');
    expect(cards.length).toBeGreaterThanOrEqual(2);
  });

  it('should handle empty wishlist gracefully', () => {
    const { container } = render(
      <WishlistList
        pokemon={[]}
        title="My Wishlist"
        onRemoveWishlist={() => {}}
        onCollect={() => {}}
      />
    );

    expect(container.querySelector('.collection-list')).toBeInTheDocument();
  });

  it('should display correct message when single Pokemon in wishlist', () => {
    const singlePokemon = [mockWishlist[0]];
    render(
      <WishlistList
        pokemon={singlePokemon}
        title="My Wishlist"
        onRemoveWishlist={() => {}}
        onCollect={() => {}}
      />
    );

    expect(screen.getByText(/1 pokemon/i)).toBeInTheDocument();
  });
});
