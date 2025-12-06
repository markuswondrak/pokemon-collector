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

// T002: Lazy Rendering Constants
export const LAZY_RENDER_BUFFER_SIZE: number = 200 // pixels above/below viewport
export const LAZY_RENDER_BATCH_SIZE: number = 25 // cards to render per batch
export const LAZY_RENDER_BATCH_DELAY: number = 16 // ms between batches (~60fps)
export const LAZY_RENDER_INTERSECTION_THRESHOLD: number = 0.01 // 1% visible triggers visibility
export const LAZY_RENDER_INTERSECTION_ROOT_MARGIN: string = '200px' // 200px buffer zone

// T007: App Version for Cache Invalidation
// Imported from package.json for semantic versioning and cache key generation
import packageJson from '../../package.json'
export const APP_VERSION: string = packageJson.version

