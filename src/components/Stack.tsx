import { VStack as ChakraVStack, HStack as ChakraHStack, StackProps } from '@chakra-ui/react'
import React from 'react'

/**
 * Stack Utilities
 * 
 * VStack and HStack components built on Chakra UI with Pokemon-specific spacing defaults.
 * Enforces 8px spacing scale and consistent layout patterns.
 * 
 * Default gap: 16px (matches 2x 8px spacing unit)
 * Responsive scaling: Adapts to different viewport sizes
 */

interface CustomStackProps extends Omit<StackProps, 'gap'> {
  children: React.ReactNode
  gap?: StackProps['gap']
}

/**
 * VStack - Vertical Stack (flex column)
 * Stacks children vertically with consistent spacing.
 */
const VStack = React.forwardRef<HTMLDivElement, CustomStackProps>(
  ({ gap, children, ...props }, ref) => {
    const finalGap = gap ?? '16px'
    
    return (
      <ChakraVStack
        ref={ref}
        gap={finalGap}
        {...props}
      >
        {children}
      </ChakraVStack>
    )
  }
)

VStack.displayName = 'VStack'

/**
 * HStack - Horizontal Stack (flex row)
 * Stacks children horizontally with consistent spacing.
 */
const HStack = React.forwardRef<HTMLDivElement, CustomStackProps>(
  ({ gap, children, ...props }, ref) => {
    const finalGap = gap ?? '16px'
    
    return (
      <ChakraHStack
        ref={ref}
        gap={finalGap}
        {...props}
      >
        {children}
      </ChakraHStack>
    )
  }
)

HStack.displayName = 'HStack'

export { VStack, HStack }
