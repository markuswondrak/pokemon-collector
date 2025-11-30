import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import StickySearchBar from '../../../src/components/StickySearchBar'

describe('StickySearchBar Component (T002)', () => {
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

  it('should have sticky CSS positioning applied', () => {
    const { container } = render(
      <StickySearchBar
        value=""
        onChange={mockOnChange}
        onClear={mockOnClear}
      />
    )

    const searchSection = container.querySelector('[class*="sticky"]') || container.querySelector('[class*="search"]')
    expect(searchSection).toBeInTheDocument()
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
})
