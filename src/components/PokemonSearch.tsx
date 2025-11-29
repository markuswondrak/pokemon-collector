import { useState, ReactElement, ChangeEvent, KeyboardEvent } from 'react'
import { MIN_POKEMON_INDEX, MAX_POKEMON_INDEX } from '../utils/constants'

interface PokemonSearchProps {
  onSearch: (index: number) => void
  onReset: () => void
}

/**
 * PokemonSearch Component
 * Provides search functionality for finding Pokemon by index
 */
export default function PokemonSearch({
  onSearch,
  onReset
}: PokemonSearchProps): ReactElement {
  const [searchInput, setSearchInput] = useState<string>('')
  const [error, setError] = useState<string>('')

  const validateAndSearch = (): void => {
    setError('')

    if (!searchInput.trim()) {
      setError('Please enter a Pokemon index')
      return
    }

    const index = parseInt(searchInput, 10)

    if (isNaN(index)) {
      setError('Invalid input - please enter a number')
      return
    }

    if (index < MIN_POKEMON_INDEX || index > MAX_POKEMON_INDEX) {
      setError(
        `Pokemon index must be between ${MIN_POKEMON_INDEX} and ${MAX_POKEMON_INDEX}`
      )
      return
    }

    if (onSearch) {
      onSearch(index)
    }

    setSearchInput('')
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      validateAndSearch()
    }
  }

  const handleReset = (): void => {
    setSearchInput('')
    setError('')
    if (onReset) {
      onReset()
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchInput(e.target.value)
  }

  return (
    <div className="pokemon-search">
      <div className="search-input-group">
        <input
          type="text"
          placeholder="Enter Pokemon index (1-898)"
          value={searchInput}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          className="search-input"
        />
      </div>

      <div className="search-buttons">
        <button className="btn btn-primary" onClick={validateAndSearch}>
          Search
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          Reset
        </button>
      </div>

      {error && (
        <div className="search-error">
          <p>{error}</p>
        </div>
      )}
    </div>
  )
}
