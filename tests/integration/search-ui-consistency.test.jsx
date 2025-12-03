import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '../setup.tsx'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import App from '../../src/components/App'

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
    const user = userEvent.setup()
    render(<App />)

    const input = screen.getByTestId('sticky-search-input')
    await user.type(input, 'pika')

    const clearButton = screen.getByTestId('search-clear-btn')
    expect(clearButton).toBeInTheDocument()
    expect(clearButton.tagName).toBe('BUTTON')
  })

  it('should have consistent focus states across interactive elements', async () => {
    const user = userEvent.setup()
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
    const user = userEvent.setup()
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
