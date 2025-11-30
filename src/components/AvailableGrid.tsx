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

  return (
    <section className="available-grid-section" aria-label="Available Pokemon">
      <header>
        <h2 id="available-title">Available Pokemon ({sortedPokemon.length})</h2>
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
          className="available-grid"
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
