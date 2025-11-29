import { useState, useEffect, ReactElement } from 'react'
import PokemonSearch from './PokemonSearch.tsx'
import PokemonCard from './PokemonCard.tsx'
import CollectionList from './CollectionList.tsx'
import WishlistList from './WishlistList.tsx'
import AvailableGrid from './AvailableGrid.tsx'
import LazyLoadingGrid from './LazyLoadingGrid.tsx'
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
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [searchIndex, setSearchIndex] = useState<number | undefined>(undefined)

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
  }, [])

  const handleSearch = async (index: number | undefined): Promise<void> => {
    if (index === undefined) {
      setSearchIndex(undefined)
      setCurrentPokemon(null)
      setError('')
      return
    }

    setLoading(true)
    setError('')
    setCurrentPokemon(null)
    setSearchIndex(index)

    try {
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
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(`Failed to find Pokemon: ${message}`)
      console.error('[App] Search error:', err)
    } finally {
      setLoading(false)
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

      console.log('[App] Pokemon collected:', index)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(`Failed to collect Pokemon: ${message}`)
      console.error('[App] Collect error:', err)
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

      console.log('[App] Pokemon removed:', index)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(`Failed to remove Pokemon: ${message}`)
      console.error('[App] Remove error:', err)
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

      console.log('[App] Pokemon added to wishlist:', index)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(`Failed to add to wishlist: ${message}`)
      console.error('[App] Wishlist error:', err)
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

      console.log('[App] Pokemon removed from wishlist:', index)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(`Failed to remove from wishlist: ${message}`)
      console.error('[App] Remove from wishlist error:', err)
    }
  }

  const handleReset = (): void => {
    setCurrentPokemon(null)
    setError('')
    setSearchIndex(undefined)
  }

  const collectedCount = collection.filter((p) => p.collected).length
  
  // Create Collection and Wishlist objects from array for grid components
  const mockCollection = {
    id: 'collection',
    lastUpdated: Date.now(),
    items: new Map(collection.filter((p) => p.collected).map((p) => [p.index, p])),
    count: collectedCount,
  }

  const mockWishlist = {
    id: 'wishlist',
    lastUpdated: Date.now(),
    items: new Map(collection.filter((p) => p.wishlist).map((p) => [p.index, p])),
    count: collection.filter((p) => p.wishlist).length,
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>Pokemon Collection Organizer</h1>
        <p>Build and manage your Pokemon collection</p>
        <p className="collection-stats">
          Collection: {collectedCount} / {Math.min(allPokemon.length, 1025)} total
        </p>
      </header>

      <div className="app-main">
        {/* Search Section */}
        <section className="search-section">
          <PokemonSearch onSearch={handleSearch} onReset={handleReset} />
          {error && <div className="error-message">{error}</div>}
        </section>

        {/* Three Grid Section */}
        <section className="three-grids-section">
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
          <section className="available-grid-wrapper">
            <AvailableGrid
              allPokemon={allPokemon}
              collection={mockCollection}
              wishlist={mockWishlist}
              onCollect={handleCollect}
              onAddWishlist={handleAddToWishlist}
              searchIndex={searchIndex}
            />
          </section>
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
