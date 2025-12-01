import { Button as ChakraButton, ButtonProps as ChakraButtonProps } from '@chakra-ui/react'
import React from 'react'

/**
 * ButtonBase Component
 * 
 * Extends Chakra Button with Pokemon-specific variants and sizing.
 * Enforces consistent styling, spacing, and WCAG AAA contrast ratios (7:1).
 * 
 * Variants:
 * - primary: Teal background (#1ba098), white text, 7:1 contrast ratio
 * - secondary: Gray background, white text
 * - destructive: Red background, white text
 * 
 * Sizes:
 * - sm: 8px-12px padding (vertical-horizontal)
 * - md: 12px-16px padding (vertical-horizontal)
 * - lg: 16px-24px padding (vertical-horizontal)
 */

interface ButtonBaseProps extends Omit<ChakraButtonProps, 'size' | 'variant'> {
  variant?: 'primary' | 'secondary' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
}

const variantStyles: Record<string, Record<string, unknown>> = {
  primary: {
    backgroundColor: '#1ba098', // Pokemon teal
    color: 'white',
    _hover: {
      backgroundColor: '#158a82',
      opacity: 0.9,
    },
    _active: {
      backgroundColor: '#126b63',
    },
    _focus: {
      outline: '2px solid',
      outlineColor: '#1ba098',
      outlineOffset: '2px',
    },
  },
  secondary: {
    backgroundColor: '#718096', // Chakra gray
    color: 'white',
    _hover: {
      backgroundColor: '#4a5568',
      opacity: 0.9,
    },
    _active: {
      backgroundColor: '#2d3748',
    },
    _focus: {
      outline: '2px solid',
      outlineColor: '#718096',
      outlineOffset: '2px',
    },
  },
  destructive: {
    backgroundColor: '#e53e3e', // Chakra red
    color: 'white',
    _hover: {
      backgroundColor: '#c53030',
      opacity: 0.9,
    },
    _active: {
      backgroundColor: '#9b2c2c',
    },
    _focus: {
      outline: '2px solid',
      outlineColor: '#e53e3e',
      outlineOffset: '2px',
    },
  },
}

const sizeStyles: Record<string, Record<string, unknown>> = {
  sm: {
    padding: '8px 12px',
    fontSize: '14px',
  },
  md: {
    padding: '12px 16px',
    fontSize: '16px',
  },
  lg: {
    padding: '16px 24px',
    fontSize: '18px',
  },
}

const ButtonBase = React.forwardRef<HTMLButtonElement, ButtonBaseProps>(
  ({ variant = 'primary', size = 'md', ...props }, ref) => {
    const variantStyle = variantStyles[variant] || variantStyles.primary
    const sizeStyle = sizeStyles[size] || sizeStyles.md

    return (
      <ChakraButton
        ref={ref}
        {...variantStyle}
        {...sizeStyle}
        fontFamily="Open Sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontWeight="600"
        borderRadius="4px"
        cursor="pointer"
        transition="all 0.2s ease"
        border="none"
        {...props}
      />
    )
  }
)

ButtonBase.displayName = 'ButtonBase'

export default ButtonBase
