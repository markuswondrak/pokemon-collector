/**
 * useCollection Hook
 * Custom React hook for managing collection and wishlist state
 */

import { useState, useEffect, useCallback } from 'react'
import { Pokemon } from '../models/Pokemon'
import * as collectionStorageModule from '../services/collectionStorage'

interface PokemonData {
  index: number
  name: string
  image: string | null
  collected: boolean
  wishlist: boolean
}

interface UseCollectionReturn {
  collected: PokemonData[]
  wishlist: PokemonData[]
  addToCollection: (pokemonData: PokemonData | Pokemon) => Promise<void>
  removeFromCollection: (index: number) => Promise<void>
  addToWishlist: (pokemonData: PokemonData | Pokemon) => Promise<void>
  removeFromWishlist: (index: number) => Promise<void>
  isCollected: (index: number) => boolean
  isWishlisted: (index: number) => boolean
  getCollectionCount: () => number
  getWishlistCount: () => number
}

export function useCollection(): UseCollectionReturn {
  const [collected, setCollected] = useState<PokemonData[]>([])
  const [wishlist, setWishlist] = useState<PokemonData[]>([])

  // Load persisted data on mount
  useEffect(() => {
    const loadData = (): void => {
      try {
        const collectionData = collectionStorageModule.collectionStorage.loadCollection()
        if (collectionData && collectionData.pokemon) {
          setCollected(collectionData.pokemon)
        }

        const wishlistData = collectionStorageModule.collectionStorage.loadWishlist()
        if (wishlistData && wishlistData.pokemon) {
          setWishlist(wishlistData.pokemon)
        }
      } catch (error) {
        console.error('Failed to load collection data:', error)
      }
    }

    loadData()
  }, [])

  /**
   * Add Pokemon to collection
   */
  const addToCollection = useCallback(
    async (pokemonData: PokemonData | Pokemon): Promise<void> => {
      try {
        // Check if already collected
        const index =
          pokemonData instanceof Pokemon
            ? pokemonData.index
            : pokemonData.index
        if (collected.some((p) => p.index === index)) {
          throw new Error(`Pokemon ${index} is already in collection.`)
        }

        // Ensure it's a plain JSON object
        const pokemonJSON =
          pokemonData instanceof Pokemon
            ? pokemonData.toJSON()
            : pokemonData

        const newCollected = [...collected, pokemonJSON]
        setCollected(newCollected)

        // Persist
        collectionStorageModule.collectionStorage.saveCollection(newCollected)
      } catch (error) {
        console.error('Failed to add to collection:', error)
        throw error
      }
    },
    [collected]
  )

  /**
   * Remove Pokemon from collection
   */
  const removeFromCollection = useCallback(
    async (index: number): Promise<void> => {
      try {
        const newCollected = collected.filter((p) => p.index !== index)
        setCollected(newCollected)

        // Persist
        collectionStorageModule.collectionStorage.saveCollection(newCollected)
      } catch (error) {
        console.error('Failed to remove from collection:', error)
        throw error
      }
    },
    [collected]
  )

  /**
   * Add Pokemon to wishlist
   */
  const addToWishlist = useCallback(
    async (pokemonData: PokemonData | Pokemon): Promise<void> => {
      try {
        // Check if already collected
        const index =
          pokemonData instanceof Pokemon
            ? pokemonData.index
            : pokemonData.index
        if (collected.some((p) => p.index === index)) {
          throw new Error('Cannot add collected Pokemon to wishlist.')
        }

        // Check if already wishlisted
        if (wishlist.some((p) => p.index === index)) {
          throw new Error(`Pokemon ${index} is already in wishlist.`)
        }

        // Ensure it's a plain JSON object
        const pokemonJSON =
          pokemonData instanceof Pokemon
            ? pokemonData.toJSON()
            : pokemonData

        const newWishlist = [...wishlist, pokemonJSON]
        setWishlist(newWishlist)

        // Persist
        collectionStorageModule.collectionStorage.saveWishlist(newWishlist)
      } catch (error) {
        console.error('Failed to add to wishlist:', error)
        throw error
      }
    },
    [collected, wishlist]
  )

  /**
   * Remove Pokemon from wishlist
   */
  const removeFromWishlist = useCallback(
    async (index: number): Promise<void> => {
      try {
        const newWishlist = wishlist.filter((p) => p.index !== index)
        setWishlist(newWishlist)

        // Persist
        collectionStorageModule.collectionStorage.saveWishlist(newWishlist)
      } catch (error) {
        console.error('Failed to remove from wishlist:', error)
        throw error
      }
    },
    [wishlist]
  )

  /**
   * Check if Pokemon is collected
   */
  const isCollected = useCallback(
    (index: number): boolean => {
      return collected.some((p) => p.index === index)
    },
    [collected]
  )

  /**
   * Check if Pokemon is in wishlist
   */
  const isWishlisted = useCallback(
    (index: number): boolean => {
      return wishlist.some((p) => p.index === index)
    },
    [wishlist]
  )

  /**
   * Get count of collected Pokemon
   */
  const getCollectionCount = useCallback((): number => {
    return collected.length
  }, [collected])

  /**
   * Get count of wishlist Pokemon
   */
  const getWishlistCount = useCallback((): number => {
    return wishlist.length
  }, [wishlist])

  return {
    collected,
    wishlist,
    addToCollection,
    removeFromCollection,
    addToWishlist,
    removeFromWishlist,
    isCollected,
    isWishlisted,
    getCollectionCount,
    getWishlistCount
  }
}
