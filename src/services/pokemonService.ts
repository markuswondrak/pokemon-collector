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
      name: `Pokemon ${index}`,
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
    console.log(`[pokemonService] Collected Pokemon ${String(index)}`)

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
    console.log(
      `[pokemonService] Removed Pokemon ${String(index)} from collection`
    )

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
      name: `Pokemon ${index}`,
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
    console.log(
      `[pokemonService] Added Pokemon ${String(index)} to wishlist`
    )

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
