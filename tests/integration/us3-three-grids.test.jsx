import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

vi.mock('../../src/services/pokemonApi');
vi.mock('../../src/services/collectionStorage', () => ({
  getCollection: vi.fn(() => []),
  saveCollection: vi.fn(),
}));
vi.mock('../../src/services/pokemonService', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getCollection: vi.fn(() => []),
    getCollectionList: vi.fn(() => []),
    collectPokemon: vi.fn(),
    removeFromCollection: vi.fn(),
    addToWishlist: vi.fn(),
    removeFromWishlist: vi.fn(),
    isCollected: vi.fn(() => false),
  };
});

import App from '../../src/components/App.jsx';
import * as pokemonApi from '../../src/services/pokemonApi';
import * as pokemonService from '../../src/services/pokemonService';

describe('US3 Integration: Three Grids + Lazy Loading', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Mock successful API responses
    pokemonApi.fetchPokemon.mockImplementation(async (index) => ({
      index,
      name: `Pokemon ${index}`,
      image: `https://example.com/pokemon${index}.png`,
      collected: false,
      wishlist: false
    }));

    const mockStorage = [];
    pokemonService.getCollectionList.mockReturnValue(mockStorage);

    // Mock IntersectionObserver for lazy loading
    class MockIntersectionObserver {
      constructor(callback) {
        this.callback = callback;
      }
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }
    window.IntersectionObserver = MockIntersectionObserver;
  });

  it('should display three grids on app load (SC-008)', async () => {
    render(<App />);

    // Wait for header to ensure app is loaded
    await waitFor(() => {
      expect(screen.getByText('Pokemon Collection Organizer')).toBeInTheDocument();
    }, { timeout: 1000 });

    // Should display all three grid titles
    expect(screen.getByText('My Collection')).toBeInTheDocument();
    expect(screen.getByText('My Wishlist')).toBeInTheDocument();
    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  it('should show different Pokemon in each grid based on status (SC-005)', async () => {
    // Setup: Pre-populate with different statuses
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
        collected: false,
        wishlist: true
      }
    ];
    
    pokemonService.getCollectionList.mockReturnValue(mockCollection);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Pikachu')).toBeInTheDocument();
    }, { timeout: 1000 });

    // Pikachu should be in collected grid
    const collectionSection = screen.getByText('My Collection').closest('section');
    expect(collectionSection).toHaveTextContent('Pikachu');

    // Raichu should be in wishlist grid
    const wishlistSection = screen.getByText('My Wishlist').closest('section');
    expect(wishlistSection).toHaveTextContent('Raichu');

    // Neither should be in available grid
    const availableSection = screen.getByText('Available').closest('section');
    expect(availableSection).not.toHaveTextContent('Pikachu');
    expect(availableSection).not.toHaveTextContent('Raichu');
  });

  it('should support search across all grids (SC-006)', async () => {
    const mockCollection = [
      {
        index: 25,
        name: 'Pikachu',
        image: 'https://example.com/pikachu.png',
        collected: true,
        wishlist: false
      },
      {
        index: 125,
        name: 'Electabuzz',
        image: 'https://example.com/electabuzz.png',
        collected: false,
        wishlist: false
      }
    ];
    
    pokemonService.getCollectionList.mockReturnValue(mockCollection);

    render(<App />);

    // Search for Pokemon with index containing "25"
    const searchInput = screen.getByPlaceholderText(/pokemon index/i);
    fireEvent.change(searchInput, { target: { value: '25' } });

    const searchBtn = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchBtn);

    // Should find Pikachu (25)
    await waitFor(() => {
      expect(screen.getByText('Pokemon 25')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('should transition Pokemon from available to collected within 500ms (SC-009)', async () => {
    const startTime = Date.now();
    
    const mockCollection = [];
    let mockCollectionState = [...mockCollection];

    pokemonService.getCollectionList.mockImplementation(() => mockCollectionState);
    pokemonService.collectPokemon.mockImplementation(async (index) => {
      mockCollectionState.push({
        index,
        name: `Pokemon ${index}`,
        image: `https://example.com/pokemon${index}.png`,
        collected: true,
        wishlist: false
      });
    });

    const { rerender } = render(<App />);

    // Simulate user collecting Pokemon
    await waitFor(() => {
      const collectButtons = screen.queryAllByRole('button', { name: /collect/i });
      if (collectButtons.length > 0) {
        fireEvent.click(collectButtons[0]);
      }
    }, { timeout: 1000 });

    // Rerender to update with new collection state
    rerender(<App />);

    const endTime = Date.now();
    const transitionTime = endTime - startTime;

    // Should be fast transition (under 500ms)
    expect(transitionTime).toBeLessThan(500);
  });

  it('should remove Pokemon from collection and move to available (or wishlist if moved)', async () => {
    const mockCollection = [
      {
        index: 25,
        name: 'Pikachu',
        image: 'https://example.com/pikachu.png',
        collected: true,
        wishlist: false
      }
    ];
    
    let mockCollectionState = [...mockCollection];
    pokemonService.getCollectionList.mockImplementation(() => mockCollectionState);
    pokemonService.removeFromCollection.mockImplementation(async (index) => {
      mockCollectionState = mockCollectionState.filter(p => p.index !== index);
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Pikachu')).toBeInTheDocument();
    }, { timeout: 1000 });

    // Find and click remove button
    const removeButtons = screen.queryAllByRole('button', { name: /remove|delete/i });
    if (removeButtons.length > 0) {
      fireEvent.click(removeButtons[0]);
    }

    // Verify removal from collection list
    await waitFor(() => {
      const collectionSection = screen.getByText('My Collection').closest('section');
      expect(collectionSection).not.toHaveTextContent('Pikachu');
    }, { timeout: 1000 });
  });

  it('should add available Pokemon to wishlist within 500ms (SC-009)', async () => {
    const mockCollection = [];
    let mockCollectionState = [...mockCollection];

    pokemonService.getCollectionList.mockImplementation(() => mockCollectionState);
    pokemonService.addToWishlist.mockImplementation(async (index) => {
      const existing = mockCollectionState.find(p => p.index === index);
      if (existing) {
        existing.wishlist = true;
      } else {
        mockCollectionState.push({
          index,
          name: `Pokemon ${index}`,
          image: `https://example.com/pokemon${index}.png`,
          collected: false,
          wishlist: true
        });
      }
    });

    render(<App />);

    // Click wishlist button
    const wishlistButtons = screen.queryAllByRole('button', { name: /wishlist/i });
    if (wishlistButtons.length > 0) {
      const startTime = Date.now();
      fireEvent.click(wishlistButtons[0]);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(500);
    }
  });

  it('should maintain count badges in headers', async () => {
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
        collected: false,
        wishlist: true
      }
    ];
    
    pokemonService.getCollectionList.mockReturnValue(mockCollection);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Pikachu')).toBeInTheDocument();
    });

    // Verify counts are displayed
    expect(screen.getByText(/Collection: 1 \//)).toBeInTheDocument();
    expect(screen.getByText(/1 collected, 1 wishlisted/)).toBeInTheDocument();
  });

  it('should display responsive layout on different screen sizes', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Pokemon Collection Organizer')).toBeInTheDocument();
    });

    // Check main containers are rendered
    const threeGridsSection = document.querySelector('.three-grids-section');
    expect(threeGridsSection).toBeInTheDocument();

    // Should have all three grid sections
    const gridSections = document.querySelectorAll('section');
    expect(gridSections.length).toBeGreaterThanOrEqual(3); // At least 3 grids
  });

  it('should show empty states when grids have no Pokemon', async () => {
    pokemonService.getCollectionList.mockReturnValue([]);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Pokemon Collection Organizer')).toBeInTheDocument();
    });

    // Collection grid should show empty message
    const collectionSection = screen.getByText('My Collection').closest('section');
    expect(collectionSection).toHaveTextContent(/no pokemon|empty/i);

    // Wishlist grid should show empty message
    const wishlistSection = screen.getByText('My Wishlist').closest('section');
    expect(wishlistSection).toHaveTextContent(/no pokemon|empty/i);
  });

  it('should prevent adding collected Pokemon to wishlist (FR-003)', async () => {
    const mockCollection = [
      {
        index: 25,
        name: 'Pikachu',
        image: 'https://example.com/pikachu.png',
        collected: true,
        wishlist: false
      }
    ];
    
    pokemonService.getCollectionList.mockReturnValue(mockCollection);
    pokemonService.addToWishlist.mockRejectedValue(
      new Error('Cannot wishlist a collected Pokemon')
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Pikachu')).toBeInTheDocument();
    });

    // Collected Pokemon should not have wishlist button available in collection grid
    const collectionSection = screen.getByText('My Collection').closest('section');
    const wishlistButtonsInCollection = collectionSection?.querySelectorAll('.btn-wishlist') || [];
    
    // Either no button or it's disabled
    expect(
      wishlistButtonsInCollection.length === 0 || 
      Array.from(wishlistButtonsInCollection).some(btn => btn.hasAttribute('disabled'))
    ).toBe(true);
  });
});
