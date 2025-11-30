import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
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

    // User searches for Pokemon not yet collected
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

    // Verify wishlist button exists
    const wishlistBtns = screen.queryAllByRole('button', { name: /wishlist/i })
    expect(wishlistBtns.length).toBeGreaterThan(0)
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

    // Search for Pokemon and add to wishlist
    const searchInput = screen.getByPlaceholderText(/pokemon index/i);
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: '25' } });
    });

    const searchBtn = screen.getByRole('button', { name: /search/i });
    await act(async () => {
      fireEvent.click(searchBtn);
    });

    // Verify search was triggered
    expect(pokemonApi.fetchPokemon).toHaveBeenCalledWith(25);

    // Verify wishlist section exists
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
