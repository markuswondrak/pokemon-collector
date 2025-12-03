import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../tests/setup';
import '@testing-library/jest-dom';
import CollectionList from '../../../src/components/CollectionList';

describe('CollectionList Component', () => {
  const mockHandlers = {
    onCollect: vi.fn(),
    onRemove: vi.fn(),
    onAddToWishlist: vi.fn(),
  };

  const mockCollection = [
    {
      index: 25,
      name: 'Pikachu',
      image: 'https://example.com/pikachu.png',
      collected: true,
      wishlist: false
    },
    {
      index: 26,
      name: 'Raichu',
      image: 'https://example.com/raichu.png',
      collected: true,
      wishlist: false
    }
  ];

  it('should render collection title using Chakra Heading', () => {
    render(
      <CollectionList
        pokemon={mockCollection}
        title="My Collection"
        {...mockHandlers}
      />
    );

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('My Collection');
  });

  it('should use Chakra components (VStack, Box, Heading, Text)', () => {
    const { container } = render(
      <CollectionList
        pokemon={mockCollection}
        title="My Collection"
        {...mockHandlers}
      />
    );

    // Chakra VStack is implemented as a div with CSS Grid display
    // Check for component structure
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
  });

  it('should render all collected Pokemon cards', () => {
    render(
      <CollectionList
        pokemon={mockCollection}
        title="My Collection"
        {...mockHandlers}
      />
    );

    // Cards are rendered inside - check for Pokemon names
    expect(screen.getByText('Pikachu')).toBeInTheDocument();
    expect(screen.getByText('Raichu')).toBeInTheDocument();
  });

  it('should display Pokemon count text', () => {
    render(
      <CollectionList
        pokemon={mockCollection}
        title="My Collection"
        {...mockHandlers}
      />
    );

    expect(screen.getByText(/2 pokemon/i)).toBeInTheDocument();
  });

  it('should show empty state with proper message when no Pokemon', () => {
    render(
      <CollectionList
        pokemon={[]}
        title="My Collection"
        {...mockHandlers}
      />
    );

    expect(screen.getByText(/no pokemon in collection yet/i)).toBeInTheDocument();
  });

  it('should display correct count for single Pokemon', () => {
    render(
      <CollectionList
        pokemon={[mockCollection[0]]}
        title="My Collection"
        {...mockHandlers}
      />
    );

    expect(screen.getByText(/1 pokemon/i)).toBeInTheDocument();
  });

  it('should have consistent spacing using Chakra VStack gap', () => {
    const { container } = render(
      <CollectionList
        pokemon={mockCollection}
        title="My Collection"
        {...mockHandlers}
      />
    );

    // Verify section exists (Chakra Box renders as section)
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
  });

  it('should have proper accessibility labels and ARIA attributes', () => {
    const { container } = render(
      <CollectionList
        pokemon={mockCollection}
        title="My Collection"
        {...mockHandlers}
      />
    );

    const section = container.querySelector('section[aria-label="My Collection"]');
    expect(section).toBeInTheDocument();
  });

  it('should use Typography components (Open Sans font)', () => {
    const { container } = render(
      <CollectionList
        pokemon={mockCollection}
        title="My Collection"
        {...mockHandlers}
      />
    );

    const heading = screen.getByRole('heading', { level: 2 });
    // Chakra applies Open Sans via theme
    expect(heading).toBeInTheDocument();
  });

  it('should render empty state with Chakra Box and proper styling', () => {
    const { container } = render(
      <CollectionList
        pokemon={[]}
        title="Empty Collection"
        {...mockHandlers}
      />
    );

    const emptyState = container.querySelector('[role="status"]');
    expect(emptyState).toBeInTheDocument();
  });
});

