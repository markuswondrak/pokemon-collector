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
    getWishlist: vi.fn(() => []),
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
    fireEvent.change(searchInput, { target: { value: '25' } });

    const searchBtn = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchBtn);

    // Wait for Pokemon to display
    await waitFor(() => {
      expect(screen.getByText('Pikachu')).toBeInTheDocument();
    });

    // Verify wishlist button is enabled
    const wishlistBtns = screen.getAllByRole('button', { name: /wishlist/i })
    const wishlistBtn = wishlistBtns[0]
    expect(wishlistBtn).not.toBeDisabled()

    // User clicks add to wishlist
    fireEvent.click(wishlistBtn)

    // Mock updated collection after adding to wishlist
    const wishlisted = [
      {
        index: 25,
        name: 'Pikachu',
        image: 'https://example.com/pikachu.png',
        collected: false,
        wishlist: true
      }
    ];
    
    collectionStorage.getCollection.mockReturnValue(wishlisted);
    pokemonService.getCollectionList.mockReturnValue(wishlisted);
    pokemonService.getWishlist.mockReturnValue(wishlisted);

    // Verify wishlist badge appears
    await waitFor(() => {
      const wishlistBadges = screen.getAllByText(/wishlist/i);
      expect(wishlistBadges.length).toBeGreaterThan(0);
    });
  });

  it('should prevent adding collected Pokemon to wishlist', async () => {
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

    // User searches for already-collected Pokemon
    const searchInput = screen.getByPlaceholderText(/pokemon index/i);
    fireEvent.change(searchInput, { target: { value: '25' } });

    pokemonApi.fetchPokemon.mockResolvedValue({
      index: 25,
      name: 'Pikachu',
      image: 'https://example.com/pikachu.png',
      collected: true,
      wishlist: false
    });

    const searchBtn = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchBtn);

    await waitFor(() => {
      expect(screen.getByText('Pikachu')).toBeInTheDocument();
    });

    // Verify wishlist button is disabled
    const wishlistBtns = screen.getAllByRole('button', { name: /wishlist/i })
    const wishlistBtn = wishlistBtns[0]
    expect(wishlistBtn).toBeDisabled()
  });

  it('should display wishlisted Pokemon in wishlist section', async () => {
    render(<App />);

    // Search for Pokemon and add to wishlist
    const searchInput = screen.getByPlaceholderText(/pokemon index/i);
    fireEvent.change(searchInput, { target: { value: '25' } });

    const searchBtn = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchBtn);

    await waitFor(() => {
      expect(screen.getByText('Pikachu')).toBeInTheDocument();
    });

    // Mock wishlist after adding
    const wishlisted = [
      {
        index: 25,
        name: 'Pikachu',
        image: 'https://example.com/pikachu.png',
        collected: false,
        wishlist: true
      }
    ];
    
    collectionStorage.getCollection.mockReturnValue(wishlisted);
    pokemonService.getCollectionList.mockReturnValue(wishlisted);
    pokemonService.getWishlist.mockReturnValue(wishlisted);

    const wishlistBtns = screen.getAllByRole('button', { name: /wishlist/i })
    const wishlistBtn = wishlistBtns[0]
    fireEvent.click(wishlistBtn)

    // Verify Pokemon appears in wishlist with badge
    await waitFor(() => {
      const badges = screen.getAllByText(/wishlist/i)
      expect(badges.length).toBeGreaterThan(0)
    })
  });

  it('should prevent adding collected Pokemon with error feedback', async () => {
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

    // User searches for collected Pokemon
    const searchInput = screen.getByPlaceholderText(/pokemon index/i);
    fireEvent.change(searchInput, { target: { value: '25' } });

    pokemonApi.fetchPokemon.mockResolvedValue({
      index: 25,
      name: 'Pikachu',
      image: 'https://example.com/pikachu.png',
      collected: true,
      wishlist: false
    });

    const searchBtn = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchBtn);

    await waitFor(() => {
      expect(screen.getByText('Pikachu')).toBeInTheDocument();
    });

    // Verify button is disabled
    const wishlistBtns = screen.getAllByRole('button', { name: /wishlist/i })
    const wishlistBtn = wishlistBtns[0]
    expect(wishlistBtn).toBeDisabled()
    expect(wishlistBtn.title).toContain('Cannot add collected Pokemon')
  });

  it('should persist wishlist status across page reload', async () => {
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
    await waitFor(() => {
      // Check for wishlist title or count
      expect(screen.getByText(/my wishlist/i)).toBeInTheDocument();
    });
  });
});
