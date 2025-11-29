/**
 * Pokemon API Service
 * Handles all PokeAPI calls with caching and rate limiting
 */

import axios from 'axios'
import { POKEMON_ENDPOINT, MIN_POKEMON_INDEX, MAX_POKEMON_INDEX, CACHE_DURATION, API_RATE_LIMIT_DELAY } from '../utils/constants'
import { Pokemon } from '../models/Pokemon'

class PokemonApi {
  constructor() {
    this.cache = new Map()
    this.lastRequestTime = 0
  }

  /**
   * Validate Pokemon index
   * @param {number} index - Pokemon index to validate
   * @throws Error if index is invalid
   */
  _validateIndex(index) {
    if (!Number.isInteger(index) || index < MIN_POKEMON_INDEX || index > MAX_POKEMON_INDEX) {
      throw new Error(`Invalid Pokemon index: ${index}. Must be between ${MIN_POKEMON_INDEX} and ${MAX_POKEMON_INDEX}.`)
    }
  }

  /**
   * Apply rate limiting delay
   * @private
   */
  async _applyRateLimit() {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    if (timeSinceLastRequest < API_RATE_LIMIT_DELAY) {
      await new Promise((resolve) => setTimeout(resolve, API_RATE_LIMIT_DELAY - timeSinceLastRequest))
    }
    this.lastRequestTime = Date.now()
  }

  /**
   * Get cache key for Pokemon
   * @private
   */
  _getCacheKey(index) {
    return `pokemon_${index}`
  }

  /**
   * Fetch single Pokemon by index from API
   * @param {number} index - Pokemon index
   * @returns {Promise<Pokemon>} - Pokemon instance
   * @throws Error if index is invalid or Pokemon not found
   */
  async fetchPokemon(index) {
    this._validateIndex(index)

    // Check cache
    const cacheKey = this._getCacheKey(index)
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data
      }
      this.cache.delete(cacheKey)
    }

    // Apply rate limiting
    await this._applyRateLimit()

    try {
      const response = await axios.get(`${POKEMON_ENDPOINT}/${index}`)
      const data = response.data

      const pokemon = new Pokemon(
        data.id,
        data.name.charAt(0).toUpperCase() + data.name.slice(1),
        data.sprites.other['official-artwork'].front_default || data.sprites.front_default
      )

      // Cache result
      this.cache.set(cacheKey, {
        data: pokemon,
        timestamp: Date.now()
      })

      return pokemon
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error(`Pokemon with index ${index} not found`)
      }
      throw new Error(`Failed to fetch Pokemon: ${error.message}`)
    }
  }

  /**
   * Fetch multiple Pokemon by indices
   * @param {number[]} indices - Array of Pokemon indices
   * @returns {Promise<Pokemon[]>} - Array of Pokemon instances
   */
  async fetchMultiplePokemon(indices) {
    if (indices.length === 0) {
      return []
    }

    // Validate all indices first
    indices.forEach((index) => this._validateIndex(index))

    const results = await Promise.all(indices.map((index) => this.fetchPokemon(index)))
    return results
  }

  /**
   * Search Pokemon by name
   * @param {string} query - Search query
   * @returns {Promise<Pokemon[]>} - Array of matching Pokemon
   */
  async searchPokemon(query) {
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

      const results = []
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
    } catch (error) {
      throw new Error(`Search failed: ${error.message}`)
    }
  }

  /**
   * Get Pokemon by index range
   * @param {number} start - Start index (inclusive)
   * @param {number} end - End index (inclusive)
   * @returns {Promise<Pokemon[]>} - Array of Pokemon in range
   */
  async getPokemonByRange(start, end) {
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < MIN_POKEMON_INDEX || end > MAX_POKEMON_INDEX || start > end) {
      throw new Error(`Invalid range: ${start}-${end}. Must be valid integers with start <= end.`)
    }

    const indices = []
    for (let i = start; i <= end; i++) {
      indices.push(i)
    }

    return this.fetchMultiplePokemon(indices)
  }

  /**
   * Clear the cache
   */
  clearCache() {
    this.cache.clear()
  }
}

// Export singleton instance
export const pokemonApi = new PokemonApi()
