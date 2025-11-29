import { ReactElement } from 'react'

interface Pokemon {
  index: number
  name: string
  image: string | null
  collected: boolean
  wishlist: boolean
}

interface PokemonCardProps {
  pokemon: Pokemon
  onCollect: (index: number) => void
  onAddToWishlist: (index: number) => void
  onRemove: (index: number) => void
}

/**
 * PokemonCard Component
 * Displays a single Pokemon with its information and action buttons
 */
export default function PokemonCard({
  pokemon,
  onCollect,
  onAddToWishlist,
  onRemove
}: PokemonCardProps): ReactElement {
  const handleCollect = (): void => {
    if (onCollect) {
      onCollect(pokemon.index)
    }
  }

  const handleAddToWishlist = (): void => {
    if (onAddToWishlist) {
      onAddToWishlist(pokemon.index)
    }
  }

  const handleRemove = (): void => {
    if (onRemove) {
      onRemove(pokemon.index)
    }
  }

  return (
    <div className="pokemon-card">
      <div className="pokemon-card-image">
        {pokemon.image ? (
          <img src={pokemon.image} alt={pokemon.name} />
        ) : (
          <div className="pokemon-image-placeholder">No Image</div>
        )}
      </div>

      <div className="pokemon-card-content">
        <h3 className="pokemon-name">{pokemon.name}</h3>
        <p className="pokemon-index">#{pokemon.index}</p>

        {pokemon.collected && (
          <div className="pokemon-badge collected-badge">✓ Collected</div>
        )}

        {pokemon.wishlist && (
          <div className="pokemon-badge wishlist-badge">♡ Wishlist</div>
        )}
      </div>

      <div className="pokemon-card-actions">
        {!pokemon.collected ? (
          <button
            className="btn btn-collect"
            onClick={handleCollect}
            title="Add to collection"
          >
            Collect
          </button>
        ) : (
          <button
            className="btn btn-remove"
            onClick={handleRemove}
            title="Remove from collection"
          >
            Remove
          </button>
        )}

        <button
          className="btn btn-wishlist"
          onClick={handleAddToWishlist}
          disabled={pokemon.collected}
          title={
            pokemon.collected
              ? 'Cannot add collected Pokemon to wishlist'
              : 'Add to wishlist'
          }
        >
          {pokemon.wishlist ? '♡ In Wishlist' : '♡ Wishlist'}
        </button>
      </div>
    </div>
  )
}
