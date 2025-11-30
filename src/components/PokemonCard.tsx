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

  const ariaLabel = `${pokemon.name} Pokemon #${pokemon.index}`
  const statusText = [
    pokemon.collected && 'Collected',
    pokemon.wishlist && 'Wishlisted'
  ].filter(Boolean).join(', ')

  return (
    <article
      className="pokemon-card"
      data-pokemon-index={pokemon.index}
      aria-label={ariaLabel}
      role="region"
    >
      <div className="pokemon-card-image">
        {pokemon.image ? (
          <img
            src={pokemon.image}
            alt={`${pokemon.name} sprite`}
            loading="lazy"
          />
        ) : (
          <div
            className="pokemon-image-placeholder"
            role="status"
            aria-label="Image not available"
          >
            No Image
          </div>
        )}
      </div>

      <div className="pokemon-card-content">
        <h3 className="pokemon-name">{pokemon.name}</h3>
        <p className="pokemon-index">#{pokemon.index}</p>

        {statusText && (
          <div
            className="pokemon-status"
            role="status"
            aria-label={`Status: ${statusText}`}
          >
            {pokemon.collected && (
              <span className="pokemon-badge collected-badge" aria-label="Collected">
                ✓ Collected
              </span>
            )}

            {pokemon.wishlist && (
              <span className="pokemon-badge wishlist-badge" aria-label="Wishlisted">
                ♡ Wishlist
              </span>
            )}
          </div>
        )}
      </div>

      <div className="pokemon-card-actions">
        {!pokemon.collected ? (
          <button
            className="btn btn-collect"
            onClick={handleCollect}
            aria-label={`Add ${pokemon.name} to collection`}
          >
            Collect
          </button>
        ) : (
          <button
            className="btn btn-remove"
            onClick={handleRemove}
            aria-label={`Remove ${pokemon.name} from collection`}
          >
            Remove
          </button>
        )}

        <button
          className="btn btn-wishlist"
          onClick={handleAddToWishlist}
          disabled={pokemon.collected}
          aria-label={
            pokemon.collected
              ? `Cannot add ${pokemon.name} to wishlist (already collected)`
              : pokemon.wishlist
                ? `Remove ${pokemon.name} from wishlist`
                : `Add ${pokemon.name} to wishlist`
          }
          aria-pressed={pokemon.wishlist}
        >
          {pokemon.wishlist ? '♡ In Wishlist' : '♡ Wishlist'}
        </button>
      </div>
    </article>
  )
}
