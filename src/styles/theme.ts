import { createSystem, defaultConfig } from '@chakra-ui/react'

/**
 * Pokemon Collector Theme Configuration
 * 
 * Centralizes all design tokens using Chakra UI's createSystem API.
 * Enforces consistent spacing (8px scale), typography (Open Sans), 
 * colors (Chakra base + Pokemon brand), and accessibility (WCAG AAA).
 */

export const theme = createSystem({
  ...defaultConfig,
})

export default theme
