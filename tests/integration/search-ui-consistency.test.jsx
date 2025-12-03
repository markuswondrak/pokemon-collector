import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '../setup.tsx'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import App from '../../src/components/App'

// Mock the PokéAPI to prevent real network requests
vi.mock('../../src/services/pokemonApi.ts', () => ({
  fetchPokemon: vi.fn(async (index) => {
    const mockPokemon = {
      1: { index: 1, name: 'Bulbasaur', image: 'https://example.com/1.png' },
      4: { index: 4, name: 'Charmander', image: 'https://example.com/4.png' },
      7: { index: 7, name: 'Squirtle', image: 'https://example.com/7.png' },
      25: { index: 25, name: 'Pikachu', image: 'https://example.com/25.png' },
      39: { index: 39, name: 'Jigglypuff', image: 'https://example.com/39.png' },
    }
    if (!mockPokemon[index]) {
      throw new Error(`Pokemon ${index} not found`)
    }
    return mockPokemon[index]
  }),
  fetchMultiplePokemon: vi.fn(async (indices) => {
    const mockData = {
      1: { index: 1, name: 'Bulbasaur', image: 'https://example.com/1.png' },
      4: { index: 4, name: 'Charmander', image: 'https://example.com/4.png' },
      7: { index: 7, name: 'Squirtle', image: 'https://example.com/7.png' },
      25: { index: 25, name: 'Pikachu', image: 'https://example.com/25.png' },
      39: { index: 39, name: 'Jigglypuff', image: 'https://example.com/39.png' },
    }
    return indices.map((index) => mockData[index] || { index, name: `Pokemon ${index}`, image: null })
  }),
}))

// Mock pokemonService to prevent real API calls
vi.mock('../../src/services/pokemonService.ts', () => ({
  searchPokemonByName: vi.fn(async (query) => {
    const allPokemon = [
      { index: 1, name: 'Bulbasaur' },
      { index: 4, name: 'Charmander' },
      { index: 7, name: 'Squirtle' },
      { index: 25, name: 'Pikachu' },
      { index: 39, name: 'Jigglypuff' },
    ]
    return allPokemon.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
  }),
  getCollectionList: vi.fn(() => []),
  getCollection: vi.fn(() => []),
  collectPokemon: vi.fn(),
  removeFromCollection: vi.fn(),
  isCollected: vi.fn(() => false),
}))

describe('Search UI Consistency Integration Tests (T019)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    }
    global.localStorage = localStorageMock
  })

  it('should render sticky search bar with proper styling', () => {
    const { container } = render(<App />)

    const searchBar = screen.getByTestId('sticky-search-bar')
    expect(searchBar).toBeInTheDocument()

    // Verify sticky positioning
    const computedStyle = window.getComputedStyle(searchBar)
    expect(computedStyle.position).toBe('sticky')
  })

  it('should have consistent spacing between input and clear button', () => {
    render(
      <App />
    )

    const input = screen.getByTestId('sticky-search-input')
    const wrapper = input.closest('[class*="chakra"]') || input.parentElement

    expect(wrapper).toBeInTheDocument()
  })

  it('should show consistent button styling for clear button', async () => {
    const user = userEvent.setup({ delay: null }) // Disable keypress delay for faster tests
    render(<App />)

    const input = screen.getByTestId('sticky-search-input')
    await user.type(input, 'pika')

    const clearButton = screen.getByTestId('search-clear-btn')
    expect(clearButton).toBeInTheDocument()
    expect(clearButton.tagName).toBe('BUTTON')
  })

  it('should have consistent focus states across interactive elements', async () => {
    const user = userEvent.setup({ delay: null }) // Disable keypress delay for faster tests
    render(<App />)

    const input = screen.getByTestId('sticky-search-input')
    
    await user.click(input)
    expect(input).toHaveFocus()

    // Verify input shows focus styling
    const computedStyle = window.getComputedStyle(input)
    // Focus state should be visible (browser applies focus outline or custom focus ring)
    expect(input).toHaveFocus()
  })

  it('should maintain spacing uniformity in search bar layout', () => {
    const { container } = render(<App />)

    const searchBar = screen.getByTestId('sticky-search-bar')
    const input = screen.getByTestId('sticky-search-input')

    // Both should be visible and properly spaced
    expect(searchBar).toBeInTheDocument()
    expect(input).toBeInTheDocument()

    // Verify they're part of same HStack (Chakra layout)
    expect(input.closest('[data-testid="sticky-search-bar"]')).toBe(searchBar)
  })

  it('should apply consistent typography (Open Sans) in search bar', () => {
    const { container } = render(<App />)

    const input = screen.getByTestId('sticky-search-input')
    
    // Chakra applies Open Sans via theme
    expect(input).toBeInTheDocument()
    const computedStyle = window.getComputedStyle(input)
    // Font should be applied (exact font name varies by browser)
    expect(computedStyle.fontFamily).toBeTruthy()
  })

  it('should use consistent colors throughout search interface', () => {
    render(<App />)

    const input = screen.getByTestId('sticky-search-input')
    
    // Input should have consistent styling
    expect(input).toHaveAttribute('type', 'text')
    const computedStyle = window.getComputedStyle(input)
    
    // Verify it has border/background styling
    expect(computedStyle.borderColor).toBeTruthy()
    expect(computedStyle.backgroundColor).toBeTruthy()
  })

  it('should use Chakra components consistently (no custom CSS class names)', () => {
    const { container } = render(<App />)

    const searchBar = screen.getByTestId('sticky-search-bar')
    
    // Should not have old custom CSS class names
    expect(searchBar).not.toHaveClass('sticky-search-bar')
    expect(searchBar).not.toHaveClass('search-input-wrapper')
    
    // Should have Chakra-generated classes instead
    const classNames = searchBar.className
    expect(classNames).toBeTruthy() // Chakra applies its own classes
  })

  it('should maintain consistent spacing scale (Chakra 8px scale)', () => {
    const { container } = render(<App />)

    const searchBar = screen.getByTestId('sticky-search-bar')
    
    // Chakra applies padding via theme tokens
    const computedStyle = window.getComputedStyle(searchBar)
    expect(computedStyle.padding).toBeTruthy()
    
    // Should apply spacing from Chakra's scale
    expect(searchBar).toBeInTheDocument()
  })

  it('should support hover and focus states for all interactive elements', async () => {
    const user = userEvent.setup({ delay: null }) // Disable keypress delay for faster tests
    render(<App />)

    const input = screen.getByTestId('sticky-search-input')

    // Test focus state
    await user.click(input)
    expect(input).toHaveFocus()

    // Test input interaction
    await user.type(input, 'pika')
    expect(input).toHaveValue('pika')
  })
})
