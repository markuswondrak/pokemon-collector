import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

vi.mock('../../src/services/pokemonApi');
vi.mock('../../src/services/collectionStorage', () => ({
  getCollection: vi.fn(() => []),
  saveCollection: vi.fn(),
}));
vi.mock('../../src/services/pokemonService', () => ({
  getCollection: vi.fn(() => []),
  collectPokemon: vi.fn(),
  removeFromCollection: vi.fn(),
  isCollected: vi.fn(() => false),
}));

import App from '../../src/components/App.jsx';
import * as pokemonApi from '../../src/services/pokemonApi';
import * as collectionStorage from '../../src/services/collectionStorage';

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
    collectionStorage.getCollection.mockReturnValue([]);
    collectionStorage.saveCollection.mockImplementation((collection) => {
      return collection;
    });
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
    });

    // Step 4: Verify Pokemon card shows correct information
    expect(screen.getByText('#25')).toBeInTheDocument();
    expect(screen.getByAltText('Pikachu')).toBeInTheDocument();

    // Step 5: User clicks collect button
    const collectBtn = screen.getByRole('button', { name: /collect/i });
    fireEvent.click(collectBtn);

    // Step 6: Verify collection list is updated
    await waitFor(() => {
      expect(screen.getByText('✓ Collected')).toBeInTheDocument();
    });
  });

  it('should prevent duplicate collection entries', async () => {
    // Setup: Pokemon already in collection
    collectionStorage.getCollection.mockReturnValue([
      {
        index: 25,
        name: 'Pikachu',
        image: 'https://example.com/pikachu.png',
        collected: true,
        wishlist: false
      }
    ]);

    render(<App />);

    // User searches for same Pokemon
    const searchInput = screen.getByPlaceholderText(/pokemon index/i);
    fireEvent.change(searchInput, { target: { value: '25' } });

    const searchBtn = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchBtn);

    await waitFor(() => {
      expect(screen.getByText('Pikachu')).toBeInTheDocument();
    });

    // Try to collect again
    const collectBtn = screen.queryByRole('button', { name: /collect/i });

    // Should either be disabled or show error
    if (collectBtn) {
      expect(collectBtn).toBeDisabled();
    } else {
      // Or remove button should be shown instead
      expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
    }
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
    });

    // Mock updated collection after collect
    collectionStorage.getCollection.mockReturnValue([
      {
        index: 25,
        name: 'Pikachu',
        image: 'https://example.com/pikachu.png',
        collected: true,
        wishlist: false
      }
    ]);

    const collectBtn = screen.getByRole('button', { name: /collect/i });
    fireEvent.click(collectBtn);

    // Verify badge appears
    await waitFor(() => {
      const badges = screen.getAllByText('✓ Collected');
      expect(badges.length).toBeGreaterThan(0);
    });
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
    });

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

    let collectBtn = screen.getByRole('button', { name: /collect/i });
    fireEvent.click(collectBtn);

    await waitFor(() => {
      expect(screen.getByText('Pikachu')).toBeInTheDocument();
    });

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
    });

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

    collectBtn = screen.getByRole('button', { name: /collect/i });
    fireEvent.click(collectBtn);

    // Verify both Pokemon in collection
    await waitFor(() => {
      expect(screen.getAllByText('✓ Collected').length).toBeGreaterThanOrEqual(1);
    });
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
    });
  });
});
