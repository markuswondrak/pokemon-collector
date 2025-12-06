import axios from 'axios'
import {
  POKEMON_ENDPOINT,
  MIN_POKEMON_INDEX,
  MAX_POKEMON_INDEX,
  CACHE_DURATION,
  API_RATE_LIMIT_DELAY,
  APP_VERSION
} from '../utils/constants'

export interface Pokemon {
  index: number
  name: string
  image: string
}

interface PokemonApiResponse {
  id: number
  name: string
  sprites: {
    front_default: string | null
    other?: {
      'official-artwork'?: {
        front_default: string | null
      }
    }
  }
}

interface CacheEntry {
  data: Pokemon
  timestamp: number
}

// T003: In-memory response cache for API endpoints (session-scoped)
interface ResponseCacheEntry<T> {
  data: T
  timestamp: number
  version: string
}

/**
 * Pokemon API Service
 * Handles all PokeAPI calls with caching and rate limiting
 */
class PokemonApiService {
  private cache: Map<string, CacheEntry>
  private lastRequestTime: number
  private allPokemonList: { name: string; url: string }[] | null
  
  // T003: Response cache for list/detail endpoints
  private responseCache: Map<string, ResponseCacheEntry<unknown>>
  
  // T004: In-flight request deduplication
  private inFlightRequests: Map<string, Promise<unknown>>

  constructor() {
    this.cache = new Map()
    this.lastRequestTime = 0
    this.allPokemonList = null
    this.responseCache = new Map()
    this.inFlightRequests = new Map()
  }

  /**
   * Validate Pokemon index
   * @param {number} index - Pokemon index to validate
   * @throws Error if index is invalid
   */
  private _validateIndex(index: number): void {
    if (
      !Number.isInteger(index) ||
      index < MIN_POKEMON_INDEX ||
      index > MAX_POKEMON_INDEX
    ) {
      throw new Error(
        `Invalid Pokemon index: ${String(index)}. Must be between ${String(MIN_POKEMON_INDEX)} and ${String(MAX_POKEMON_INDEX)}.`
      )
    }
  }

  /**
   * T003: Check if response cache entry is valid
   * Invalidates on version mismatch or expiry
   */
  private _isResponseCacheValid(
    entry: ResponseCacheEntry<unknown> | undefined
  ): boolean {
    if (!entry) return false
    if (entry.version !== APP_VERSION) return false // Invalidate on version change
    if (Date.now() - entry.timestamp >= CACHE_DURATION) return false
    return true
  }

