/**
 * Collection Model
 * Represents a user's collection of Pokemon with metadata
 */

import { Pokemon } from './Pokemon'

export class Collection {
  constructor(id = 'my-collection', pokemon = []) {
    this.id = id
    this.pokemon = pokemon
    this.createdAt = new Date()
    this.updatedAt = new Date()
  }

  /**
   * Add a Pokemon to the collection
   * @param {Pokemon} pokemon - Pokemon instance to add
   * @throws Error if Pokemon with same index already exists or if not marked as collected
   */
  addPokemon(pokemon) {
    if (!pokemon.collected) {
      throw new Error('Pokemon must be marked as collected before adding to collection.')
    }

    if (this.contains(pokemon.index)) {
      throw new Error(`Pokemon with index ${pokemon.index} already exists in collection.`)
    }

    this.pokemon.push(pokemon)
    this.updatedAt = new Date()
  }

  /**
   * Remove a Pokemon from the collection by index
   * @param {number} index - Pokemon index to remove
   * @throws Error if Pokemon does not exist
   */
  removePokemon(index) {
    const initialLength = this.pokemon.length
    this.pokemon = this.pokemon.filter((p) => p.index !== index)

    if (this.pokemon.length === initialLength) {
      throw new Error(`Pokemon with index ${index} not found in collection.`)
    }

    this.updatedAt = new Date()
  }

  /**
   * Get a Pokemon from the collection by index
   * @param {number} index - Pokemon index to find
   * @returns {Pokemon|undefined} - Pokemon instance or undefined if not found
   */
  getPokemon(index) {
    return this.pokemon.find((p) => p.index === index)
  }

  /**
   * Check if a Pokemon is in the collection
   * @param {number} index - Pokemon index to check
   * @returns {boolean} - True if Pokemon is in collection
   */
  contains(index) {
    return this.pokemon.some((p) => p.index === index)
  }

  /**
   * Get total count of Pokemon in collection
   * @returns {number} - Count of Pokemon
   */
  getCount() {
    return this.pokemon.length
  }

  /**
   * Convert collection to JSON object
   * @returns {Object} - JSON representation of collection
   */
  toJSON() {
    return {
      id: this.id,
      pokemon: this.pokemon.map((p) => (p.toJSON ? p.toJSON() : p)),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    }
  }

  /**
   * Create Collection instance from JSON object
   * @param {Object} json - JSON object with collection data
   * @returns {Collection} - New Collection instance
   * @throws Error if JSON data is invalid
   */
  static fromJSON(json) {
    const pokemon = json.pokemon.map((p) => Pokemon.fromJSON(p))
    const collection = new Collection(json.id, pokemon)
    collection.createdAt = new Date(json.createdAt)
    collection.updatedAt = new Date(json.updatedAt)
    return collection
  }
}
