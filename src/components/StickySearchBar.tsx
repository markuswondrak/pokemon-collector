import React, { useRef, useEffect } from 'react'

interface StickySearchBarProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  placeholder?: string
  minChars?: number
  debounceMs?: number
  ariaLabel?: string
  ariaDescribedBy?: string
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

  return (
    <div className="sticky-search-bar">
      <div className="search-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          className="search-input"
          data-testid="sticky-search-input"
        />

        {showClearButton && (
          <button
            onClick={handleClearClick}
            className="search-clear-btn"
            aria-label="Clear search"
            title="Clear search"
            type="button"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}
