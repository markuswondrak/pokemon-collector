import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePokemonIndex } from '../../../src/hooks/usePokemonIndex';
import { pokeApi } from '../../../src/services/api/pokeApi';
import { storageService } from '../../../src/services/storage/localStorage';
import { PokemonRef } from '../../../src/types';

// Mock dependencies
vi.mock('../../../src/services/api/pokeApi', () => ({
  pokeApi: {
    fetchPokemonList: vi.fn(),
  },
}));

vi.mock('../../../src/services/storage/localStorage', () => ({
  storageService: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

describe('usePokemonIndex', () => {
  const mockPokemonList: PokemonRef[] = [
    { id: 1, name: 'bulbasaur', imageUrl: 'url/1.png' },
    { id: 2, name: 'ivysaur', imageUrl: 'url/2.png' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch data from API and store it if storage is empty', async () => {
    // Setup mocks
    (storageService.get as any).mockReturnValue(null);
    (pokeApi.fetchPokemonList as any).mockResolvedValue(mockPokemonList);

    const { result } = renderHook(() => usePokemonIndex());

    // Initial state
    expect(result.current.isLoading).toBe(true);
    expect(result.current.pokemonList).toEqual([]);
    expect(result.current.error).toBeNull();

    // Wait for effect to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify state update
    expect(result.current.pokemonList).toEqual(mockPokemonList);
    expect(result.current.error).toBeNull();

    // Verify interactions
    // expect(storageService.get).toHaveBeenCalledWith('pokemon-collector:index');
    expect(pokeApi.fetchPokemonList).toHaveBeenCalled();
    expect(storageService.set).toHaveBeenCalledWith('pokemon-collector:index', mockPokemonList);
    expect(storageService.set).toHaveBeenCalledWith('pokemon-collector:index-timestamp', expect.any(Number));
  });

  it('should handle API errors', async () => {
    const error = new Error('API Error');
    (storageService.get as any).mockReturnValue(null);
    (pokeApi.fetchPokemonList as any).mockRejectedValue(error);

    const { result } = renderHook(() => usePokemonIndex());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(error);
    expect(result.current.pokemonList).toEqual([]);
  });
});
