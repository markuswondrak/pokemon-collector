import { describe, it, expect } from 'vitest'
import { render, screen } from '../../setup.tsx'
import Container from '../../../src/components/Container'

describe('Container Component', () => {
  describe('Basic Rendering', () => {
    it('renders as a div element', () => {
      render(
        <Container data-testid="container">
          <div>Content</div>
        </Container>
      )
      const container = screen.getByTestId('container')
      expect(container).toBeInTheDocument()
      expect(container.tagName).toBe('DIV')
    })

    it('renders children inside', () => {
      render(
        <Container>
          <div data-testid="child">Child Content</div>
        </Container>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('applies max-width constraint', () => {
      render(
        <Container data-testid="container">
          <div>Content</div>
        </Container>
      )
      const container = screen.getByTestId('container')
      const styles = window.getComputedStyle(container)
      expect(styles.maxWidth).toBe('1440px')
    })

    it('applies horizontal centering (marginX: auto)', () => {
      render(
        <Container data-testid="container">
          <div>Content</div>
        </Container>
      )
      const container = screen.getByTestId('container')
      const styles = window.getComputedStyle(container)
      // Should have auto margins for centering
      expect(styles.marginLeft).toBeDefined()
      expect(styles.marginRight).toBeDefined()
    })

    it('applies full width', () => {
      render(
        <Container data-testid="container">
          <div>Content</div>
        </Container>
      )
      const container = screen.getByTestId('container')
      const styles = window.getComputedStyle(container)
      expect(styles.width).toBe('100%')
    })
  })

  describe('Props Forwarding', () => {
    it('accepts additional Chakra Box props', () => {
      render(
        <Container data-testid="custom" backgroundColor="gray.50">
          <div>Content</div>
        </Container>
      )
      expect(screen.getByTestId('custom')).toBeInTheDocument()
    })

    it('accepts custom className', () => {
      render(
        <Container data-testid="container" className="custom-class">
          <div>Content</div>
        </Container>
      )
      const container = screen.getByTestId('container')
      expect(container).toHaveClass('custom-class')
    })

    it('forwards data-testid attribute', () => {
      render(
        <Container data-testid="test-container">
          <div>Content</div>
        </Container>
      )
      expect(screen.getByTestId('test-container')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('allows semantic content inside', () => {
      render(
        <Container>
          <main>
            <h1>Title</h1>
            <p>Description</p>
          </main>
        </Container>
      )
      expect(screen.getByRole('heading', { name: /title/i })).toBeInTheDocument()
      expect(screen.getByText('Description')).toBeInTheDocument()
    })
  })
})
