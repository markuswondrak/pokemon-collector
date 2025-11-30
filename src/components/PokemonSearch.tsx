import { useState, ReactElement, ChangeEvent, KeyboardEvent } from 'react'
import { MIN_POKEMON_INDEX, MAX_POKEMON_INDEX } from '../utils/constants'

interface PokemonSearchProps {
  onSearch: (index: number | string) => void
  onReset: () => void
}

type SearchMode = 'index' | 'name'

/**
 * PokemonSearch Component
 * Provides search functionality for finding Pokemon by index or name
 */
export default function PokemonSearch({
  onSearch,
  onReset
}: PokemonSearchProps): ReactElement {
  const [searchInput, setSearchInput] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [searchMode, setSearchMode] = useState<SearchMode>('index')

  const validateAndSearch = (): void => {
    setError('')

    if (!searchInput.trim()) {
      setError('Please enter a Pokemon index or name')
      return
    }

    if (searchMode === 'index') {
      // Search by index
      const index = parseInt(searchInput, 10)

      if (isNaN(index)) {
        setError('Invalid input - please enter a number')
        return
      }

      if (index < MIN_POKEMON_INDEX || index > MAX_POKEMON_INDEX) {
        setError(
          `Pokemon index must be between ${String(MIN_POKEMON_INDEX)} and ${String(MAX_POKEMON_INDEX)}`
        )
        return
      }

      if (onSearch) {
        onSearch(index)
      }
    } else {
      // Search by name
      const query = searchInput.trim()

      if (query.length < 2) {
        setError('Please enter at least 2 characters for name search')
        return
      }

      if (onSearch) {
        onSearch(query)
      }
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

  const toggleSearchMode = (): void => {
    setSearchMode(searchMode === 'index' ? 'name' : 'index')
    setSearchInput('')
    setError('')
  }

  const placeholders = {
    index: `Enter Pokemon index (${String(MIN_POKEMON_INDEX)}-${String(MAX_POKEMON_INDEX)})`,
    name: 'Enter Pokemon name (e.g., Pikachu, Charizard)'
  }

  return (
    <section className="pokemon-search" aria-label="Pokemon search">
      <fieldset className="search-mode-toggle">
        <legend>Search method:</legend>
        <button
          id="search-mode"
          className={`mode-toggle ${searchMode}`}
          onClick={toggleSearchMode}
          aria-label={`Switch to ${searchMode === 'index' ? 'name' : 'index'} search`}
          aria-pressed={searchMode === 'name'}
        >
          {searchMode === 'index' ? 'Index' : 'Name'}
        </button>
      </fieldset>

      <div className="search-input-group">
        <label htmlFor="pokemon-search-input" className="search-label">
          {searchMode === 'index' ? 'Pokemon Index' : 'Pokemon Name'}
        </label>
        <input
          id="pokemon-search-input"
          type="text"
          placeholder={placeholders[searchMode]}
          value={searchInput}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          className="search-input"
          aria-label={`Enter ${searchMode === 'index' ? 'Pokemon index' : 'Pokemon name'}`}
          aria-describedby={error ? 'search-error-message' : undefined}
          aria-invalid={!!error}
        />
      </div>

      <div className="search-buttons">
        <button
          className="btn btn-primary"
          onClick={validateAndSearch}
          aria-label="Search for Pokemon"
        >
          Search
        </button>
        <button
          className="btn btn-secondary"
          onClick={handleReset}
          aria-label="Clear search and reset"
        >
          Reset
        </button>
      </div>

      {error && (
        <div
          className="search-error"
          role="alert"
          id="search-error-message"
        >
          <p>{error}</p>
        </div>
      )}
    </section>
  )
}
