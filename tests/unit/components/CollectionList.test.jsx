import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CollectionList from '../../../src/components/CollectionList';

describe('CollectionList Component', () => {
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

  it('should render collection title', () => {
    render(<CollectionList pokemon={mockCollection} title="My Collection" />);

    expect(screen.getByText('My Collection')).toBeInTheDocument();
  });

  it('should render all collected Pokemon', () => {
    render(<CollectionList pokemon={mockCollection} title="My Collection" />);

    expect(screen.getByText('Pikachu')).toBeInTheDocument();
    expect(screen.getByText('Raichu')).toBeInTheDocument();
  });

  it('should display Pokemon count', () => {
    render(<CollectionList pokemon={mockCollection} title="My Collection" />);

    expect(screen.getByText(/2 pokemon/i)).toBeInTheDocument();
  });

  it('should show empty message when no Pokemon', () => {
    render(<CollectionList pokemon={[]} title="My Collection" />);

    expect(screen.getByText(/no pokemon/i)).toBeInTheDocument();
  });

  it('should render collected badge for each Pokemon', () => {
    render(<CollectionList pokemon={mockCollection} title="My Collection" />);

    const badges = screen.getAllByText('✓ Collected');
    expect(badges).toHaveLength(2);
  });

  it('should display Pokemon indices', () => {
    render(<CollectionList pokemon={mockCollection} title="My Collection" />);

    expect(screen.getByText('#25')).toBeInTheDocument();
    expect(screen.getByText('#26')).toBeInTheDocument();
  });

  it('should render Pokemon images with correct URLs', () => {
    render(<CollectionList pokemon={mockCollection} title="My Collection" />);

    const images = screen.getAllByRole('img');
    expect(images[0].src).toContain('pikachu');
    expect(images[1].src).toContain('raichu');
  });

  it('should have proper CSS class for styling', () => {
    const { container } = render(
      <CollectionList pokemon={mockCollection} title="My Collection" />
    );

    expect(container.querySelector('.collection-list')).toBeInTheDocument();
  });

  it('should render list items as individual cards', () => {
    const { container } = render(
      <CollectionList pokemon={mockCollection} title="My Collection" />
    );

    const cards = container.querySelectorAll('.pokemon-card');
    expect(cards.length).toBeGreaterThanOrEqual(2);
  });

  it('should handle empty collection gracefully', () => {
    const { container } = render(
      <CollectionList pokemon={[]} title="My Collection" />
    );

    expect(container.querySelector('.collection-list')).toBeInTheDocument();
  });

  it('should display correct message when single Pokemon in collection', () => {
    const singlePokemon = [mockCollection[0]];
    render(<CollectionList pokemon={singlePokemon} title="My Collection" />);

    expect(screen.getByText(/1 pokemon/i)).toBeInTheDocument();
  });
});
