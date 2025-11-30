import { ReactElement } from 'react'
import PokemonCard from './PokemonCard'

interface Pokemon {
  index: number
  name: string
  image: string | null
  collected: boolean
  wishlist: boolean
}

interface Collection {
  id: string
  lastUpdated: number
  items: Map<number, Pokemon>
  count: number
}

interface Wishlist {
  id: string
  lastUpdated: number
  items: Map<number, Pokemon>
  count: number
}

interface AvailableGridProps {
  allPokemon: Pokemon[]
  collection: Collection
  wishlist: Wishlist
  onCollect: (index: number) => void
  onAddWishlist: (index: number) => void
  searchIndex?: number
}

/**
 * AvailableGrid Component
 * Displays Pokemon that are not collected and not wishlisted
 * Supports filtering by index and lazy loading
 */
export default function AvailableGrid({
  allPokemon,
  collection,
  wishlist,
  onCollect,
  onAddWishlist,
  searchIndex,
}: AvailableGridProps): ReactElement {
  // Filter Pokemon that are not collected and not wishlisted
  const availablePokemon = allPokemon.filter(
    (pokemon) =>
      !collection.items.has(pokemon.index) &&
      !wishlist.items.has(pokemon.index)
  )

  // Apply search filter if searchIndex is provided
  const filteredPokemon = searchIndex
    ? availablePokemon.filter((pokemon) =>
        pokemon.index.toString().includes(searchIndex.toString())
      )
    : availablePokemon

  // Sort by index ascending
  const sortedPokemon = [...filteredPokemon].sort((a, b) => a.index - b.index)
  const count = sortedPokemon ? sortedPokemon.length : 0
  const countText = count === 1 ? '1 pokemon' : `${count} pokemon`

  return (
    <section className="collection-list" aria-label="Available Pokemon">
      <header className="collection-header">
        <h2 id="available-title">Available Pokemon</h2>
        <p
          className="collection-count"
          aria-live="polite"
          aria-atomic="true"
        >
          {countText}
        </p>
      </header>

      {sortedPokemon.length === 0 ? (
        <div
          className="empty-state"
          role="status"
          aria-label="No available Pokemon"
        >
          <p>No available Pokemon. All Pokemon are either collected or wishlisted!</p>
        </div>
      ) : (
        <div
          className="pokemon-grid"
          role="region"
          aria-labelledby="available-title"
        >
          {sortedPokemon.map((pokemon) => (
            <PokemonCard
              key={pokemon.index}
              pokemon={pokemon}
              onCollect={() => { onCollect(pokemon.index); }}
              onRemove={() => {}} // Not used in available grid
              onAddToWishlist={() => { onAddWishlist(pokemon.index); }}
            />
          ))}
        </div>
      )}
    </section>
  )
}
