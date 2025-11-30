import { useState, useEffect, useMemo, ReactElement } from 'react'
import PokemonSearch from './PokemonSearch.tsx'
import CollectionList from './CollectionList.tsx'
import WishlistList from './WishlistList.tsx'
import AvailableGrid from './AvailableGrid.tsx'
import * as pokemonApi from '../services/pokemonApi.ts'
import * as pokemonService from '../services/pokemonService.ts'
import '../styles/App.css'

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
 */
export default function App(): ReactElement {
  const [currentPokemon, setCurrentPokemon] = useState<Pokemon | null>(null)
  const [collection, setCollection] = useState<Pokemon[]>([])
  const [allPokemon, setAllPokemon] = useState<Pokemon[]>([])
  const [error, setError] = useState<string>('')
  const [searchIndex, setSearchIndex] = useState<number | undefined>(undefined)
  const [fetchedIndices, setFetchedIndices] = useState<Set<number>>(new Set())

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

    // Observe only the first batch of visible cards to avoid excessive DOM operations
    // In a real app, this would use virtual scrolling to only render visible items
    const allCards = document.querySelectorAll('[data-pokemon-index]')
    const maxToObserve = Math.min(50, allCards.length)
    
    for (let i = 0; i < maxToObserve; i++) {
      const card = allCards[i] as HTMLElement
      const indexStr = card.getAttribute('data-pokemon-index')
      if (indexStr !== null) {
        const index = parseInt(indexStr, 10)
        if (!fetchedIndices.has(index)) {
          observer.observe(card)
        }
      }
    }

    return () => {
      observer.disconnect()
    }
  }, [fetchedIndices, fetchPokemonBatch])

  const handleSearch = async (index: number | string | undefined): Promise<void> => {
    if (index === undefined) {
      setSearchIndex(undefined)
      setCurrentPokemon(null)
      setError('')
      return
    }

    setError('')
    setCurrentPokemon(null)

    try {
      if (typeof index === 'number') {
        // Index-based search
        setSearchIndex(index)
        const pokemon = await pokemonApi.fetchPokemon(index)

        // Check collection for existing status
        const existing = collection.find(p => p.index === index)
        const isCollected = existing?.collected ?? false
        const isWishlisted = existing?.wishlist ?? false

        setCurrentPokemon({
          ...pokemon,
          collected: isCollected,
          wishlist: isWishlisted
        })
      } else {
        // Name-based search
        const searchQuery = index.toLowerCase().trim()
        setSearchIndex(undefined)

        // Search for Pokemon by name using the service
        const results = await pokemonService.searchPokemonByName(searchQuery)

        if (results.length === 0) {
          setError(`No Pokemon found matching "${searchQuery}"`)
          return
        }

        // If only one result, display it; if multiple, display first
        const pokemon = results[0]
        const existing = collection.find(p => p.index === pokemon.index)
        
        if (pokemon && pokemon.index) {
          // Fetch full Pokemon data from API
          try {
            const fullPokemon = await pokemonApi.fetchPokemon(pokemon.index)
            setCurrentPokemon({
              ...fullPokemon,
              collected: existing?.collected ?? false,
              wishlist: existing?.wishlist ?? false
            })
          } catch {
            // Use cached data if API fails
            setCurrentPokemon({
              ...pokemon,
              collected: existing?.collected ?? false,
              wishlist: existing?.wishlist ?? false
            })
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(`Failed to find Pokemon: ${message}`)
    }
  }

  const handleCollect = async (index: number): Promise<void> => {
    try {
      await pokemonService.collectPokemon(index)

      // Update current Pokemon display
      if (currentPokemon && currentPokemon.index === index) {
        setCurrentPokemon({
          ...currentPokemon,
          collected: true
        })
      }

      // Update collection list
      const updated = pokemonService.getCollectionList()
      setCollection(updated)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(`Failed to collect Pokemon: ${message}`)
    }
  }

  const handleRemove = async (index: number): Promise<void> => {
    try {
      await pokemonService.removeFromCollection(index)

      // Update current Pokemon display
      if (currentPokemon && currentPokemon.index === index) {
        setCurrentPokemon({
          ...currentPokemon,
          collected: false
        })
      }

      // Update collection list
      const updated = pokemonService.getCollectionList()
      setCollection(updated)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(`Failed to remove Pokemon: ${message}`)
    }
  }

  const handleAddToWishlist = async (index: number): Promise<void> => {
    try {
      await pokemonService.addToWishlist(index)

      // Update current Pokemon display
      if (currentPokemon && currentPokemon.index === index) {
        setCurrentPokemon({
          ...currentPokemon,
          wishlist: true
        })
      }

      // Update collection list
      const updated = pokemonService.getCollectionList()
      setCollection(updated)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(`Failed to add to wishlist: ${message}`)
    }
  }

  const handleRemoveFromWishlist = async (index: number): Promise<void> => {
    try {
      await pokemonService.removeFromWishlist(index)

      // Update current Pokemon display
      if (currentPokemon && currentPokemon.index === index) {
        setCurrentPokemon({
          ...currentPokemon,
          wishlist: false
        })
      }

      // Update collection list
      const updated = pokemonService.getCollectionList()
      setCollection(updated)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(`Failed to remove from wishlist: ${message}`)
    }
  }

  const handleReset = (): void => {
    setCurrentPokemon(null)
    setError('')
    setSearchIndex(undefined)
  }

  const collectedCount = collection.filter((p) => p.collected).length
  
  // Create Collection and Wishlist objects from array for grid components
  // Use useMemo to avoid calling Date.now() on every render
  const mockCollection = useMemo(() => ({
    id: 'collection',
    lastUpdated: Date.now(),
    items: new Map(collection.filter((p) => p.collected).map((p) => [p.index, p])),
    count: collectedCount,
  }), [collection, collectedCount])

  const mockWishlist = useMemo(() => ({
    id: 'wishlist',
    lastUpdated: Date.now(),
    items: new Map(collection.filter((p) => p.wishlist).map((p) => [p.index, p])),
    count: collection.filter((p) => p.wishlist).length,
  }), [collection])

  return (
    <main className="app" aria-label="Pokemon Collection Organizer">
      <header className="app-header">
        <h1>Pokemon Collection Organizer</h1>
        <p>Build and manage your Pokemon collection</p>
        <p
          className="collection-stats"
          aria-live="polite"
          aria-atomic="true"
        >
          Collection: {collectedCount} / {Math.min(allPokemon.length, 1025)} total
        </p>
      </header>

      <div className="app-main">
        {/* Search Section */}
        <section className="search-section" aria-label="Search tools">
          <PokemonSearch onSearch={handleSearch} onReset={handleReset} />
          {error && (
            <div
              className="error-message"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
          )}
        </section>

        {/* Three Grid Section */}
        <section className="three-grids-section" aria-label="Pokemon grids">
          {/* Collected Grid */}
          <CollectionList
            pokemon={collection.filter((p) => p.collected)}
            title="My Collection"
            onCollect={handleCollect}
            onRemove={handleRemove}
            onAddToWishlist={handleAddToWishlist}
          />

          {/* Wishlist Grid */}
          <WishlistList
            pokemon={collection.filter((p) => p.wishlist)}
            title="My Wishlist"
            onRemoveWishlist={handleRemoveFromWishlist}
            onCollect={handleCollect}
          />

          {/* Available Grid with Lazy Loading */}
          <AvailableGrid
            allPokemon={allPokemon}
            collection={mockCollection}
            wishlist={mockWishlist}
            onCollect={handleCollect}
            onAddWishlist={handleAddToWishlist}
            searchIndex={searchIndex}
          />
        </section>
      </div>

      <footer className="app-footer">
        <p>
          Total Pokemon: {collectedCount} collected, {collection.filter((p) => p.wishlist).length} wishlisted
        </p>
      </footer>
    </main>
  )
}
