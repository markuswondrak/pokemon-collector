import { describe, it, expect } from 'vitest'
import { render, screen } from '../../setup.tsx'
import ButtonBase from '../../../src/components/ButtonBase'

describe('ButtonBase Component', () => {
  describe('Basic Rendering', () => {
    it('renders as a button element', () => {
      render(<ButtonBase>Click me</ButtonBase>)
      const button = screen.getByRole('button', { name: /click me/i })
      expect(button).toBeInTheDocument()
      expect(button.tagName).toBe('BUTTON')
    })

    it('renders default variant (primary)', () => {
      render(<ButtonBase>Default</ButtonBase>)
      expect(screen.getByRole('button', { name: /default/i })).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    it('renders with primary variant', () => {
      render(<ButtonBase variant="primary">Primary</ButtonBase>)
      expect(screen.getByRole('button', { name: /primary/i })).toBeInTheDocument()
    })

    it('renders with secondary variant', () => {
      render(<ButtonBase variant="secondary">Secondary</ButtonBase>)
      expect(screen.getByRole('button', { name: /secondary/i })).toBeInTheDocument()
    })

    it('renders with destructive variant', () => {
      render(<ButtonBase variant="destructive">Delete</ButtonBase>)
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
    })
  })

  describe('Sizes', () => {
    it('renders with small size', () => {
      render(<ButtonBase size="sm">Small</ButtonBase>)
      expect(screen.getByRole('button', { name: /small/i })).toBeInTheDocument()
    })

    it('renders with medium size (default)', () => {
      render(<ButtonBase size="md">Medium</ButtonBase>)
      expect(screen.getByRole('button', { name: /medium/i })).toBeInTheDocument()
    })

    it('renders with large size', () => {
      render(<ButtonBase size="lg">Large</ButtonBase>)
      expect(screen.getByRole('button', { name: /large/i })).toBeInTheDocument()
    })
  })

  describe('States and Props', () => {
    it('supports disabled state', () => {
      render(<ButtonBase disabled>Disabled</ButtonBase>)
      const button = screen.getByRole('button', { name: /disabled/i })
      expect(button).toBeDisabled()
    })

    it('forwards onClick handler', () => {
      let clicked = false
      const handleClick = () => { clicked = true }
      render(<ButtonBase onClick={handleClick}>Click</ButtonBase>)
      const button = screen.getByRole('button', { name: /click/i })
      button.click()
      expect(clicked).toBe(true)
    })

    it('accepts aria-label attribute', () => {
      render(<ButtonBase aria-label="Custom Label">Aria</ButtonBase>)
      expect(screen.getByLabelText('Custom Label')).toBeInTheDocument()
    })

    it('accepts custom className', () => {
      render(<ButtonBase className="custom-class">Custom</ButtonBase>)
      const button = screen.getByRole('button', { name: /custom/i })
      expect(button).toHaveClass('custom-class')
    })

    it('forwards data-testid attribute', () => {
      render(<ButtonBase data-testid="button-test">Test</ButtonBase>)
      expect(screen.getByTestId('button-test')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('supports aria-describedby', () => {
      render(
        <ButtonBase aria-describedby="help-text">
          Help
        </ButtonBase>
      )
      const button = screen.getByRole('button', { name: /help/i })
      expect(button).toHaveAttribute('aria-describedby', 'help-text')
    })

    it('supports aria-pressed state', () => {
      render(
        <ButtonBase aria-pressed="true">
          Toggle
        </ButtonBase>
      )
      const button = screen.getByRole('button', { name: /toggle/i })
      expect(button).toHaveAttribute('aria-pressed', 'true')
    })
  })
})
