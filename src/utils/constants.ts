// API Configuration
export const POKEAPI_BASE_URL: string = 'https://pokeapi.co/api/v2'
export const POKEMON_ENDPOINT: string = `${POKEAPI_BASE_URL}/pokemon`
export const POKEMON_SPECIES_ENDPOINT: string = `${POKEAPI_BASE_URL}/pokemon-species`

// Pokemon Index Range
export const MIN_POKEMON_INDEX: number = 1
export const MAX_POKEMON_INDEX: number = 1025 // Current max in PokeAPI

// Storage Keys
export const STORAGE_KEY_COLLECTION: string = 'pokemon-collection'
export const STORAGE_KEY_WISHLIST: string = 'pokemon-wishlist'
export const STORAGE_KEY_CACHE: string = 'pokemon-cache'

// T002: Names Cache Key Prefix (versioned by app version)
export const NAMES_CACHE_KEY_PREFIX: string = 'names.v'

// Cache Duration (24 hours in milliseconds)
export const CACHE_DURATION: number = 24 * 60 * 60 * 1000

// API Rate Limiting
export const API_RATE_LIMIT_DELAY: number = 100 // ms between requests
