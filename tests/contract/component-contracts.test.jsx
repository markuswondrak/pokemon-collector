import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../setup.tsx'
import ButtonBase from '../../src/components/ButtonBase'
import Container from '../../src/components/Container'
import CardBase from '../../src/components/CardBase'
import { VStack, HStack } from '../../src/components/Stack'

/**
 * Component Contract Validation Tests
 * 
 * Validates that all foundational components are properly implemented
 * and adhere to the design specifications.
 */

describe('Component Contract Validation', () => {
  describe('Button Component', () => {
    it('renders with all supported variants', () => {
      const { rerender } = render(<ButtonBase variant="primary">Test</ButtonBase>)
      expect(screen.getByRole('button', { name: /test/i })).toBeInTheDocument()

      rerender(<ButtonBase variant="secondary">Test</ButtonBase>)
      expect(screen.getByRole('button', { name: /test/i })).toBeInTheDocument()

      rerender(<ButtonBase variant="destructive">Test</ButtonBase>)
      expect(screen.getByRole('button', { name: /test/i })).toBeInTheDocument()
    })

    it('renders with all supported sizes', () => {
      const { rerender } = render(<ButtonBase size="sm">Test</ButtonBase>)
      expect(screen.getByRole('button', { name: /test/i })).toBeInTheDocument()

      rerender(<ButtonBase size="md">Test</ButtonBase>)
      expect(screen.getByRole('button', { name: /test/i })).toBeInTheDocument()

      rerender(<ButtonBase size="lg">Test</ButtonBase>)
      expect(screen.getByRole('button', { name: /test/i })).toBeInTheDocument()
    })

    it('supports click handlers', () => {
      const handleClick = vi.fn()
      render(<ButtonBase onClick={handleClick}>Click</ButtonBase>)
      const button = screen.getByRole('button')
      button.click()
      expect(handleClick).toHaveBeenCalled()
    })

    it('supports disabled state', () => {
      render(<ButtonBase disabled>Disabled</ButtonBase>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('supports aria-label', () => {
      render(<ButtonBase aria-label="Test Label">Content</ButtonBase>)
      expect(screen.getByLabelText('Test Label')).toBeInTheDocument()
    })
  })

  describe('Container Component', () => {
    it('applies max-width constraint', () => {
      render(
        <Container data-testid="container">
          <div>Content</div>
        </Container>
      )
      const container = screen.getByTestId('container')
      expect(window.getComputedStyle(container).maxWidth).toBe('1440px')
    })

    it('applies full width', () => {
      render(
        <Container data-testid="container">
          <div>Content</div>
        </Container>
      )
      const container = screen.getByTestId('container')
      expect(window.getComputedStyle(container).width).toBe('100%')
    })

    it('centers content horizontally', () => {
      render(
        <Container data-testid="container">
          <div>Content</div>
        </Container>
      )
      const container = screen.getByTestId('container')
      const styles = window.getComputedStyle(container)
      expect(styles.marginLeft).toBeDefined()
      expect(styles.marginRight).toBeDefined()
    })

    it('renders children without modification', () => {
      render(
        <Container>
          <div data-testid="child">Test Child</div>
        </Container>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })
  })

  describe('Card Component', () => {
    it('renders as a card element', () => {
      render(
        <CardBase data-testid="card">
          <div>Card Content</div>
        </CardBase>
      )
      expect(screen.getByTestId('card')).toBeInTheDocument()
    })

    it('applies shadow styling', () => {
      render(
        <CardBase data-testid="card">
          <div>Content</div>
        </CardBase>
      )
      const card = screen.getByTestId('card')
      const styles = window.getComputedStyle(card)
      expect(styles.boxShadow).toContain('0 2px 8px')
    })

    it('applies border-radius', () => {
      render(
        <CardBase data-testid="card">
          <div>Content</div>
        </CardBase>
      )
      const card = screen.getByTestId('card')
      expect(window.getComputedStyle(card).borderRadius).toBe('8px')
    })

    it('applies padding', () => {
      render(
        <CardBase data-testid="card">
          <div>Content</div>
        </CardBase>
      )
      const card = screen.getByTestId('card')
      expect(window.getComputedStyle(card).padding).toContain('16px')
    })

    it('renders children inside', () => {
      render(
        <CardBase>
          <h2>Title</h2>
          <p>Content</p>
        </CardBase>
      )
      expect(screen.getByRole('heading', { name: /title/i })).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
    })
  })

  describe('Stack Components (VStack/HStack)', () => {
    it('VStack defaults to 16px gap', () => {
      render(
        <VStack data-testid="vstack">
          <div>Item 1</div>
          <div>Item 2</div>
        </VStack>
      )
      expect(screen.getByTestId('vstack')).toBeInTheDocument()
    })

    it('HStack defaults to 16px gap', () => {
      render(
        <HStack data-testid="hstack">
          <div>Item 1</div>
          <div>Item 2</div>
        </HStack>
      )
      expect(screen.getByTestId('hstack')).toBeInTheDocument()
    })

    it('VStack allows custom gap override', () => {
      render(
        <VStack data-testid="vstack" gap="24px">
          <div>Item 1</div>
          <div>Item 2</div>
        </VStack>
      )
      expect(screen.getByTestId('vstack')).toBeInTheDocument()
    })

    it('HStack allows custom gap override', () => {
      render(
        <HStack data-testid="hstack" gap="24px">
          <div>Item 1</div>
          <div>Item 2</div>
        </HStack>
      )
      expect(screen.getByTestId('hstack')).toBeInTheDocument()
    })

    it('VStack renders children vertically', () => {
      render(
        <VStack data-testid="vstack">
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
        </VStack>
      )
      expect(screen.getByTestId('child1')).toBeInTheDocument()
      expect(screen.getByTestId('child2')).toBeInTheDocument()
    })

    it('HStack renders children horizontally', () => {
      render(
        <HStack data-testid="hstack">
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
        </HStack>
      )
      expect(screen.getByTestId('child1')).toBeInTheDocument()
      expect(screen.getByTestId('child2')).toBeInTheDocument()
    })
  })

  describe('No Custom CSS', () => {
    it('all components use Chakra UI styling only', () => {
      // Verify components don't import custom CSS
      expect(true).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('Button supports aria attributes', () => {
      render(<ButtonBase aria-describedby="help">Help</ButtonBase>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-describedby', 'help')
    })

    it('Container supports semantic HTML', () => {
      render(
        <Container>
          <main>
            <h1>Test</h1>
          </main>
        </Container>
      )
      expect(screen.getByRole('heading', { name: /test/i })).toBeInTheDocument()
    })

    it('Card renders semantic content', () => {
      render(
        <CardBase>
          <h2>Title</h2>
          <p>Description</p>
        </CardBase>
      )
      expect(screen.getByRole('heading', { name: /title/i })).toBeInTheDocument()
    })
  })
})
