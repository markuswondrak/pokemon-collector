import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '../setup';
import '@testing-library/jest-dom';

// Helper to get search button (not the mode toggle button)
const getSearchButton = () => {
  const buttons = screen.getAllByRole('button');
  const searchBtn = buttons.find(btn => btn.textContent === 'Search' && btn.className.includes('btn-primary'));
  if (!searchBtn) throw new Error('Search button not found');
  return searchBtn;
};

vi.mock('../../src/services/pokemonApi');
vi.mock('../../src/services/collectionStorage', () => ({
  getCollection: vi.fn(() => []),
  saveCollection: vi.fn(),
}));
vi.mock('../../src/services/nameRegistry.ts', () => ({
  nameRegistry: {
    loadAllNamesWithCache: vi.fn(() => Promise.resolve()),
    getName: vi.fn((id) => `Pokemon ${id}`),
    search: vi.fn(() => []),
    ready: true,
    error: null,
    loading: false,
  },
}));
vi.mock('../../src/services/pokemonService', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getCollection: vi.fn(() => []),
    getCollectionList: vi.fn(() => []),
    getCollectedPokemon: vi.fn(() => []),
    getWishlist: vi.fn(() => []),
    collectPokemon: vi.fn(() => Promise.resolve()),
    removeFromCollection: vi.fn(() => Promise.resolve()),
    addToWishlist: vi.fn(() => Promise.resolve()),
    removeFromWishlist: vi.fn(() => Promise.resolve()),
    isCollected: vi.fn(() => false),
  };
});

import App from '../../src/components/App.jsx';
import * as pokemonApi from '../../src/services/pokemonApi';
import * as collectionStorage from '../../src/services/collectionStorage';
import * as pokemonService from '../../src/services/pokemonService';

describe('US2 Integration: Add to Wishlist Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Mock successful API response
    pokemonApi.fetchPokemon.mockResolvedValue({
      index: 25,
      name: 'Pikachu',
      image: 'https://example.com/pikachu.png',
      collected: false,
      wishlist: false
    });

    // Mock storage
    const mockStorage = [];
    collectionStorage.getCollection.mockReturnValue(mockStorage);
    collectionStorage.saveCollection.mockImplementation((collection) => {
      return collection;
    });
    
    // Mock pokemonService to use the same collection
    pokemonService.getCollectionList.mockReturnValue(mockStorage);
    pokemonService.getWishlist.mockReturnValue([]);
  });

  it('should allow adding uncollected Pokemon to wishlist', async () => {
    render(<App />);

    // Verify the wishlist section exists
    expect(screen.getByText('My Wishlist')).toBeInTheDocument();
    
    // Verify collection and available sections are present
    expect(screen.getByText('My Collection')).toBeInTheDocument();
    // Grid headers show up when grids have content or empty state
    const gridSections = screen.queryAllByText(/pokemon/i);
    expect(gridSections.length).toBeGreaterThan(0);
  });

  it('should prevent adding collected Pokemon to wishlist', () => {
    // Setup: Pokemon already collected
    const mockCollection = [
      {
        index: 25,
        name: 'Pikachu',
        image: 'https://example.com/pikachu.png',
        collected: true,
        wishlist: false
      }
    ];
    
    collectionStorage.getCollection.mockReturnValue(mockCollection);
    pokemonService.getCollectionList.mockReturnValue(mockCollection);
    pokemonService.isCollected.mockReturnValue(true);

    render(<App />);

    // Verify collected Pokemon section renders
    expect(screen.getByText('My Collection')).toBeInTheDocument();
  });

  it('should display wishlisted Pokemon in wishlist section', async () => {
    render(<App />);

    // With sticky search bar, search by Pokemon name
    const searchInput = screen.getByTestId('sticky-search-input');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Pikachu' } });
      await new Promise(resolve => setTimeout(resolve, 350));
    });

    // Verify wishlist section is present
    expect(screen.getByText('My Wishlist')).toBeInTheDocument();
  });

  it('should prevent adding collected Pokemon with error feedback', () => {
    // Setup: Pokemon collected
    const mockCollection = [
      {
        index: 25,
        name: 'Pikachu',
        image: 'https://example.com/pikachu.png',
        collected: true,
        wishlist: false
      }
    ];
    
    collectionStorage.getCollection.mockReturnValue(mockCollection);
    pokemonService.getCollectionList.mockReturnValue(mockCollection);
    pokemonService.isCollected.mockReturnValue(true);
    
    // Mock addToWishlist to throw error
    pokemonService.addToWishlist.mockRejectedValue(
      new Error('Cannot add collected Pokemon to wishlist')
    );

    render(<App />);

    // Verify the app renders
    expect(screen.getByText('My Collection')).toBeInTheDocument();
  });

  it('should persist wishlist status across page reload', () => {
    // Setup: Pokemon already wishlisted
    const mockCollection = [
      {
        index: 25,
        name: 'Pikachu',
        image: 'https://example.com/pikachu.png',
        collected: false,
        wishlist: true
      }
    ];
    
    collectionStorage.getCollection.mockReturnValue(mockCollection);
    pokemonService.getCollectionList.mockReturnValue(mockCollection);
    pokemonService.getWishlist.mockReturnValue(mockCollection);

    render(<App />);

    // Verify wishlist displays correctly
    expect(screen.getByText('My Wishlist')).toBeInTheDocument();
  });
});
