import '@testing-library/jest-dom'
import { configure, screen } from '@testing-library/react'

// Set global timeout for waitFor commands to 1 second
// This is a hard requirement for all tests in this project
configure({ asyncUtilTimeout: 1000 })

// Test utility: Get the search button specifically (not the mode toggle)
// eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
  namespace Vi {
    interface TestContext {
      getSearchButton: () => HTMLButtonElement
    }
  }
}

// Export utility for tests to use
export function getSearchButton(): HTMLButtonElement {
  const buttons = screen.getAllByRole('button')
  const searchBtn = buttons.find(btn => btn.textContent === 'Search' && btn.className.includes('btn-primary'))
  if (!searchBtn) {
    throw new Error('Search button not found')
  }
  return searchBtn as HTMLButtonElement
}

// Sticky Search Bar test fixtures
export const pokemonFixtures = [
  { index: 1, name: 'Bulbasaur', image: 'https://example.com/1.png' },
  { index: 4, name: 'Charmander', image: 'https://example.com/4.png' },
  { index: 7, name: 'Squirtle', image: 'https://example.com/7.png' },
  { index: 25, name: 'Pikachu', image: 'https://example.com/25.png' },
  { index: 39, name: 'Jigglypuff', image: 'https://example.com/39.png' },
]

// Mock search function for pokemonService
export function mockSearchPokemonByName(query: string) {
  return pokemonFixtures.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
}

// Helper for rendering with search context
export function createMockPokemonService() {
  return {
    searchPokemonByName: vi.fn(mockSearchPokemonByName),
    getCollection: vi.fn(() => []),
    getCollectionList: vi.fn(() => []),
    collectPokemon: vi.fn(),
    removeFromCollection: vi.fn(),
    isCollected: vi.fn(() => false),
  }
}

export { screen }
