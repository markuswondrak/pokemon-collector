import { useState, useEffect, ReactElement } from 'react'
import PokemonSearch from './PokemonSearch.tsx'
import PokemonCard from './PokemonCard.tsx'
import CollectionList from './CollectionList.tsx'
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
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  // Load collection from storage on mount
  useEffect(() => {
    const stored = pokemonService.getCollectionList()
    setCollection(stored)
  }, [])

  const handleSearch = async (index: number): Promise<void> => {
    setLoading(true)
    setError('')
    setCurrentPokemon(null)

    try {
      const pokemon = await pokemonApi.fetchPokemon(index)

      // Check if already collected
      const isCollected = collection.some(p => p.index === index && p.collected)

      setCurrentPokemon({
        ...pokemon,
        collected: isCollected,
        wishlist: false
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

  const handleReset = (): void => {
    setCurrentPokemon(null)
    setError('')
  }

  const collectedCount = collection.filter((p) => p.collected).length

  return (
    <main className="app">
      <header className="app-header">
        <h1>Pokemon Collection Organizer</h1>
        <p>Search for Pokemon and build your collection</p>
      </header>

      <div className="app-main">
        {/* Search Section */}
        <section className="search-section">
          <PokemonSearch onSearch={handleSearch} onReset={handleReset} />
          {error && <div className="error-message">{error}</div>}
        </section>

        {/* Pokemon Display Section */}
        <section className="pokemon-display">
          {loading && (
            <div className="loading">
              <p>Loading Pokemon...</p>
            </div>
          )}

          {currentPokemon && !loading && (
            <div className="pokemon-card-container">
              <PokemonCard
                pokemon={currentPokemon}
                onCollect={handleCollect}
                onRemove={handleRemove}
                onAddToWishlist={() => {}}
              />
            </div>
          )}

          {!currentPokemon && !loading && !error && (
            <div className="search-prompt">
              <p>Search for a Pokemon to get started!</p>
            </div>
          )}
        </section>

        {/* Collection Section */}
        <section className="collection-section">
          <CollectionList
            pokemon={collection.filter((p) => p.collected)}
            title="My Collection"
            onCollect={handleCollect}
            onRemove={handleRemove}
            onAddToWishlist={() => {}}
          />
        </section>
      </div>

      <footer className="app-footer">
        <p>
          Collection: {collectedCount} / {collection.length} total
        </p>
      </footer>
    </main>
  )
}
