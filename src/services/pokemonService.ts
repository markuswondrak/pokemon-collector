import {
  getCollection as getStoredCollection,
  saveCollection
} from './collectionStorage.ts'
import { MIN_POKEMON_INDEX, MAX_POKEMON_INDEX } from '../utils/constants'
import { fetchPokemon, searchPokemonSimple } from './pokemonApi'
import { nameRegistry } from './nameRegistry.ts'

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
export async function collectPokemon(index: number): Promise<PokemonData> {
  validateIndex(index)

  const collection = getStoredCollection()
  const existing = collection.find((p: PokemonData) => p.index === index)

  if (existing && existing.collected) {
    throw new Error(`Pokemon ${String(index)} is already collected`)
  }

  let name = `Pokemon ${String(index)}`
  let image: string | null = null

  try {
    const apiPokemon = await fetchPokemon(index)
    name = apiPokemon.name
    image = apiPokemon.image
  } catch (error) {
    console.warn(`Failed to fetch details for Pokemon ${index}`, error)
  }

  const pokemon: PokemonData = {
    index,
    name,
    image,
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
      collected: true,
      name, // Update name in case it was a placeholder
      image // Update image in case it was missing
    }
  } else {
    updatedCollection.push(pokemon)
  }

  saveCollection(updatedCollection)

  return existingIndex >= 0 ? updatedCollection[existingIndex] : pokemon
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
export async function addToWishlist(index: number): Promise<PokemonData> {
  validateIndex(index)

  const collection = getStoredCollection()
  const existing = collection.find((p: PokemonData) => p.index === index)

  if (existing && existing.collected) {
    throw new Error('Cannot add collected Pokemon to wishlist')
  }

  let name = `Pokemon ${String(index)}`
  let image: string | null = null

  try {
    const apiPokemon = await fetchPokemon(index)
    name = apiPokemon.name
    image = apiPokemon.image
  } catch (error) {
    console.warn(`Failed to fetch details for Pokemon ${index}`, error)
  }

  const pokemon: PokemonData = {
    index,
    name,
    image,
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
      wishlist: true,
      name, // Update name
      image // Update image
    }
  } else {
    updatedCollection.push(pokemon)
  }

  saveCollection(updatedCollection)

  return existingIndex >= 0 ? updatedCollection[existingIndex] : pokemon
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
 * T014: Search Pokemon by name using NameRegistry
 * Uses preloaded names for instant search results
 * 
 * @param query - Name query string (case-insensitive partial match)
 * @returns Promise<PokemonData[]> - Array of matching Pokemon from collection
 */
export function searchPokemonByName(query: string): Promise<PokemonData[]> {
  return Promise.resolve().then(async () => {
    if (!query || !query.trim()) {
      return []
    }

    // T014: Use NameRegistry for search when ready
    if (nameRegistry.ready) {
      const searchResults = nameRegistry.search(query)
      
      // Get collection to check status
      const collection = getStoredCollection()
      const collectionMap = new Map(collection.map(p => [p.index, p]))

      // Merge results
      return searchResults.map(result => {
        const stored = collectionMap.get(result.id)
        if (stored) {
          return {
            ...stored,
            name: result.name, // Use registry name for consistency
          }
        }
        
        // Return placeholder for available pokemon
        return {
          index: result.id,
          name: result.name,
          image: null,
          collected: false,
          wishlist: false
        }
      })
    } else {
      // Fallback to API search if registry not ready
      const apiResults = await searchPokemonSimple(query)
      
      // Get collection to check status
      const collection = getStoredCollection()
      const collectionMap = new Map(collection.map(p => [p.index, p]))

      // Merge results
      return apiResults.map(result => {
        const stored = collectionMap.get(result.index)
        if (stored) {
          return stored
        }
        
        // Return placeholder for available pokemon
        return {
          index: result.index,
          name: result.name.charAt(0).toUpperCase() + result.name.slice(1), // Capitalize
          image: null,
          collected: false,
          wishlist: false
        }
      })
    }
  })
}