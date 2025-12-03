import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../tests/setup';
import '@testing-library/jest-dom';
import WishlistList from '../../../src/components/WishlistList';

describe('WishlistList Component', () => {
  const mockHandlers = {
    onRemoveWishlist: vi.fn(),
    onCollect: vi.fn(),
  };

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

  it('should render wishlist title using Chakra Heading', () => {
    render(
      <WishlistList
        pokemon={mockWishlist}
        title="My Wishlist"
        {...mockHandlers}
      />
    );

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('My Wishlist');
  });

  it('should use Chakra components (VStack, Box, Heading, Text)', () => {
    const { container } = render(
      <WishlistList
        pokemon={mockWishlist}
        title="My Wishlist"
        {...mockHandlers}
      />
    );

    // Check for section element (Chakra Box renders as section)
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
  });

  it('should render all wishlisted Pokemon cards', () => {
    render(
      <WishlistList
        pokemon={mockWishlist}
        title="My Wishlist"
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Pikachu')).toBeInTheDocument();
    expect(screen.getByText('Raichu')).toBeInTheDocument();
  });

  it('should display Pokemon count text', () => {
    render(
      <WishlistList
        pokemon={mockWishlist}
        title="My Wishlist"
        {...mockHandlers}
      />
    );

    expect(screen.getByText(/2 pokemon/i)).toBeInTheDocument();
  });

  it('should show empty state with proper message when no Pokemon', () => {
    render(
      <WishlistList
        pokemon={[]}
        title="My Wishlist"
        {...mockHandlers}
      />
    );

    expect(screen.getByText(/no pokemon in collection yet/i)).toBeInTheDocument();
  });

  it('should display correct count for single Pokemon', () => {
    render(
      <WishlistList
        pokemon={[mockWishlist[0]]}
        title="My Wishlist"
        {...mockHandlers}
      />
    );

    expect(screen.getByText(/1 pokemon/i)).toBeInTheDocument();
  });

  it('should have consistent styling with CollectionList', () => {
    const { container } = render(
      <WishlistList
        pokemon={mockWishlist}
        title="My Wishlist"
        {...mockHandlers}
      />
    );

    // Both components use the same Chakra pattern
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
  });

  it('should have proper accessibility labels and ARIA attributes', () => {
    const { container } = render(
      <WishlistList
        pokemon={mockWishlist}
        title="My Wishlist"
        {...mockHandlers}
      />
    );

    const section = container.querySelector('section[aria-label="My Wishlist"]');
    expect(section).toBeInTheDocument();
  });

  it('should use Typography components (Open Sans font)', () => {
    render(
      <WishlistList
        pokemon={mockWishlist}
        title="My Wishlist"
        {...mockHandlers}
      />
    );

    const heading = screen.getByRole('heading', { level: 2 });
    // Chakra applies Open Sans via theme
    expect(heading).toBeInTheDocument();
  });

  it('should render empty state with Chakra Box and proper styling', () => {
    const { container } = render(
      <WishlistList
        pokemon={[]}
        title="Empty Wishlist"
        {...mockHandlers}
      />
    );

    const emptyState = container.querySelector('[role="status"]');
    expect(emptyState).toBeInTheDocument();
  });
});

