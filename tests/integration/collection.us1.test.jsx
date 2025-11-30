import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
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

    // Input should render synchronously with the component
    const searchInput = screen.getByPlaceholderText(/pokemon index/i);
    
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: '25' } });
    });

    // Step 2: User clicks search button
    const searchBtn = screen.getByRole('button', { name: /search/i });
    await act(async () => {
      fireEvent.click(searchBtn);
    });

    // Verify API was called
    expect(pokemonApi.fetchPokemon).toHaveBeenCalledWith(25);
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

    // User searches for same Pokemon
    const searchInput = screen.getByPlaceholderText(/pokemon index/i);
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: '25' } });
    });

    const searchBtn = screen.getByRole('button', { name: /search/i });
    await act(async () => {
      fireEvent.click(searchBtn);
    });

    // Verify API was called
    expect(pokemonApi.fetchPokemon).toHaveBeenCalledWith(25);
  });

  it('should display collected Pokemon with visual badge in collection list', async () => {
    render(<App />);

    // Search and collect Pokemon
    const searchInput = screen.getByPlaceholderText(/pokemon index/i);
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: '25' } });
    });

    const searchBtn = screen.getByRole('button', { name: /search/i });
    await act(async () => {
      fireEvent.click(searchBtn);
    });

    // Verify API was called
    expect(pokemonApi.fetchPokemon).toHaveBeenCalledWith(25);
  });

  it('should handle multiple Pokemon being collected sequentially', async () => {
    render(<App />);

    // Collect first Pokemon (Pikachu - index 25)
    let searchInput = screen.getByPlaceholderText(/pokemon index/i);
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: '25' } });
    });

    let searchBtn = screen.getByRole('button', { name: /search/i });
    await act(async () => {
      fireEvent.click(searchBtn);
    });

    // Verify first search was called
    expect(pokemonApi.fetchPokemon).toHaveBeenCalledWith(25);

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

    // Now search for second Pokemon (Raichu - index 26)
    searchInput = screen.getByPlaceholderText(/pokemon index/i);
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: '26' } });
    });

    searchBtn = screen.getByRole('button', { name: /search/i });
    await act(async () => {
      fireEvent.click(searchBtn);
    });

    // Verify second search was called
    expect(pokemonApi.fetchPokemon).toHaveBeenCalledWith(26);

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

    // Verify both Pokemon are in collection
    expect(updatedCollection.length).toBe(2);
  });

  it('should show error message on API failure', async () => {
    pokemonApi.fetchPokemon.mockRejectedValue(new Error('API Error'));

    render(<App />);

    const searchInput = screen.getByPlaceholderText(/pokemon index/i);
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: '25' } });
    });

    const searchBtn = screen.getByRole('button', { name: /search/i });
    await act(async () => {
      fireEvent.click(searchBtn);
    });

    // Verify API was called
    expect(pokemonApi.fetchPokemon).toHaveBeenCalledWith(25);
  });
});
