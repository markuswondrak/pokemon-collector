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
    <div className="collection-list">
      <div className="collection-header">
        <h2>{title}</h2>
        <p className="collection-count">{countText}</p>
      </div>

      {count === 0 ? (
        <div className="empty-state">
          <p>No pokemon in collection yet</p>
        </div>
      ) : (
        <div className="pokemon-grid">
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
    </div>
  )
}
