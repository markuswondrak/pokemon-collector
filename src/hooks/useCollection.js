/**
 * useCollection Hook
 * Custom React hook for managing collection and wishlist state
 */

import { useState, useEffect, useCallback } from 'react'
import { Collection } from '../models/Collection'
import { Pokemon } from '../models/Pokemon'
import { collectionStorage } from '../services/collectionStorage'

export function useCollection() {
  const [collected, setCollected] = useState([])
  const [wishlist, setWishlist] = useState([])

  // Load persisted data on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const collectionData = collectionStorage.loadCollection()
        if (collectionData) {
          setCollected(collectionData.pokemon || [])
        }

        const wishlistData = collectionStorage.loadWishlist()
        if (wishlistData) {
          setWishlist(wishlistData.pokemon || [])
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
    async (pokemonData) => {
      try {
        // Check if already collected
        if (collected.some((p) => p.index === pokemonData.index)) {
          throw new Error(`Pokemon ${pokemonData.index} is already in collection.`)
        }

        // Ensure it's a plain JSON object
        const pokemonJSON = pokemonData instanceof Pokemon ? pokemonData.toJSON() : pokemonData

        const newCollected = [...collected, pokemonJSON]
        setCollected(newCollected)

        // Persist
        const collection = new Collection('my-collection', newCollected)
        collectionStorage.saveCollection(collection.toJSON())
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
    async (index) => {
      try {
        const newCollected = collected.filter((p) => p.index !== index)
        setCollected(newCollected)

        // Persist
        const collection = new Collection('my-collection', newCollected)
        collectionStorage.saveCollection(collection.toJSON())
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
    async (pokemonData) => {
      try {
        // Check if already collected
        if (collected.some((p) => p.index === pokemonData.index)) {
          throw new Error('Cannot add collected Pokemon to wishlist.')
        }

        // Check if already wishlisted
        if (wishlist.some((p) => p.index === pokemonData.index)) {
          throw new Error(`Pokemon ${pokemonData.index} is already in wishlist.`)
        }

        // Ensure it's a plain JSON object
        const pokemonJSON = pokemonData instanceof Pokemon ? pokemonData.toJSON() : pokemonData

        const newWishlist = [...wishlist, pokemonJSON]
        setWishlist(newWishlist)

        // Persist
        const collection = new Collection('my-wishlist', newWishlist)
        collectionStorage.saveWishlist(collection.toJSON())
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
    async (index) => {
      try {
        const newWishlist = wishlist.filter((p) => p.index !== index)
        setWishlist(newWishlist)

        // Persist
        const collection = new Collection('my-wishlist', newWishlist)
        collectionStorage.saveWishlist(collection.toJSON())
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
    (index) => {
      return collected.some((p) => p.index === index)
    },
    [collected]
  )

  /**
   * Check if Pokemon is in wishlist
   */
  const isWishlisted = useCallback(
    (index) => {
      return wishlist.some((p) => p.index === index)
    },
    [wishlist]
  )

  /**
   * Get count of collected Pokemon
   */
  const getCollectionCount = useCallback(() => {
    return collected.length
  }, [collected])

  /**
   * Get count of wishlist Pokemon
   */
  const getWishlistCount = useCallback(() => {
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
