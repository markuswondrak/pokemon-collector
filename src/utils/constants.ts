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

// T003: Image Cache Constants
export const IMAGE_CACHE_KEY_PREFIX: string = 'pokemon_image_'
export const IMAGE_CACHE_METADATA_KEY: string = 'pokemon_image_metadata'
export const IMAGE_CACHE_MAX_SIZE_BYTES: number = 5 * 1024 * 1024 // 5MB quota limit
export const IMAGE_CACHE_EVICTION_THRESHOLD: number = 0.9 // Trigger eviction at 90% capacity
export const IMAGE_CACHE_AVG_IMAGE_SIZE: number = 50 * 1024 // Average 50KB per image

// Cache Duration (24 hours in milliseconds)
export const CACHE_DURATION: number = 24 * 60 * 60 * 1000

// API Rate Limiting
export const API_RATE_LIMIT_DELAY: number = 100 // ms between requests

// T007: App Version for Cache Invalidation
// Imported from package.json for semantic versioning and cache key generation
import packageJson from '../../package.json'
export const APP_VERSION: string = packageJson.version

