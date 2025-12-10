import { renderHook, waitFor, act } from '@testing-library/react';
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
    { id: 1, name: 'bulbasaur', imageUrl: 'url/1.png', types: ['grass', 'poison'] },
    { id: 2, name: 'ivysaur', imageUrl: 'url/2.png', types: ['grass', 'poison'] },
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

  it('should use cached data if available and valid (within 24h)', async () => {
    const now = Date.now();
    const validTimestamp = now - (23 * 60 * 60 * 1000); // 23 hours ago
    
    (storageService.get as any).mockImplementation((key: string) => {
      if (key === 'pokemon-collector:index') return mockPokemonList;
      if (key === 'pokemon-collector:index-timestamp') return validTimestamp;
      return null;
    });

    const { result } = renderHook(() => usePokemonIndex());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.pokemonList).toEqual(mockPokemonList);
    expect(pokeApi.fetchPokemonList).not.toHaveBeenCalled();
  });

  it('should fetch new data if cache is expired (> 24h)', async () => {
    const now = Date.now();
    const expiredTimestamp = now - (25 * 60 * 60 * 1000); // 25 hours ago
    
    (storageService.get as any).mockImplementation((key: string) => {
      if (key === 'pokemon-collector:index') return mockPokemonList;
      if (key === 'pokemon-collector:index-timestamp') return expiredTimestamp;
      return null;
    });

    (pokeApi.fetchPokemonList as any).mockResolvedValue(mockPokemonList);

    const { result } = renderHook(() => usePokemonIndex());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(pokeApi.fetchPokemonList).toHaveBeenCalled();
    expect(storageService.set).toHaveBeenCalledWith('pokemon-collector:index', mockPokemonList);
    expect(storageService.set).toHaveBeenCalledWith('pokemon-collector:index-timestamp', expect.any(Number));
  });

  it('should retry fetching data when retry is called', async () => {
    const error = new Error('API Error');
    (storageService.get as any).mockReturnValue(null);
    (pokeApi.fetchPokemonList as any)
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce(mockPokemonList);

    const { result } = renderHook(() => usePokemonIndex());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(error);

    // Call retry
    act(() => {
      result.current.retry();
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.pokemonList).toEqual(mockPokemonList);
    expect(result.current.error).toBeNull();
    expect(pokeApi.fetchPokemonList).toHaveBeenCalledTimes(2);
  });
});
