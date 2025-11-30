import { ReactElement } from 'react'
import PokemonCard from './PokemonCard'

interface Pokemon {
  index: number
  name: string
  image: string | null
  collected: boolean
  wishlist: boolean
}

interface WishlistListProps {
  pokemon: Pokemon[]
  title: string
  onRemoveWishlist: (index: number) => void
  onCollect: (index: number) => void
}

/**
 * WishlistList Component
 * Displays a grid of wishlisted Pokemon
 */
export default function WishlistList({
  pokemon,
  title,
  onRemoveWishlist,
  onCollect
}: WishlistListProps): ReactElement {
  const count = pokemon ? pokemon.length : 0
  const countText = count === 1 ? '1 pokemon' : `${count} pokemon`

  return (
    <section className="collection-list" aria-label={title}>
      <header className="collection-header">
        <h2 id="wishlist-title">{title}</h2>
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
          aria-labelledby="wishlist-title"
        >
          {pokemon.map((poke: Pokemon) => (
            <PokemonCard
              key={poke.index}
              pokemon={poke}
              onCollect={onCollect}
              onRemove={onRemoveWishlist}
              onAddToWishlist={onRemoveWishlist}
            />
          ))}
        </div>
      )}
    </section>
  )
}
