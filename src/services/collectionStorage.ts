/**
 * Collection Storage Service
 * Manages localStorage persistence for collections and wishlists
 */

import {
  STORAGE_KEY_COLLECTION,
  STORAGE_KEY_WISHLIST
} from '../utils/constants'

interface PokemonData {
  index: number
  name: string
  image: string | null
  collected: boolean
  wishlist: boolean
}

interface StorageData {
  id: string
  pokemon: PokemonData[]
  createdAt: string
  updatedAt: string
}

class CollectionStorage {
  /**
   * Save collection to localStorage
   * Accepts either full StorageData object or just pokemon array
   * If array provided, wraps it in StorageData structure
   * @param {StorageData | PokemonData[]} data - Collection data to save
   * @throws Error if data is invalid
   */
  saveCollection(data: StorageData | PokemonData[]): void {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (data === null || data === undefined) {
      throw new Error('Collection data cannot be null or undefined.')
    }

    try {
      // If array provided, wrap in StorageData structure
      let storageData: StorageData
      if (Array.isArray(data)) {
        // Load existing to preserve timestamps
        const existing = this.loadCollection()
        storageData = {
          id: existing?.id || 'my-collection',
          pokemon: data,
          createdAt: existing?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      } else {
        storageData = data
      }

      localStorage.setItem(STORAGE_KEY_COLLECTION, JSON.stringify(storageData))
    } catch (error: unknown) {
      const err = error as { message: string }
      throw new Error(`Failed to save collection: ${err.message}`)
    }
  }

  /**
   * Load collection from localStorage
   * @returns {StorageData|null} - Full collection data or null if not found
   * @throws Error if stored data is corrupted
   */
  loadCollection(): StorageData | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_COLLECTION)
      if (!stored) {
        return null
      }
      const parsed = JSON.parse(stored) as StorageData
      return parsed
    } catch (error: unknown) {
      const err = error as { message: string }
      throw new Error(`Failed to load collection: ${err.message}`)
    }
  }

  /**
   * Save wishlist to localStorage
   * Accepts either full StorageData object or just pokemon array
   * If array provided, wraps it in StorageData structure
   * @param {StorageData | PokemonData[]} data - Wishlist data to save
   * @throws Error if data is invalid
   */
  saveWishlist(data: StorageData | PokemonData[]): void {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (data === null || data === undefined) {
      throw new Error('Wishlist data cannot be null or undefined.')
    }

    try {
      // If array provided, wrap in StorageData structure
      let storageData: StorageData
      if (Array.isArray(data)) {
        // Load existing to preserve timestamps
        const existing = this.loadWishlist()
        storageData = {
          id: existing?.id || 'my-wishlist',
          pokemon: data,
          createdAt: existing?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      } else {
        storageData = data
      }

      localStorage.setItem(STORAGE_KEY_WISHLIST, JSON.stringify(storageData))
    } catch (error: unknown) {
      const err = error as { message: string }
      throw new Error(`Failed to save wishlist: ${err.message}`)
    }
  }

  /**
   * Load wishlist from localStorage
   * @returns {StorageData|null} - Full wishlist data or null if not found
   * @throws Error if stored data is corrupted
   */
  loadWishlist(): StorageData | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_WISHLIST)
      if (!stored) {
        return null
      }
      const parsed = JSON.parse(stored) as StorageData
      return parsed
    } catch (error: unknown) {
      const err = error as { message: string }
      throw new Error(`Failed to load wishlist: ${err.message}`)
    }
  }

  /**
   * Get collection pokemon array only (for service layer use)
   * @returns {PokemonData[]} - Array of pokemon data or empty array
   */
  getCollection(): PokemonData[] {
    const stored = this.loadCollection()
    return stored?.pokemon ?? []
  }

  /**
   * Get wishlist pokemon array only (for service layer use)
   * @returns {PokemonData[]} - Array of pokemon data or empty array
   */
  getWishlist(): PokemonData[] {
    const stored = this.loadWishlist()
    return stored?.pokemon ?? []
  }

  /**
   * Clear collection from localStorage
   */
  clearCollection(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_COLLECTION)
    } catch (error: unknown) {
      const err = error as { message: string }
      throw new Error(`Failed to clear collection: ${err.message}`)
    }
  }

  /**
   * Clear wishlist from localStorage
   */
  clearWishlist(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_WISHLIST)
    } catch (error: unknown) {
      const err = error as { message: string }
      throw new Error(`Failed to clear wishlist: ${err.message}`)
    }
  }

  /**
   * Clear both collection and wishlist from localStorage
   */
  clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_COLLECTION)
      localStorage.removeItem(STORAGE_KEY_WISHLIST)
    } catch (error: unknown) {
      const err = error as { message: string }
      throw new Error(`Failed to clear storage: ${err.message}`)
    }
  }
}

// Export singleton instance
const instance = new CollectionStorage()

export { instance as collectionStorage }
export const saveCollection = (data: StorageData | PokemonData[]): void =>
  { instance.saveCollection(data); }
export const loadCollection = (): StorageData | null =>
  instance.loadCollection()
export const getCollection = (): PokemonData[] =>
  instance.getCollection()
export const saveWishlist = (data: StorageData | PokemonData[]): void =>
  { instance.saveWishlist(data); }
export const loadWishlist = (): StorageData | null =>
  instance.loadWishlist()
export const getWishlist = (): PokemonData[] => instance.getWishlist()
export const clearCollection = (): void => { instance.clearCollection(); }
export const clearWishlist = (): void => { instance.clearWishlist(); }
export const clearAll = (): void => { instance.clearAll(); }

export type { StorageData, PokemonData }
