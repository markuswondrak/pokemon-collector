import { Box, BoxProps } from '@chakra-ui/react'
import React from 'react'

/**
 * CardBase Component
 * 
 * Wraps content with consistent Pokemon Collector card styling.
 * Provides foundation for all card-based layouts (PokemonCard, collection cards, etc.).
 * 
 * Features:
 * - Consistent shadow: 0 2px 8px rgba(0, 0, 0, 0.1)
 * - Border-radius: 8px
 * - Padding: 16px
 * - Smooth transitions for hover effects
 * - Responsive spacing adjustments
 */

interface CardBaseProps extends BoxProps {
  children: React.ReactNode
}

const CardBase = React.forwardRef<HTMLDivElement, CardBaseProps>(
  ({ children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
        borderRadius="8px"
        padding="16px"
        backgroundColor="white"
        transition="all 0.2s ease"
        _hover={{
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          transform: 'translateY(-2px)',
        }}
        {...props}
      >
        {children}
      </Box>
    )
  }
)

CardBase.displayName = 'CardBase'

export default CardBase
