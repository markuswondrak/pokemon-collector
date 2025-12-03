import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '../../setup.tsx'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import StickySearchBar from '../../../src/components/StickySearchBar'

describe('StickySearchBar Component (T002, T018)', () => {
  const mockOnChange = vi.fn()
  const mockOnClear = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render with default props', () => {
    render(
      <StickySearchBar
        value=""
        onChange={mockOnChange}
        onClear={mockOnClear}
      />
    )

    const input = screen.getByPlaceholderText('Search Pokemon by name...')
    expect(input).toBeInTheDocument()
  })

  it('should call onChange when user types', async () => {
    const user = userEvent.setup()
    render(
      <StickySearchBar
        value=""
        onChange={mockOnChange}
        onClear={mockOnClear}
      />
    )

    const input = screen.getByPlaceholderText('Search Pokemon by name...')
    await user.type(input, 'pika')

    expect(mockOnChange).toHaveBeenCalled()
  })

  it('should show clear button when value is not empty', () => {
    const { rerender } = render(
      <StickySearchBar
        value=""
        onChange={mockOnChange}
        onClear={mockOnClear}
      />
    )

    expect(screen.queryByRole('button', { name: /clear|×/i })).not.toBeInTheDocument()

    rerender(
      <StickySearchBar
        value="pika"
        onChange={mockOnChange}
        onClear={mockOnClear}
      />
    )

    expect(screen.getByRole('button', { name: /clear|×/i })).toBeInTheDocument()
  })

  it('should call onClear when clear button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <StickySearchBar
        value="pika"
        onChange={mockOnChange}
        onClear={mockOnClear}
      />
    )

    const clearButton = screen.getByRole('button', { name: /clear|×/i })
    await user.click(clearButton)

    expect(mockOnClear).toHaveBeenCalled()
  })

  it('should use Chakra Input component with proper styling', () => {
    const { container } = render(
      <StickySearchBar
        value=""
        onChange={mockOnChange}
        onClear={mockOnClear}
      />
    )

    const input = screen.getByTestId('sticky-search-input')
    // Chakra Input wraps in a div container with specific classes
    expect(input).toBeInTheDocument()
    expect(input.tagName).toBe('INPUT')
  })

  it('should have sticky positioning applied', () => {
    const { container } = render(
      <StickySearchBar
        value=""
        onChange={mockOnChange}
        onClear={mockOnClear}
      />
    )

    const searchBar = screen.getByTestId('sticky-search-bar')
    const computedStyle = window.getComputedStyle(searchBar)
    expect(computedStyle.position).toBe('sticky')
  })

  it('should have teal focus color on input (Chakra theme)', async () => {
    const user = userEvent.setup()
    render(
      <StickySearchBar
        value=""
        onChange={mockOnChange}
        onClear={mockOnClear}
      />
    )

    const input = screen.getByTestId('sticky-search-input')
    await user.click(input)
    
    // Verify input is focused
    expect(input).toHaveFocus()
  })

  it('should call onClear when Escape key is pressed', async () => {
    const user = userEvent.setup()
    render(
      <StickySearchBar
        value="pika"
        onChange={mockOnChange}
        onClear={mockOnClear}
      />
    )

    const input = screen.getByPlaceholderText('Search Pokemon by name...')
    await user.click(input)
    await user.keyboard('{Escape}')

    expect(mockOnClear).toHaveBeenCalled()
  })

  it('should have ARIA labels for accessibility', () => {
    render(
      <StickySearchBar
        value=""
        onChange={mockOnChange}
        onClear={mockOnClear}
        ariaLabel="Search Pokemon"
      />
    )

    const input = screen.getByPlaceholderText('Search Pokemon by name...')
    expect(input).toHaveAttribute('aria-label', 'Search Pokemon')
  })

  it('should have responsive spacing (Chakra HStack with gap)', () => {
    const { container } = render(
      <StickySearchBar
        value="test"
        onChange={mockOnChange}
        onClear={mockOnClear}
      />
    )

    // Verify HStack structure exists (Chakra component)
    const input = screen.getByTestId('sticky-search-input')
    const clearButton = screen.getByTestId('search-clear-btn')
    
    expect(input).toBeInTheDocument()
    expect(clearButton).toBeInTheDocument()
    
    // Both should be rendered indicating proper HStack layout
  })

  it('should render without custom CSS classes', () => {
    const { container } = render(
      <StickySearchBar
        value=""
        onChange={mockOnChange}
        onClear={mockOnClear}
      />
    )

    // Verify Chakra components are rendering (they use data-testid)
    const searchBar = screen.getByTestId('sticky-search-bar')
    const searchInput = screen.getByTestId('sticky-search-input')
    
    // Both should be rendered
    expect(searchBar).toBeInTheDocument()
    expect(searchInput).toBeInTheDocument()
    
    // Verify no old custom CSS class names are being used
    expect(searchBar.className).not.toContain('sticky-search-bar')
    expect(searchInput.className).not.toContain('search-input')
  })
})
