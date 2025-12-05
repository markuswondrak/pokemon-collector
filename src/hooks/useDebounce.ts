import { useState, useEffect } from 'react'

interface UseDebounceReturn<T> {
  debouncedValue: T | undefined
  isDebouncing: boolean
}

interface UseDebounceOptions {
  delay?: number
}

/**
 * Hook that debounces a value after a specified delay
 * Useful for search inputs, window resize handling, etc.
 *
 * @param value - The value to debounce
 * @param options - Configuration options
 * @param options.delay - Debounce delay in milliseconds (default: 300)
 * @returns Object with debouncedValue and isDebouncing state
 *
 * @example
 * const { debouncedValue, isDebouncing } = useDebounce(searchQuery, { delay: 300 })
 */
export function useDebounce<T>(
  value: T,
  options?: UseDebounceOptions
): UseDebounceReturn<T> {
  const delay = options?.delay ?? 300

  const [debouncedValue, setDebouncedValue] = useState<T | undefined>(undefined)
  const [isDebouncing, setIsDebouncing] = useState(false)

  useEffect(() => {
    // Mark debouncing state at the start of a value change
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDebouncing(true)

    const handler = setTimeout(() => {
      setDebouncedValue(value)
      setIsDebouncing(false)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return { debouncedValue, isDebouncing }
}
