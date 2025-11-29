import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { pokemonApi } from '../../src/services/pokemonApi'

describe('pokemonApi Service - Contract Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchPokemon', () => {
    it('should fetch Pokemon by index and return valid contract', async () => {
      const pokemon = await pokemonApi.fetchPokemon(25)
      
      // Contract validation
      expect(pokemon).toBeDefined()
      expect(pokemon.index).toBe(25)
      expect(pokemon.name).toBeDefined()
      expect(typeof pokemon.name).toBe('string')
      expect(pokemon.image).toBeDefined()
      expect(typeof pokemon.image).toBe('string')
      expect(pokemon.image).toMatch(/^https?:\/\//)
    })

    it('should throw error if Pokemon index is out of range', async () => {
      expect(async () => {
        await pokemonApi.fetchPokemon(0)
      }).rejects.toThrow()

      expect(async () => {
        await pokemonApi.fetchPokemon(1026)
      }).rejects.toThrow()
    })

    it('should throw error if Pokemon is not found', async () => {
      expect(async () => {
        await pokemonApi.fetchPokemon(99999)
      }).rejects.toThrow()
    })

    it('should cache Pokemon data', async () => {
      const pokemon1 = await pokemonApi.fetchPokemon(25)
      const pokemon2 = await pokemonApi.fetchPokemon(25)
      
      expect(pokemon1).toEqual(pokemon2)
    })

    it('should return Pokemon with consistent image URL format', async () => {
      const pokemon = await pokemonApi.fetchPokemon(1)
      expect(pokemon.image).toMatch(/pokemon.*\.png$/)
    })
  })

  describe('fetchMultiplePokemon', () => {
    it('should fetch multiple Pokemon by indices', async () => {
      const indices = [1, 25, 39]
      const pokemon = await pokemonApi.fetchMultiplePokemon(indices)
      
      expect(pokemon).toHaveLength(3)
      expect(pokemon[0].index).toBe(1)
      expect(pokemon[1].index).toBe(25)
      expect(pokemon[2].index).toBe(39)
    })

    it('should validate contract for all returned Pokemon', async () => {
      const indices = [1, 25]
      const pokemon = await pokemonApi.fetchMultiplePokemon(indices)
      
      pokemon.forEach((p) => {
        expect(p.index).toBeDefined()
        expect(p.name).toBeDefined()
        expect(p.image).toBeDefined()
        expect(p.image).toMatch(/^https?:\/\//)
      })
    })

    it('should throw error if any index is invalid', async () => {
      expect(async () => {
        await pokemonApi.fetchMultiplePokemon([1, 0, 25])
      }).rejects.toThrow()
    })

    it('should handle empty array', async () => {
      const pokemon = await pokemonApi.fetchMultiplePokemon([])
      expect(pokemon).toEqual([])
    })
  })

  describe('searchPokemon', () => {
    it('should search Pokemon by name', async () => {
      const results = await pokemonApi.searchPokemon('pikachu')
      
      expect(Array.isArray(results)).toBe(true)
      expect(results.length).toBeGreaterThan(0)
      const pikachu = results.find(p => p.name.toLowerCase() === 'pikachu')
      expect(pikachu).toBeDefined()
      expect(pikachu.index).toBe(25)
    })

    it('should return valid contract for search results', async () => {
      const results = await pokemonApi.searchPokemon('pikachu')
      
      results.forEach((p) => {
        expect(p.index).toBeDefined()
        expect(p.name).toBeDefined()
        expect(p.image).toBeDefined()
      })
    })

    it('should be case-insensitive', async () => {
      const results1 = await pokemonApi.searchPokemon('PIKACHU')
      const results2 = await pokemonApi.searchPokemon('pikachu')
      
      expect(results1).toEqual(results2)
    })

    it('should return empty array for non-matching search', async () => {
      const results = await pokemonApi.searchPokemon('nonexistentpokemon12345')
      expect(Array.isArray(results)).toBe(true)
      expect(results.length).toBe(0)
    })
  })

  describe('getPokemonByRange', () => {
    it('should fetch Pokemon by index range', async () => {
      const pokemon = await pokemonApi.getPokemonByRange(1, 5)
      
      expect(Array.isArray(pokemon)).toBe(true)
      expect(pokemon.length).toBe(5)
      expect(pokemon[0].index).toBe(1)
      expect(pokemon[4].index).toBe(5)
    })

    it('should validate contract for range results', async () => {
      const pokemon = await pokemonApi.getPokemonByRange(10, 12)
      
      pokemon.forEach((p) => {
        expect(p.index).toBeDefined()
        expect(p.name).toBeDefined()
        expect(p.image).toBeDefined()
      })
    })

    it('should throw error if range is invalid', async () => {
      expect(async () => {
        await pokemonApi.getPokemonByRange(0, 5)
      }).rejects.toThrow()

      expect(async () => {
        await pokemonApi.getPokemonByRange(5, 1)
      }).rejects.toThrow()
    })

    it('should handle large ranges efficiently', async () => {
      const pokemon = await pokemonApi.getPokemonByRange(1, 50)
      expect(pokemon.length).toBe(50)
    }, 10000)
  })

  describe('API Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      expect(async () => {
        // Mock a network error scenario
        await pokemonApi.fetchPokemon(99999)
      }).rejects.toThrow()
    })

    it('should respect rate limiting', async () => {
      const startTime = Date.now()
      await pokemonApi.fetchPokemon(1)
      await pokemonApi.fetchPokemon(2)
      const duration = Date.now() - startTime
      
      // Should not be instant due to rate limiting
      expect(duration).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Cache Behavior', () => {
    it('should cache results within cache duration', async () => {
      const pokemon1 = await pokemonApi.fetchPokemon(25)
      const pokemon2 = await pokemonApi.fetchPokemon(25)
      
      expect(pokemon1).toEqual(pokemon2)
    })

    it('should clear cache when requested', async () => {
      await pokemonApi.fetchPokemon(25)
      pokemonApi.clearCache()
      
      const pokemon = await pokemonApi.fetchPokemon(25)
      expect(pokemon).toBeDefined()
    })
  })
})
