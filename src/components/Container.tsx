import { Box, BoxProps } from '@chakra-ui/react'
import React from 'react'

/**
 * Container Component
 * 
 * Wraps content with max-width constraint and responsive padding.
 * Uses Chakra Box as foundation with Pokemon-specific configuration.
 * 
 * Features:
 * - Max-width: 1440px (desktop constraint)
 * - Responsive padding: 8px-16px on mobile, 16px-24px on desktop
 * - Horizontal centering for alignment
 * - Proper spacing for visual hierarchy
 */

interface ContainerProps extends BoxProps {
  children: React.ReactNode
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        maxWidth="1440px"
        marginX="auto"
        paddingX={['8px', '12px', '16px', '24px']} // Mobile, Tablet, Desktop
        paddingY={['8px', '12px', '16px', '24px']} // Mobile, Tablet, Desktop
        width="100%"
        {...props}
      >
        {children}
      </Box>
    )
  }
)

Container.displayName = 'Container'

export default Container