  /**
   * T003: Get response from cache or execute request with deduplication
   * @param cacheKey - Unique cache key
   * @param fetcher - Function that fetches data
   * @returns Cached or freshly fetched data
   */
  private async _getCachedOrFetch<T>(
    cacheKey: string,
    fetcher: () => Promise<T>
  ): Promise<T> {
    // Check response cache first
    const cached = this.responseCache.get(cacheKey) as ResponseCacheEntry<T> | undefined
    if (this._isResponseCacheValid(cached)) {
      return cached.data
    }

    // T004: Deduplicate in-flight requests
    if (this.inFlightRequests.has(cacheKey)) {
      return this.inFlightRequests.get(cacheKey) as Promise<T>
    }

    // Execute fetch and cache request promise
    const request = fetcher().then((data) => {
      this.responseCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        version: APP_VERSION
      })
      this.inFlightRequests.delete(cacheKey)
      return data
    }).catch((error: unknown) => {
      this.inFlightRequests.delete(cacheKey)
      throw error
    })

    this.inFlightRequests.set(cacheKey, request)
    return request
  }

  /**
   * Apply rate limiting delay
   * @private
   */
  private async _applyRateLimit(): Promise<void> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    if (timeSinceLastRequest < API_RATE_LIMIT_DELAY) {
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          API_RATE_LIMIT_DELAY - timeSinceLastRequest
        )
      )
    }
    this.lastRequestTime = Date.now()
  }

  /**
   * Get cache key for Pokemon
   * @private
   */
  private _getCacheKey(index: number): string {
    return `pokemon_${String(index)}`
  }

  /**
   * Fetch single Pokemon by index from API
   * @param {number} index - Pokemon index
   * @returns {Promise<Pokemon>} - Pokemon instance
   * @throws Error if index is invalid or Pokemon not found
   */
  async fetchPokemon(index: number): Promise<Pokemon> {
    this._validateIndex(index)

    // Check cache
    const cacheKey = this._getCacheKey(index)
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data
      }
      this.cache.delete(cacheKey)
    }

    // Apply rate limiting
    await this._applyRateLimit()

    try {
      const response = await axios.get<PokemonApiResponse>(
        `${POKEMON_ENDPOINT}/${String(index)}`
      )
      const data = response.data

      const imageUrl =
        data.sprites.other?.['official-artwork']?.front_default ??
        data.sprites.front_default ??
        ''

      const pokemon: Pokemon = {
        index: data.id,
        name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
        image: imageUrl || 'https://via.placeholder.com/96'
      }

      // Cache result
      this.cache.set(cacheKey, {
        data: pokemon,
        timestamp: Date.now()
      })

      return pokemon
    } catch (error: unknown) {
      const err = error as { response?: { status: number }; message: string }
      if (err.response?.status === 404) {
        throw new Error(`Pokemon with index ${String(index)} not found`)
      }
      throw new Error(`Failed to fetch Pokemon: ${err.message}`)
    }
  }

  /**
   * Fetch multiple Pokemon by indices
   * @param {number[]} indices - Array of Pokemon indices
   * @returns {Promise<Pokemon[]>} - Array of Pokemon instances
   */
  async fetchMultiplePokemon(indices: number[]): Promise<Pokemon[]> {
    if (indices.length === 0) {
      return []
    }

    // Validate all indices first
    indices.forEach((index) => { this._validateIndex(index); })

    const results = await Promise.all(
      indices.map((index) => this.fetchPokemon(index))
    )
    return results
  }

  /**
   * T003/T006: Fetch list of all Pokemon names and URLs
   * Uses response cache and deduplication for single-call-per-session
   * @returns {Promise<{ name: string; url: string }[]>}
   */
  async getAllPokemonList(): Promise<{ name: string; url: string }[]> {
    const cacheKey = 'pokemon_list_all'
    return this._getCachedOrFetch(cacheKey, async () => {
      try {
        const response = await axios.get<{ results: { name: string; url: string }[] }>(
          `${POKEMON_ENDPOINT}?limit=20000`
        )
        this.allPokemonList = response.data.results
        return this.allPokemonList
      } catch (error) {
        const err = error as { message: string; response?: { status: number } }
        const message = err.response?.status 
          ? `Failed to fetch Pokemon list (HTTP ${String(err.response.status)})`
          : `Failed to fetch Pokemon list: ${err.message}`
        throw new Error(message)
      }
    })
  }

  /**
   * Search Pokemon by name (returns indices and names)
   * @param {string} query - Search query
   * @returns {Promise<{ index: number; name: string }[]>}
   */
  async searchPokemonSimple(query: string): Promise<{ index: number; name: string }[]> {
    if (!query || typeof query !== 'string') {
      return []
    }

    const searchTerm = query.toLowerCase().trim()
    const allPokemon = await this.getAllPokemonList()

    return allPokemon
      .map((p, i) => ({ index: i + 1, name: p.name }))
      .filter((p) => p.name.includes(searchTerm))
  }

  /**
   * Search Pokemon by name
   * @param {string} query - Search query
   * @returns {Promise<Pokemon[]>} - Array of matching Pokemon
   */
  async searchPokemon(query: string): Promise<Pokemon[]> {
    if (!query || typeof query !== 'string') {
      return []
    }

    const searchTerm = query.toLowerCase().trim()

    // Apply rate limiting
    await this._applyRateLimit()

    try {
      // For now, just return a small hardcoded list for testing
      // In production, this would be replaced with a proper search API call
      const commonPokemon = [
        { id: 1, name: 'Bulbasaur' },
        { id: 4, name: 'Charmander' },
        { id: 7, name: 'Squirtle' },
        { id: 25, name: 'Pikachu' },
        { id: 39, name: 'Jigglypuff' },
        { id: 50, name: 'Diglett' }
      ]

      const results: Pokemon[] = []
      for (const pokemon of commonPokemon) {
        if (pokemon.name.toLowerCase().includes(searchTerm)) {
          try {
            const fullPokemon = await this.fetchPokemon(pokemon.id)
            results.push(fullPokemon)
          } catch {
            // Skip Pokemon that fail to load
          }
        }
      }
      return results
    } catch (error: unknown) {
      const err = error as { message: string }
      throw new Error(`Search failed: ${err.message}`)
    }
  }

  /**
   * Get Pokemon by index range
   * @param {number} start - Start index (inclusive)
   * @param {number} end - End index (inclusive)
   * @returns {Promise<Pokemon[]>} - Array of Pokemon in range
   */
  async getPokemonByRange(start: number, end: number): Promise<Pokemon[]> {
    if (
      !Number.isInteger(start) ||
      !Number.isInteger(end) ||
      start < MIN_POKEMON_INDEX ||
      end > MAX_POKEMON_INDEX ||
      start > end
    ) {
      throw new Error(
        `Invalid range: ${String(start)}-${String(end)}. Must be valid integers with start <= end.`
      )
    }

    const indices: number[] = []
    for (let i = start; i <= end; i++) {
      indices.push(i)
    }

    return this.fetchMultiplePokemon(indices)
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear()
    this.responseCache.clear()
    this.inFlightRequests.clear()
    this.allPokemonList = null
  }

  /**
   * T003: Invalidate response cache for version change
   * Clears all cached responses to force refresh on app version change
   */
  invalidateResponseCache(): void {
    this.responseCache.clear()
    this.allPokemonList = null
  }

  /**
   * T003: Get response cache stats for monitoring
   */
  getResponseCacheSize(): number {
    return this.responseCache.size
  }
}

// Export singleton instance and functions
const instance = new PokemonApiService()

export const pokemonApi = instance
export const fetchPokemon = (index: number): Promise<Pokemon> =>
  instance.fetchPokemon(index)
export const fetchMultiplePokemon = (indices: number[]): Promise<Pokemon[]> =>
  instance.fetchMultiplePokemon(indices)
export const getAllPokemonList = (): Promise<{ name: string; url: string }[]> =>
  instance.getAllPokemonList()
export const searchPokemon = (query: string): Promise<Pokemon[]> =>
  instance.searchPokemon(query)
export const searchPokemonSimple = (query: string): Promise<{ index: number; name: string }[]> =>
  instance.searchPokemonSimple(query)
export const getPokemonByRange = (
  start: number,
  end: number
): Promise<Pokemon[]> => instance.getPokemonByRange(start, end)
export const clearCache = (): void => { instance.clearCache(); }
export const invalidateResponseCache = (): void => { instance.invalidateResponseCache(); }
export const getResponseCacheSize = (): number => instance.getResponseCacheSize()

