import { ReactElement } from 'react'
import PokemonCard from './PokemonCard'

interface Pokemon {
  index: number
  name: string
  image: string | null
  collected: boolean
  wishlist: boolean
}

interface CollectionListProps {
  pokemon: Pokemon[]
  title: string
  onCollect: (index: number) => void
  onAddToWishlist: (index: number) => void
  onRemove: (index: number) => void
}

/**
 * CollectionList Component
 * Displays a list of Pokemon (collected or wishlist)
 */
export default function CollectionList({
  pokemon,
  title,
  onCollect,
  onAddToWishlist,
  onRemove
}: CollectionListProps): ReactElement {
  const count = pokemon ? pokemon.length : 0
  const countText = count === 1 ? '1 pokemon' : `${count} pokemon`

  return (
    <section className="collection-list" aria-label={title}>
      <header className="collection-header">
        <h2 id="collection-title">{title}</h2>
        <p
          className="collection-count"
          aria-live="polite"
          aria-atomic="true"
        >
          {countText}
        </p>
      </header>

      {count === 0 ? (
        <div
          className="empty-state"
          role="status"
          aria-label={`No pokemon in ${title.toLowerCase()} yet`}
        >
          <p>No pokemon in collection yet</p>
        </div>
      ) : (
        <div
          className="pokemon-grid"
          role="region"
          aria-labelledby="collection-title"
        >
          {pokemon.map((poke: Pokemon) => (
            <PokemonCard
              key={poke.index}
              pokemon={poke}
              onCollect={onCollect}
              onAddToWishlist={onAddToWishlist}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </section>
  )
}
