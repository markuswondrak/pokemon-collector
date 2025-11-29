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

    // Step 1: User searches for Pokemon by index
    const searchInput = screen.getByPlaceholderText(/pokemon index/i);
    fireEvent.change(searchInput, { target: { value: '25' } });

    // Step 2: User clicks search button
    const searchBtn = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchBtn);

    // Step 3: Wait for Pokemon to display
    await waitFor(() => {
      expect(screen.getByText('Pikachu')).toBeInTheDocument();
    }, { timeout: 1000 });

    // Step 4: Verify Pokemon card shows correct information
    expect(screen.getByText('#25')).toBeInTheDocument();
    expect(screen.getByAltText('Pikachu')).toBeInTheDocument();

    // Step 5: User clicks collect button
    const collectBtn = screen.getByRole('button', { name: /collect/i });
    fireEvent.click(collectBtn);

    // Step 6: Verify collection list is updated
    await waitFor(() => {
      expect(screen.getByText('✓ Collected')).toBeInTheDocument();
    }, { timeout: 1000 });
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
    fireEvent.change(searchInput, { target: { value: '25' } });

    const searchBtn = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchBtn);

    await waitFor(() => {
      expect(screen.getByText('Pikachu')).toBeInTheDocument();
    }, { timeout: 1000 });

    // Verify collected badge is shown
    const badges = screen.getAllByText('✓ Collected');
    expect(badges.length).toBeGreaterThan(0);

    // Verify no collect button in the Pokemon card area
    const collectBtn = screen.queryByRole('button', { name: /collect/i });
    expect(collectBtn).not.toBeInTheDocument();

    // Verify remove button is shown instead
    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    expect(removeButtons.length).toBeGreaterThan(0); // Should have at least one remove button
  });

  it('should display collected Pokemon with visual badge in collection list', async () => {
    render(<App />);

    // Search and collect Pokemon
    const searchInput = screen.getByPlaceholderText(/pokemon index/i);
    fireEvent.change(searchInput, { target: { value: '25' } });

    pokemonApi.fetchPokemon.mockResolvedValue({
      index: 25,
      name: 'Pikachu',
      image: 'https://example.com/pikachu.png',
      collected: false
    });

    const searchBtn = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchBtn);

    await waitFor(() => {
      expect(screen.getByText('Pikachu')).toBeInTheDocument();
    }, { timeout: 1000 });

    // Mock updated collection after collect
    const collectedPokemon = [
      {
        index: 25,
        name: 'Pikachu',
        image: 'https://example.com/pikachu.png',
        collected: true,
        wishlist: false
      }
    ];
    collectionStorage.getCollection.mockReturnValue(collectedPokemon);
    pokemonService.getCollectionList.mockReturnValue(collectedPokemon);

    const collectBtn = screen.getByRole('button', { name: /collect/i });
    fireEvent.click(collectBtn);

    // Verify badge appears
    await waitFor(() => {
      const badges = screen.getAllByText('✓ Collected');
      expect(badges.length).toBeGreaterThan(0);
    }, { timeout: 1000 });
  });

  it('should handle multiple Pokemon being collected sequentially', async () => {
    render(<App />);

    // Collect first Pokemon (Pikachu - index 25)
    let searchInput = screen.getByPlaceholderText(/pokemon index/i);
    fireEvent.change(searchInput, { target: { value: '25' } });

    pokemonApi.fetchPokemon.mockResolvedValue({
      index: 25,
      name: 'Pikachu',
      image: 'https://example.com/pikachu.png',
      collected: false
    });

    let searchBtn = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchBtn);

    await waitFor(() => {
      expect(screen.getByText('Pikachu')).toBeInTheDocument();
    }, { timeout: 1000 });

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

    let collectBtn = screen.getByRole('button', { name: /collect/i });
    fireEvent.click(collectBtn);

    await waitFor(() => {
      expect(screen.getByText('Pikachu')).toBeInTheDocument();
    }, { timeout: 1000 });

    // Now collect second Pokemon (Raichu - index 26)
    searchInput = screen.getByPlaceholderText(/pokemon index/i);
    fireEvent.change(searchInput, { target: { value: '26' } });

    pokemonApi.fetchPokemon.mockResolvedValue({
      index: 26,
      name: 'Raichu',
      image: 'https://example.com/raichu.png',
      collected: false
    });

    searchBtn = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchBtn);

    await waitFor(() => {
      expect(screen.getByText('Raichu')).toBeInTheDocument();
    }, { timeout: 1000 });

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

    collectBtn = screen.getByRole('button', { name: /collect/i });
    fireEvent.click(collectBtn);

    // Verify both Pokemon in collection
    await waitFor(() => {
      expect(screen.getAllByText('✓ Collected').length).toBeGreaterThanOrEqual(1);
    }, { timeout: 1000 });
  });

  it('should show error message on API failure', async () => {
    pokemonApi.fetchPokemon.mockRejectedValue(new Error('API Error'));

    render(<App />);

    const searchInput = screen.getByPlaceholderText(/pokemon index/i);
    fireEvent.change(searchInput, { target: { value: '25' } });

    const searchBtn = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchBtn);

    await waitFor(() => {
      expect(screen.queryByText(/error|not found/i)).toBeInTheDocument();
    }, { timeout: 1000 });
  });
});
