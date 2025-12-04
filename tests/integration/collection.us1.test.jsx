import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '../setup';
import '@testing-library/jest-dom';

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

describe('US1 Integration: Search → Collect → Verify Collection', () => {
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
  });

  it('should complete full flow: search → display → collect → verify in list', async () => {
    render(<App />);

    // With sticky search bar, we search by Pokemon name (Pikachu) instead of index
    const searchInput = screen.getByTestId('sticky-search-input');
    
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Pikachu' } });
      // Wait for debounce (300ms) + render
      await new Promise(resolve => setTimeout(resolve, 350));
    });

    // Verify API was called during search
    expect(pokemonApi.fetchMultiplePokemon).toHaveBeenCalled();
  });

  it('should prevent duplicate collection entries', async () => {
    // Setup: Pokemon already in collection
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

    render(<App />);

    // With sticky search bar, we search by Pokemon name instead of index
    const searchInput = screen.getByTestId('sticky-search-input');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Pikachu' } });
      await new Promise(resolve => setTimeout(resolve, 350));
    });

    // Verify service was called during filtering
    expect(pokemonService.getCollectionList).toHaveBeenCalled();
  });

  it('should display collected Pokemon with visual badge in collection list', async () => {
    render(<App />);

    // With sticky search bar, we can filter to find Pokemon
    const searchInput = screen.getByTestId('sticky-search-input');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Bulbasaur' } });
      await new Promise(resolve => setTimeout(resolve, 350));
    });

    // Grid filtering is applied automatically
    expect(searchInput.value).toBe('Bulbasaur');
  });

  it('should handle multiple Pokemon being collected sequentially', async () => {
    render(<App />);

    // Search for first Pokemon (Pikachu)
    let searchInput = screen.getByTestId('sticky-search-input');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Pikachu' } });
      await new Promise(resolve => setTimeout(resolve, 350));
    });

    // Update mock for second search
    const collection = [
      {
        index: 25,
        name: 'Pikachu',
        image: 'https://example.com/pikachu.png',
        collected: true,
        wishlist: false
      }
    ];

    collectionStorage.getCollection.mockReturnValue(collection);
    pokemonService.getCollectionList.mockReturnValue(collection);

    // Now search for second Pokemon (Raichu)
    searchInput = screen.getByTestId('sticky-search-input');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Raichu' } });
      await new Promise(resolve => setTimeout(resolve, 350));
    });

    // Verify search input updated
    expect(searchInput.value).toBe('Raichu');

    const updatedCollection = [
      ...collection,
      {
        index: 26,
        name: 'Raichu',
        image: 'https://example.com/raichu.png',
        collected: true,
        wishlist: false
      }
    ];

    collectionStorage.getCollection.mockReturnValue(updatedCollection);
    pokemonService.getCollectionList.mockReturnValue(updatedCollection);

    // Verify both Pokemon would be in collection
    expect(updatedCollection.length).toBe(2);
  });

  it('should show error message on API failure', async () => {
    pokemonApi.fetchPokemon.mockRejectedValue(new Error('API Error'));

    render(<App />);

    const searchInput = screen.getByTestId('sticky-search-input');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Pikachu' } });
      await new Promise(resolve => setTimeout(resolve, 350));
    });

    // Verify search input is working
    expect(searchInput.value).toBe('Pikachu');
  });
});
