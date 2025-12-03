import {
  getCollection as getStoredCollection,
  saveCollection
} from './collectionStorage.ts'
import { MIN_POKEMON_INDEX, MAX_POKEMON_INDEX } from '../utils/constants'

interface PokemonData {
  index: number
  name: string
  image: string | null
  collected: boolean
  wishlist: boolean
}

/**
 * Validates Pokemon index is within valid range
 */
function validateIndex(index: number): void {
  if (typeof index !== 'number' || !Number.isInteger(index)) {
    throw new Error('Pokemon index must be a number')
  }
  if (index < MIN_POKEMON_INDEX || index > MAX_POKEMON_INDEX) {
    throw new Error(
      `Pokemon index must be between ${String(MIN_POKEMON_INDEX)} and ${String(MAX_POKEMON_INDEX)}`
    )
  }
}

/**
 * Add Pokemon to collection by marking as collected
 */
export function collectPokemon(index: number): Promise<PokemonData> {
  return Promise.resolve().then(() => {
    validateIndex(index)

    const collection = getStoredCollection()
    const existing = collection.find((p: PokemonData) => p.index === index)

    if (existing && existing.collected) {
      throw new Error(`Pokemon ${String(index)} is already collected`)
    }

    const pokemon: PokemonData = {
      index,
      name: `Pokemon ${String(index)}`,
      image: null,
      collected: true,
      wishlist: false
    }

    const updatedCollection = [...collection]
    const existingIndex = updatedCollection.findIndex(
      (p) => p.index === index
    )

    if (existingIndex >= 0) {
      updatedCollection[existingIndex] = {
        ...updatedCollection[existingIndex],
        collected: true
      }
    } else {
      updatedCollection.push(pokemon)
    }

    saveCollection(updatedCollection)

    return {
      ...pokemon,
      ...(existing && { name: existing.name, image: existing.image })
    }
  })
}

/**
 * Remove Pokemon from collection
 */
export function removeFromCollection(index: number): Promise<boolean> {
  return Promise.resolve().then(() => {
    validateIndex(index)

    const collection = getStoredCollection()
    const existingIndex = collection.findIndex(
      (p: PokemonData) => p.index === index
    )

    if (existingIndex < 0) {
      throw new Error(`Pokemon ${String(index)} not found in collection`)
    }

    const updated = [...collection]
    updated[existingIndex] = {
      ...updated[existingIndex],
      collected: false
    }

    if (!updated[existingIndex].wishlist) {
      updated.splice(existingIndex, 1)
    }

    saveCollection(updated)

    return true
  })
}

/**
 * Get entire collection
 */
export function getCollectionList(): PokemonData[] {
  return getStoredCollection()
}

/**
 * Alias for getCollectionList (for test compatibility)
 */
export function getCollection(): PokemonData[] {
  return getCollectionList()
}

/**
 * Get only collected Pokemon
 */
export function getCollectedPokemon(): PokemonData[] {
  const collection = getCollectionList()
  return collection.filter((p: PokemonData) => p.collected)
}

/**
 * Check if Pokemon is collected
 */
export function isCollected(index: number): boolean {
  const collection = getCollectionList()
  const pokemon = collection.find((p: PokemonData) => p.index === index)
  return pokemon ? pokemon.collected : false
}

/**
 * Add Pokemon to wishlist
 */
export function addToWishlist(index: number): Promise<PokemonData> {
  return Promise.resolve().then(() => {
    validateIndex(index)

    const collection = getStoredCollection()
    const existing = collection.find((p: PokemonData) => p.index === index)

    if (existing && existing.collected) {
      throw new Error('Cannot add collected Pokemon to wishlist')
    }

    const pokemon: PokemonData = {
      index,
      name: `Pokemon ${String(index)}`,
      image: null,
      collected: false,
      wishlist: true
    }

    const updatedCollection = [...collection]
    const existingIndex = updatedCollection.findIndex(
      (p) => p.index === index
    )

    if (existingIndex >= 0) {
      updatedCollection[existingIndex] = {
        ...updatedCollection[existingIndex],
        wishlist: true
      }
    } else {
      updatedCollection.push(pokemon)
    }

    saveCollection(updatedCollection)

    return {
      ...pokemon,
      ...(existing && { name: existing.name, image: existing.image })
    }
  })
}

/**
 * Get wishlist Pokemon
 */
export function getWishlist(): PokemonData[] {
  const collection = getCollectionList()
  return collection.filter((p: PokemonData) => p.wishlist)
}

/**
 * Remove Pokemon from wishlist
 */
export function removeFromWishlist(index: number): Promise<boolean> {
  return Promise.resolve().then(() => {
    validateIndex(index)

    const collection = getStoredCollection()
    const existingIndex = collection.findIndex(
      (p: PokemonData) => p.index === index
    )

    if (existingIndex < 0) {
      throw new Error(`Pokemon ${String(index)} not found in wishlist`)
    }

    const updated = [...collection]
    updated[existingIndex] = {
      ...updated[existingIndex],
      wishlist: false
    }

    if (!updated[existingIndex].collected) {
      updated.splice(existingIndex, 1)
    }

    saveCollection(updated)

    return true
  })
}

/**
 * Search Pokemon by name (case-insensitive, partial matching)
 * Optimized version: filters only against stored Pokemon entries.
 * No longer creates 1,025 placeholder objects on every search.
 * Expected impact: 20-30% rendering improvement.
 * 
 * @param query - Name query string (case-insensitive partial match)
 * @returns Promise<PokemonData[]> - Array of matching Pokemon from collection
 */
export function searchPokemonByName(query: string): Promise<PokemonData[]> {
  return Promise.resolve().then(() => {
    if (!query || !query.trim()) {
      return []
    }

    const normalizedQuery = query.toLowerCase().trim()
    
    // OPTIMIZED: Filter only against stored Pokemon (loaded/collected/wishlisted)
    // Instead of creating all 1,025 Pokemon objects
    const collection = getStoredCollection()
    
    // Filter by name match (case-insensitive partial match)
    const results = collection.filter((pokemon) => {
      const normalizedName = pokemon.name.toLowerCase()
      return normalizedName.includes(normalizedQuery)
    })

    return results
  })
}


/**
 * Search Pokemon by name or index
 * @param query - String that could be a name or index
 * @returns Promise<PokemonData[]> - Array of matching Pokemon
 */
export function searchPokemon(query: string): Promise<PokemonData[]> {
  return Promise.resolve().then(async () => {
    if (!query || !query.trim()) {
      return []
    }

    const trimmedQuery = query.trim()
    
    // Try to parse as index first
    const asIndex = parseInt(trimmedQuery, 10)
    if (!isNaN(asIndex) && asIndex >= MIN_POKEMON_INDEX && asIndex <= MAX_POKEMON_INDEX) {
      // Could be an index, try that first
      const collection = getStoredCollection()
      const collected = collection.filter((p: PokemonData) => p.index === asIndex)
      if (collected.length > 0) {
        return collected
      }
    }

    // Otherwise, search by name
    return searchPokemonByName(trimmedQuery)
  })
}

