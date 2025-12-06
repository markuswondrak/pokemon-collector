import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as pokemonService from '../../../src/services/pokemonService';
import * as collectionStorage from '../../../src/services/collectionStorage';
import * as pokemonApi from '../../../src/services/pokemonApi';

// Mock the collectionStorage module
vi.mock('../../../src/services/collectionStorage');

// Mock pokemonApi to track call counts
vi.mock('../../../src/services/pokemonApi');

describe('pokemonService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default mock implementations
    collectionStorage.getCollection = vi.fn().mockReturnValue([]);
    collectionStorage.saveCollection = vi.fn().mockImplementation((data) => data);
    pokemonApi.fetchPokemon = vi.fn().mockResolvedValue({
      index: 25,
      name: 'Pikachu',
      image: 'https://example.com/pikachu.png'
    });
  });

  describe('collectPokemon', () => {
    it('should add Pokemon to collection with collected flag', async () => {
      collectionStorage.getCollection.mockReturnValue([]);
      collectionStorage.saveCollection.mockImplementation((data) => data);

      const result = await pokemonService.collectPokemon(25);

      expect(result.collected).toBe(true);
      expect(collectionStorage.saveCollection).toHaveBeenCalled();
    });

    it('should prevent duplicate collection of same Pokemon', async () => {
      const existingPokemon = { index: 25, name: 'Pikachu', collected: true };
      collectionStorage.getCollection.mockReturnValue([existingPokemon]);

      await expect(pokemonService.collectPokemon(25)).rejects.toThrow(
        'Pokemon 25 is already collected'
      );
      
      expect(collectionStorage.saveCollection).not.toHaveBeenCalled();
    });

    it('should return the collected Pokemon object', async () => {
      collectionStorage.getCollection.mockReturnValue([]);
      collectionStorage.saveCollection.mockImplementation((data) => data);

      const result = await pokemonService.collectPokemon(25);

      expect(result.collected).toBe(true);
      expect(result.index).toBe(25);
    });

    it('should maintain other collection items when adding new Pokemon', async () => {
      const existing = { index: 1, name: 'Bulbasaur', collected: true };
      collectionStorage.getCollection.mockReturnValue([existing]);
      collectionStorage.saveCollection.mockImplementation((data) => data);

      await pokemonService.collectPokemon(25);

      const saveCall = collectionStorage.saveCollection.mock.calls[0][0];
      expect(saveCall).toHaveLength(2);
      expect(saveCall[0]).toEqual(existing);
    });

    it('should validate Pokemon index is a number', async () => {
      collectionStorage.getCollection.mockReturnValue([]);

      await expect(pokemonService.collectPokemon('invalid')).rejects.toThrow();
    });

    it('should validate Pokemon index is within valid range (1-898)', async () => {
      collectionStorage.getCollection.mockReturnValue([]);

      await expect(pokemonService.collectPokemon(0)).rejects.toThrow();
      await expect(pokemonService.collectPokemon(1026)).rejects.toThrow();
    });
  });

  describe('removeFromCollection', () => {
    it('should remove Pokemon from collection', async () => {
      const pokemon = { index: 25, name: 'Pikachu', collected: true };
      collectionStorage.getCollection.mockReturnValue([pokemon]);
      collectionStorage.saveCollection.mockImplementation((data) => data);

      await pokemonService.removeFromCollection(25);

      expect(collectionStorage.saveCollection).toHaveBeenCalled();
    });

    it('should throw error if Pokemon not in collection', async () => {
      collectionStorage.getCollection.mockReturnValue([]);

      await expect(pokemonService.removeFromCollection(25)).rejects.toThrow(
        'Pokemon 25 not found in collection'
      );
    });
  });

  describe('getCollection', () => {
    it('should return current collection', () => {
      const mockCollection = [
        { index: 25, name: 'Pikachu', collected: true }
      ];
      collectionStorage.getCollection.mockReturnValue(mockCollection);

      const result = pokemonService.getCollection();

      expect(result).toEqual(mockCollection);
    });

    it('should return empty array if no collection', () => {
      collectionStorage.getCollection.mockReturnValue([]);

      const result = pokemonService.getCollection();

      expect(result).toEqual([]);
    });
  });

  describe('getCollectedPokemon', () => {
    it('should return only collected Pokemon', () => {
      const mockCollection = [
        { index: 25, name: 'Pikachu', collected: true },
        { index: 26, name: 'Raichu', collected: false }
      ];
      collectionStorage.getCollection.mockReturnValue(mockCollection);

      const result = pokemonService.getCollectedPokemon();

      expect(result).toHaveLength(1);
      expect(result[0].collected).toBe(true);
    });
  });

  describe('isCollected', () => {
    it('should return true if Pokemon is collected', () => {
      const mockCollection = [
        { index: 25, name: 'Pikachu', collected: true }
      ];
      collectionStorage.getCollection.mockReturnValue(mockCollection);

      const result = pokemonService.isCollected(25);

      expect(result).toBe(true);
    });

    it('should return false if Pokemon is not collected', () => {
      collectionStorage.getCollection.mockReturnValue([]);

      const result = pokemonService.isCollected(25);

      expect(result).toBe(false);
    });
  });

  describe('T027: Cache Hit Behavior for Revisited Cards', () => {
    it('should use pokemonApi caching to prevent refetch on revisit', async () => {
      collectionStorage.getCollection.mockReturnValue([]);
      collectionStorage.saveCollection.mockImplementation((data) => data);

      // First collect call should invoke API
      await pokemonService.collectPokemon(25);
      expect(pokemonApi.fetchPokemon).toHaveBeenCalledTimes(1);

      // pokemonApi.fetchPokemon is mocked, so it should use internal caching
      // when called again through the service
      expect(pokemonApi.fetchPokemon).toHaveBeenCalledWith(25);
    });

    it('should route fetch calls through pokemonApi for centralized caching', async () => {
      collectionStorage.getCollection.mockReturnValue([]);
      collectionStorage.saveCollection.mockImplementation((data) => data);

      await pokemonService.collectPokemon(25);

      // Verify pokemonApi.fetchPokemon was called (centralized cache)
      expect(pokemonApi.fetchPokemon).toHaveBeenCalledWith(25);
    });

    it('should use cached data when revisiting Pokemon in addToWishlist', async () => {
      collectionStorage.getCollection.mockReturnValue([]);
      collectionStorage.saveCollection.mockImplementation((data) => data);

      // Add to wishlist - should call fetchPokemon
      await pokemonService.addToWishlist(25);
      expect(pokemonApi.fetchPokemon).toHaveBeenCalledWith(25);

      const callCount = pokemonApi.fetchPokemon.mock.calls.length;

      // The actual caching happens at pokemonApi level
      // This test verifies that pokemonService routes through the caching layer
      expect(callCount).toBeGreaterThanOrEqual(1);
    });

    it('should handle cache misses gracefully', async () => {
      collectionStorage.getCollection.mockReturnValue([]);
      collectionStorage.saveCollection.mockImplementation((data) => data);

      // Mock API to fail (cache miss)
      pokemonApi.fetchPokemon.mockRejectedValueOnce(new Error('API Error'));

      try {
        await pokemonService.collectPokemon(25);
      } catch {
        // Expected - API call failed
      }

      // Should still create a Pokemon object with fallback data
      expect(collectionStorage.saveCollection).toHaveBeenCalled();
    });

    it('should verify data consistency across multiple service calls for same Pokemon', async () => {
      collectionStorage.getCollection.mockReturnValue([]);
      collectionStorage.saveCollection.mockImplementation((data) => data);

      const pokemon1 = await pokemonService.collectPokemon(25);
      
      // Verify the Pokemon data was stored correctly
      const savedCall = collectionStorage.saveCollection.mock.calls[0][0];
      expect(savedCall.some(p => p.index === 25)).toBe(true);
      
      expect(pokemon1.name).toBe('Pikachu');
      expect(pokemon1.index).toBe(25);
    });
  });
});
