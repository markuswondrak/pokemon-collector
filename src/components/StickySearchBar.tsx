import React, { useRef, useEffect } from 'react'
import { Box, HStack, Input, Button } from '@chakra-ui/react'

interface StickySearchBarProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  placeholder?: string
  minChars?: number
  debounceMs?: number
  ariaLabel?: string
  ariaDescribedBy?: string
  disabled?: boolean
  loadingMessage?: string
}

/**
 * StickySearchBar Component
 * A sticky-positioned search input that filters Pokemon by name
 * Stays at the top of the viewport when user scrolls past the header
 *
 * @param props - Component props
 * @returns JSX element
 *
 * @example
 * <StickySearchBar
 *   value={searchQuery}
 *   onChange={setSearchQuery}
 *   onClear={() => setSearchQuery('')}
 *   placeholder="Search Pokemon by name..."
 *   minChars={3}
 * />
 */
export default function StickySearchBar({
  value,
  onChange,
  onClear,
  placeholder = 'Search Pokemon by name...',
  ariaLabel = 'Search Pokemon by name',
  ariaDescribedBy,
  disabled = false,
  loadingMessage = 'Loading names...',
}: StickySearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  // Handle Escape key to clear search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && inputRef.current === document.activeElement) {
        onClear()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClear])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const handleClearClick = () => {
    onClear()
    inputRef.current?.focus()
  }

  const showClearButton = value.length > 0
  
  // T012: Use loading message as placeholder when disabled
  const effectivePlaceholder = disabled ? loadingMessage : placeholder

  return (
    <Box
      position="sticky"
      top={0}
      zIndex={100}
      bg="white"
      boxShadow="sm"
      p={4}
      data-testid="sticky-search-bar"
    >
      <HStack
        gap={2}
        maxW="1440px"
        mx="auto"
        px={{ base: 2, md: 4 }}
      >
        <Box flex={1}>
          <Input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleChange}
            placeholder={effectivePlaceholder}
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedBy}
            data-testid="sticky-search-input"
            bg="white"
            borderColor="teal.500"
            _focus={{
              borderColor: 'teal.600',
              boxShadow: '0 0 0 1px var(--chakra-colors-teal-600)',
            }}
            _hover={{
              borderColor: 'teal.400',
            }}
            px={4}
            py={2}
            fontSize="16px"
            fontFamily="Open Sans, sans-serif"
            disabled={disabled}
            aria-disabled={disabled}
          />
        </Box>
        {showClearButton && !disabled && (
          <Button
            onClick={handleClearClick}
            aria-label="Clear search"
            title="Clear search"
            variant="ghost"
            size="sm"
            p={2}
            minW="auto"
            fontSize="20px"
            data-testid="search-clear-btn"
          >
            ×
          </Button>
        )}
      </HStack>
    </Box>
  )
}
