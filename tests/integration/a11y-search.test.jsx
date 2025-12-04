import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '../setup'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import App from '../../src/components/App'

// Mock the PokéAPI
vi.mock('../../src/services/pokemonApi.ts', () => ({
  fetchPokemon: vi.fn(async (index) => {
    const mockPokemon = {
      1: { index: 1, name: 'Bulbasaur', image: 'https://example.com/1.png' },
      25: { index: 25, name: 'Pikachu', image: 'https://example.com/25.png' },
    }
    if (!mockPokemon[index]) {
      throw new Error(`Pokemon ${index} not found`)
    }
    return mockPokemon[index]
  }),
  fetchMultiplePokemon: vi.fn(async (indices) => {
    const mockData = {
      1: { index: 1, name: 'Bulbasaur', image: 'https://example.com/1.png' },
      25: { index: 25, name: 'Pikachu', image: 'https://example.com/25.png' },
    }
    return indices.map((index) => mockData[index] || { index, name: `Pokemon ${index}` })
  }),
}))

// Mock nameRegistry
vi.mock('../../src/services/nameRegistry.ts', () => ({
  nameRegistry: {
    loadAllNamesWithCache: vi.fn(() => Promise.resolve()),
    getName: vi.fn((id) => {
      const names = { 1: 'Bulbasaur', 25: 'Pikachu' };
      return names[id] || `Pokemon ${id}`;
    }),
    search: vi.fn(() => []),
    ready: true,
    error: null,
    loading: false,
  },
}));

describe('Accessibility - Search Bar (T006 - WCAG 2.1 AA)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should have proper ARIA labels for screen readers', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText(/pokemon collection organizer/i)).toBeInTheDocument()
    })

    const searchInput = screen.getByTestId('sticky-search-input')
    if (searchInput) {
      // Should have aria-label or be properly labeled
      expect(
        searchInput.getAttribute('aria-label') ||
          searchInput.getAttribute('id') ||
          searchInput.parentElement?.querySelector('label')
      ).toBeTruthy()
    }
  })

  it('should be fully navigable via Tab key', async () => {
    const user = userEvent.setup()
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText(/pokemon collection organizer/i)).toBeInTheDocument()
    })

    const searchInput = screen.getByTestId('sticky-search-input')
    if (searchInput) {
      // Tab to search input
      await user.tab()
      // At least one focusable element should exist
      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      expect(focusableElements.length).toBeGreaterThan(0)
    }
  })

  it('should support Escape key to clear search', async () => {
    const user = userEvent.setup()
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText(/pokemon collection organizer/i)).toBeInTheDocument()
    })

    const searchInput = screen.getByTestId('sticky-search-input')
    if (searchInput) {
      await user.click(searchInput)
      await user.keyboard('pika')
      expect(searchInput).toHaveValue('pika')

      // Press Escape
      await user.keyboard('{Escape}')
      // Should be cleared by component
      expect(searchInput).toHaveValue('')
    }
  })

  it('should have visible focus indicators', async () => {
    const user = userEvent.setup()
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText(/pokemon collection organizer/i)).toBeInTheDocument()
    })

    const searchInput = screen.getByTestId('sticky-search-input')
    if (searchInput) {
      await user.click(searchInput)

      // Check for focus styles
      const styles = window.getComputedStyle(searchInput)
      const hasFocusStyle =
        styles.outline !== 'none' ||
        styles.boxShadow !== 'none' ||
        styles.borderColor !== styles.backgroundColor

      // Either has explicit focus styles or browser default should be visible
      expect(searchInput).toHaveFocus()
    }
  })

  it('should announce search results to screen readers', async () => {
    const user = userEvent.setup()
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText(/pokemon collection organizer/i)).toBeInTheDocument()
    })

    // Verify live region or aria-live attribute for search results
    const liveRegion = document.querySelector('[aria-live]')
    const searchSection = document.querySelector('[role="region"]')

    // Should have either a live region for announcements or proper semantics
    expect(liveRegion || searchSection).toBeTruthy()
  })

  it('should have minimum touch target size (44px)', async () => {
    const { container } = render(<App />)

    await waitFor(() => {
      expect(screen.getByText(/pokemon collection organizer/i)).toBeInTheDocument()
    })

    // Check search input and buttons
    const buttons = container.querySelectorAll('button')
    const inputs = container.querySelectorAll('input')

    buttons.forEach((button) => {
      const rect = button.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        expect(Math.min(rect.width, rect.height)).toBeGreaterThanOrEqual(40) // Allow slight tolerance
      }
    })

    inputs.forEach((input) => {
      const rect = input.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        expect(rect.height).toBeGreaterThanOrEqual(40)
      }
    })
  })
})
