// API Configuration
export const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2'
export const POKEMON_ENDPOINT = `${POKEAPI_BASE_URL}/pokemon`
export const POKEMON_SPECIES_ENDPOINT = `${POKEAPI_BASE_URL}/pokemon-species`

// Pokemon Index Range
export const MIN_POKEMON_INDEX = 1
export const MAX_POKEMON_INDEX = 1025 // Current max in PokeAPI

// Storage Keys
export const STORAGE_KEY_COLLECTION = 'pokemon-collection'
export const STORAGE_KEY_WISHLIST = 'pokemon-wishlist'
export const STORAGE_KEY_CACHE = 'pokemon-cache'

// Cache Duration (24 hours in milliseconds)
export const CACHE_DURATION = 24 * 60 * 60 * 1000

// API Rate Limiting
export const API_RATE_LIMIT_DELAY = 100 // ms between requests

// UI Constants
export const ITEMS_PER_PAGE = 12
export const SEARCH_DEBOUNCE_DELAY = 300 // ms
