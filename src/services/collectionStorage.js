/**
 * Collection Storage Service
 * Manages localStorage persistence for collections and wishlists
 */

import { STORAGE_KEY_COLLECTION, STORAGE_KEY_WISHLIST } from '../utils/constants'

class CollectionStorage {
  /**
   * Save collection to localStorage
   * @param {Object} data - Collection data to save
   * @throws Error if data is invalid
   */
  saveCollection(data) {
    if (!data) {
      throw new Error('Collection data cannot be null or undefined.')
    }

    try {
      localStorage.setItem(STORAGE_KEY_COLLECTION, JSON.stringify(data))
    } catch (error) {
      throw new Error(`Failed to save collection: ${error.message}`)
    }
  }

  /**
   * Load collection from localStorage
   * @returns {Object|null} - Collection data or null if not found
   * @throws Error if stored data is corrupted
   */
  loadCollection() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_COLLECTION)
      if (!stored) {
        return null
      }
      return JSON.parse(stored)
    } catch (error) {
      throw new Error(`Failed to load collection: ${error.message}`)
    }
  }

  /**
   * Save wishlist to localStorage
   * @param {Object} data - Wishlist data to save
   * @throws Error if data is invalid
   */
  saveWishlist(data) {
    if (!data) {
      throw new Error('Wishlist data cannot be null or undefined.')
    }

    try {
      localStorage.setItem(STORAGE_KEY_WISHLIST, JSON.stringify(data))
    } catch (error) {
      throw new Error(`Failed to save wishlist: ${error.message}`)
    }
  }

  /**
   * Load wishlist from localStorage
   * @returns {Object|null} - Wishlist data or null if not found
   * @throws Error if stored data is corrupted
   */
  loadWishlist() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_WISHLIST)
      if (!stored) {
        return null
      }
      return JSON.parse(stored)
    } catch (error) {
      throw new Error(`Failed to load wishlist: ${error.message}`)
    }
  }

  /**
   * Clear collection from localStorage
   */
  clearCollection() {
    try {
      localStorage.removeItem(STORAGE_KEY_COLLECTION)
    } catch (error) {
      throw new Error(`Failed to clear collection: ${error.message}`)
    }
  }

  /**
   * Clear wishlist from localStorage
   */
  clearWishlist() {
    try {
      localStorage.removeItem(STORAGE_KEY_WISHLIST)
    } catch (error) {
      throw new Error(`Failed to clear wishlist: ${error.message}`)
    }
  }

  /**
   * Clear both collection and wishlist from localStorage
   */
  clearAll() {
    try {
      this.clearCollection()
      this.clearWishlist()
    } catch (error) {
      throw new Error(`Failed to clear storage: ${error.message}`)
    }
  }
}

// Export singleton instance
export const collectionStorage = new CollectionStorage()
