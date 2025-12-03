import { vi } from 'vitest'

/**
 * Standard mock data for Pokemon tests
 * Includes basic Pokemon for UI testing
 */
const mockPokemonData = {
  1: { index: 1, name: 'Bulbasaur', image: 'https://example.com/1.png' },
  4: { index: 4, name: 'Charmander', image: 'https://example.com/4.png' },
  7: { index: 7, name: 'Squirtle', image: 'https://example.com/7.png' },
  25: { index: 25, name: 'Pikachu', image: 'https://example.com/25.png' },
  39: { index: 39, name: 'Jigglypuff', image: 'https://example.com/39.png' },
}

/**
 * Create mocks for pokemonApi and pokemonService
 * Use in your test file with: setupPokemonMocks()
 */
export function setupPokemonMocks() {
  vi.mock('../../src/services/pokemonApi.ts', () => ({
    fetchPokemon: vi.fn(async (index) => {
      if (!mockPokemonData[index]) {
        throw new Error(`Pokemon ${index} not found`)
      }
      return mockPokemonData[index]
    }),
    fetchMultiplePokemon: vi.fn(async (indices) => {
      return indices.map(
        (index) => mockPokemonData[index] || { index, name: `Pokemon ${index}`, image: null }
      )
    }),
  }))

  vi.mock('../../src/services/pokemonService.ts', () => ({
    searchPokemonByName: vi.fn(async (query) => {
      const allPokemon = Object.values(mockPokemonData)
      return allPokemon.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    }),
    getCollectionList: vi.fn(() => []),
    getCollection: vi.fn(() => []),
    collectPokemon: vi.fn(),
    removeFromCollection: vi.fn(),
    isCollected: vi.fn(() => false),
  }))
}

export { mockPokemonData }
