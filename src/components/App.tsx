import { useState, useEffect, useMemo, ReactElement } from 'react'
import { Box, VStack, HStack, Container, Heading, Text } from '@chakra-ui/react'
import { useDebounce } from '../hooks/useDebounce.ts'
import StickySearchBar from './StickySearchBar.tsx'
import CollectionList from './CollectionList.tsx'
import WishlistList from './WishlistList.tsx'
import AvailableGrid from './AvailableGrid.tsx'
import * as pokemonApi from '../services/pokemonApi.ts'
import * as pokemonService from '../services/pokemonService.ts'

interface Pokemon {
  index: number
  name: string
  image: string | null
  collected: boolean
  wishlist: boolean
}

/**
 * Main App Component
 * Orchestrates search, display, and collection management
 * 
 * State Management:
 * - collection: Array of collected and wishlisted Pokemon
 * - allPokemon: All 1025 Pokemon with lazy-loaded data
 * - searchQuery: Raw search input (filters when >= 3 chars)
 * - debouncedSearchQuery: Debounced version for API calls (300ms delay)
 * - searchResults: Filtered Pokemon matching debounced query
 * - fetchedIndices: Set of Pokemon indices already fetched from API
 */
export default function App(): ReactElement {
  const [collection, setCollection] = useState<Pokemon[]>([])
  const [allPokemon, setAllPokemon] = useState<Pokemon[]>([])
  const [fetchedIndices, setFetchedIndices] = useState<Set<number>>(new Set())

  // NEW: Sticky Search Bar state (T013)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const { debouncedValue: debouncedSearchQuery } = useDebounce(searchQuery, { delay: 300 })
  const [searchResults, setSearchResults] = useState<Pokemon[] | null>(null)
  const isSearchActive = searchQuery.length >= 3

  // Fetch a batch of Pokemon from the API
  const fetchPokemonBatch = async (indices: number[], currentFetched: Set<number>): Promise<void> => {
    const indicesToFetch = indices.filter((i) => !currentFetched.has(i))
    
    if (indicesToFetch.length === 0) return

    try {
      const fetchedPokemon = await pokemonApi.fetchMultiplePokemon(indicesToFetch)
      
      if (!Array.isArray(fetchedPokemon)) {
        return
      }

      // Update allPokemon with fetched data
      const pokemonToUpdate = [...fetchedPokemon]
      setAllPokemon((prev) => {
        const updated = [...prev]
        for (const pokemon of pokemonToUpdate) {
          const index = pokemon.index - 1 // Convert to 0-based index
          if (index >= 0 && index < updated.length) {
            updated[index] = {
              ...updated[index],
              name: pokemon.name,
              image: pokemon.image,
            }
          }
        }
        return updated
      })

      // Track which indices have been fetched
      setFetchedIndices((prev) => {
        const newSet = new Set(prev)
        indicesToFetch.forEach((i) => {
          newSet.add(i)
        })
        return newSet
      })
    } catch {
      // Silently handle fetch errors - graceful degradation
    }
  }

  // Load collection from storage on mount and initialize all Pokemon
  useEffect(() => {
    const stored = pokemonService.getCollectionList()
    setCollection(stored)

    // Create a Map for O(1) lookups instead of O(n) .some() calls
    const collectedMap = new Map<number, boolean>()
    const wishlistMap = new Map<number, boolean>()
    
    for (const pokemon of stored) {
      if (pokemon.collected) collectedMap.set(pokemon.index, true)
      if (pokemon.wishlist) wishlistMap.set(pokemon.index, true)
    }

    // Initialize all Pokemon (1-1025) as available
    const allPokemonList: Pokemon[] = Array.from({ length: 1025 }, (_, i) => ({
      index: i + 1,
      name: `Pokemon ${i + 1}`,
      image: null,
      collected: collectedMap.has(i + 1),
      wishlist: wishlistMap.has(i + 1),
    }))
    setAllPokemon(allPokemonList)

    // Fetch initial batch of Pokemon (first 20)
    const indicesToFetch = Array.from({ length: Math.min(20, 1025) }, (_, i) => i + 1)
    fetchPokemonBatch(indicesToFetch, new Set())
  }, [])

  // NEW: Handle debounced name search (T014)
  useEffect(() => {
    // Only search if the DEBOUNCED query is long enough
    // This prevents freezing when typing the 3rd character (avoiding search for 2 chars)
    // Also check isSearchActive to prevent searching when the user has cleared the input
    if (!isSearchActive || !debouncedSearchQuery || debouncedSearchQuery.length < 3) {
      setSearchResults(null)
      return
    }

    const performSearch = async () => {
      try {
        const results = await pokemonService.searchPokemonByName(debouncedSearchQuery)
        // Filter to get only Pokemon that exist in allPokemon
        // Optimized: Use direct index access instead of O(N) .some() check
        // Since allPokemon is sorted 1-1025, we can just check bounds
        const filtered = results.filter((result) => 
          result.index >= 1 && result.index <= allPokemon.length
        )
        setSearchResults(filtered)
      } catch (err) {
        console.error('Search error:', err)
        setSearchResults([])
      }
    }

    void performSearch()
  }, [debouncedSearchQuery, allPokemon, isSearchActive])

  // Observe visible Pokemon and fetch them (lazy loading on scroll)
  useEffect(() => {
    // Check if IntersectionObserver is available (not in tests)
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return
    }

    const observer = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
      const indicesToFetch: number[] = []
      
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement
          const indexStr = element.getAttribute('data-pokemon-index')
          if (indexStr !== null) {
            const index = parseInt(indexStr, 10)
            if (!fetchedIndices.has(index)) {
              indicesToFetch.push(index)
            }
          }
        }
      })

      if (indicesToFetch.length > 0) {
        void fetchPokemonBatch(indicesToFetch, fetchedIndices)
      }
    }, {
      root: null,
      rootMargin: '200px',
      threshold: 0.01,
    })

    // Observe all visible cards to enable lazy loading across all Pokemon
    const allCards = document.querySelectorAll('[data-pokemon-index]')
    
    allCards.forEach((card) => {
      const element = card as HTMLElement
      const indexStr = element.getAttribute('data-pokemon-index')
      if (indexStr !== null) {
        const index = parseInt(indexStr, 10)
        if (!fetchedIndices.has(index)) {
          observer.observe(element)
        }
      }
    })

    return () => {
      observer.disconnect()
    }
  }, [fetchedIndices, fetchPokemonBatch])

  const handleCollect = async (index: number): Promise<void> => {
    try {
      await pokemonService.collectPokemon(index)

      // Update collection list
      const updated = pokemonService.getCollectionList()
      setCollection(updated)
    } catch (err) {
      // Silently handle errors - graceful degradation
      console.error('Failed to collect Pokemon:', err)
    }
  }

  const handleRemove = async (index: number): Promise<void> => {
    try {
      await pokemonService.removeFromCollection(index)

      // Update collection list
      const updated = pokemonService.getCollectionList()
      setCollection(updated)
    } catch (err) {
      // Silently handle errors - graceful degradation
      console.error('Failed to remove Pokemon:', err)
    }
  }

  const handleAddToWishlist = async (index: number): Promise<void> => {
    try {
      await pokemonService.addToWishlist(index)

      // Update collection list
      const updated = pokemonService.getCollectionList()
      setCollection(updated)
    } catch (err) {
      // Silently handle errors - graceful degradation
      console.error('Failed to add to wishlist:', err)
    }
  }

  const handleRemoveFromWishlist = async (index: number): Promise<void> => {
    try {
      await pokemonService.removeFromWishlist(index)

      // Update collection list
      const updated = pokemonService.getCollectionList()
      setCollection(updated)
    } catch (err) {
      // Silently handle errors - graceful degradation
      console.error('Failed to remove from wishlist:', err)
    }
  }

  // NEW: Sticky Search Bar handlers (T013, T014, T016)
  const handleSearchChange = (query: string): void => {
    setSearchQuery(query)
  }

  const handleSearchClear = (): void => {
    setSearchQuery('')
    setSearchResults(null)
  }

  const collectedCount = collection.filter((p) => p.collected).length
  
  // T024: Memoized filter functions to prevent unnecessary recalculations
  const filteredCollection = useMemo(() => {
    const collected = collection.filter((p) => p.collected)
    if (!isSearchActive || !searchResults) {
      return collected
    }
    const searchIndexSet = new Set(searchResults.map((p) => p.index))
    return collected.filter((p) => searchIndexSet.has(p.index))
  }, [collection, isSearchActive, searchResults])

  const filteredWishlist = useMemo(() => {
    const wishlist = collection.filter((p) => p.wishlist)
    if (!isSearchActive || !searchResults) {
      return wishlist
    }
    const searchIndexSet = new Set(searchResults.map((p) => p.index))
    return wishlist.filter((p) => searchIndexSet.has(p.index))
  }, [collection, isSearchActive, searchResults])

  const filteredAllPokemon = useMemo(() => {
    if (!isSearchActive || !searchResults) {
      return allPokemon
    }
    return searchResults.map((result) => {
      // Optimized: Use direct index access instead of O(N) .find()
      // allPokemon is 0-indexed, so index 1 is at [0]
      const index = result.index - 1
      if (index >= 0 && index < allPokemon.length) {
        return allPokemon[index]
      }
      return result
    })
  }, [allPokemon, isSearchActive, searchResults])

  // Create Collection and Wishlist objects from array for grid components
  // Use useMemo to avoid calling Date.now() on every render
  const mockCollection = useMemo(() => ({
    id: 'collection',
    lastUpdated: Date.now(),
    items: new Map(filteredCollection.map((p: Pokemon) => [p.index, p])),
    count: collectedCount,
  }), [filteredCollection, collectedCount])

  const mockWishlist = useMemo(() => ({
    id: 'wishlist',
    lastUpdated: Date.now(),
    items: new Map(filteredWishlist.map((p: Pokemon) => [p.index, p])),
    count: filteredWishlist.length,
  }), [filteredWishlist])

  return (
    <Box as="main" aria-label="Pokemon Collection Organizer">
      {/* Header */}
      <Box
        as="header"
        bg="gray.50"
        borderBottomWidth="1px"
        borderBottomColor="gray.200"
        py={8}
        px={{ base: 4, md: 8 }}
      >
        <Container maxW="1440px" px={{ base: 2, md: 4 }}>
          <VStack align="flex-start" gap={2}>
            <Heading as="h1" size="2xl" fontFamily="Open Sans, sans-serif">
              Pokemon Collection Organizer
            </Heading>
            <Text fontFamily="Open Sans, sans-serif" color="gray.600">
              Build and manage your Pokemon collection
            </Text>
            <Text
              fontFamily="Open Sans, sans-serif"
              color="teal.600"
              fontWeight="500"
              aria-live="polite"
              aria-atomic="true"
            >
              Collection: {collectedCount} / {Math.min(allPokemon.length, 1025)} total
            </Text>
          </VStack>
        </Container>
      </Box>

      {/* Main Content */}
      <Box as="section" aria-label="Pokemon grids">
        {/* Sticky Search Bar */}
        <StickySearchBar
          value={searchQuery}
          onChange={handleSearchChange}
          onClear={handleSearchClear}
          placeholder="Search Pokemon by name..."
          minChars={3}
        />

        {/* Three Grids Section */}
        <Container maxW="1440px" px={{ base: 2, md: 4 }} py={8}>
          <VStack
            gap={8}
            align="stretch"
            flexDir={{ base: 'column', md: 'row' }}
            alignItems={{ base: 'stretch', md: 'flex-start' }}
          >
            {/* Collected Grid */}
            <Box flex={1} minW={0}>
              <CollectionList
                pokemon={filteredCollection.map((p) => {
                  const fullPokemon = allPokemon.find((ap) => ap.index === p.index)
                  return { ...p, image: fullPokemon?.image || p.image }
                })}
                title="My Collection"
                onCollect={handleCollect}
                onRemove={handleRemove}
                onAddToWishlist={handleAddToWishlist}
              />
            </Box>

            {/* Wishlist Grid */}
            <Box flex={1} minW={0}>
              <WishlistList
                pokemon={filteredWishlist.map((p) => {
                  const fullPokemon = allPokemon.find((ap) => ap.index === p.index)
                  return { ...p, image: fullPokemon?.image || p.image }
                })}
                title="My Wishlist"
                onRemoveWishlist={handleRemoveFromWishlist}
                onCollect={handleCollect}
              />
            </Box>

            {/* Available Grid with Lazy Loading */}
            <Box flex={1} minW={0}>
              <AvailableGrid
                allPokemon={filteredAllPokemon}
                collection={mockCollection}
                wishlist={mockWishlist}
                onCollect={handleCollect}
                onAddWishlist={handleAddToWishlist}
              />
            </Box>
          </VStack>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        as="footer"
        bg="gray.50"
        borderTopWidth="1px"
        borderTopColor="gray.200"
        py={6}
        px={{ base: 4, md: 8 }}
        textAlign="center"
      >
        <Container maxW="1440px" px={{ base: 2, md: 4 }}>
          <Text fontFamily="Open Sans, sans-serif" color="gray.600" fontSize="sm">
            Total Pokemon: {collectedCount} collected, {collection.filter((p) => p.wishlist).length} wishlisted
          </Text>
        </Container>
      </Box>
    </Box>
  )
}
