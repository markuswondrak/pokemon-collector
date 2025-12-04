import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { collectionStorage } from '../../../src/services/collectionStorage'

describe('collectionStorage Service', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('saveCollection', () => {
    it('should save collection to localStorage', () => {
      const pokemon = {
        index: 25,
        name: 'Pikachu',
        image: 'https://example.com/pikachu.png',
        collected: true,
        wishlist: false
      }
      const data = {
        id: 'my-collection',
        pokemon: [pokemon],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      collectionStorage.saveCollection(data)
      const stored = localStorage.getItem('pokemon-collection')
      expect(stored).toBeDefined()
      expect(JSON.parse(stored)).toEqual(data)
    })

    it('should throw error if data is invalid', () => {
      expect(() => {
        collectionStorage.saveCollection(null)
      }).toThrow()
    })
  })

  describe('loadCollection', () => {
    it('should load collection from localStorage', () => {
      const data = {
        id: 'my-collection',
        pokemon: [{
          index: 25,
          name: 'Pikachu',
          image: 'https://example.com/pikachu.png',
          collected: true,
          wishlist: false
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      localStorage.setItem('pokemon-collection', JSON.stringify(data))

      const loaded = collectionStorage.loadCollection()
      expect(loaded).toEqual(data)
    })

    it('should return null if collection does not exist', () => {
      const loaded = collectionStorage.loadCollection()
      expect(loaded).toBeNull()
    })

    it('should throw error if stored data is corrupted', () => {
      localStorage.setItem('pokemon-collection', 'invalid json')
      expect(() => {
        collectionStorage.loadCollection()
      }).toThrow()
    })
  })

  describe('saveWishlist', () => {
    it('should save wishlist to localStorage', () => {
      const pokemon = {
        index: 25,
        name: 'Pikachu',
        image: 'https://example.com/pikachu.png',
        collected: false,
        wishlist: true
      }
      const data = {
        id: 'my-wishlist',
        pokemon: [pokemon],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      collectionStorage.saveWishlist(data)
      const stored = localStorage.getItem('pokemon-wishlist')
      expect(stored).toBeDefined()
      expect(JSON.parse(stored)).toEqual(data)
    })

    it('should throw error if data is invalid', () => {
      expect(() => {
        collectionStorage.saveWishlist(null)
      }).toThrow()
    })
  })

  describe('loadWishlist', () => {
    it('should load wishlist from localStorage', () => {
      const data = {
        id: 'my-wishlist',
        pokemon: [{
          index: 25,
          name: 'Pikachu',
          image: 'https://example.com/pikachu.png',
          collected: false,
          wishlist: true
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      localStorage.setItem('pokemon-wishlist', JSON.stringify(data))

      const loaded = collectionStorage.loadWishlist()
      expect(loaded).toEqual(data)
    })

    it('should return null if wishlist does not exist', () => {
      const loaded = collectionStorage.loadWishlist()
      expect(loaded).toBeNull()
    })

    it('should throw error if stored data is corrupted', () => {
      localStorage.setItem('pokemon-wishlist', 'invalid json')
      expect(() => {
        collectionStorage.loadWishlist()
      }).toThrow()
    })
  })

  describe('clearCollection', () => {
    it('should remove collection from localStorage', () => {
      const data = { id: 'my-collection', pokemon: [] }
      localStorage.setItem('pokemon-collection', JSON.stringify(data))
      
      collectionStorage.clearCollection()
      const stored = localStorage.getItem('pokemon-collection')
      expect(stored).toBeNull()
    })
  })

  describe('clearWishlist', () => {
    it('should remove wishlist from localStorage', () => {
      const data = { id: 'my-wishlist', pokemon: [] }
      localStorage.setItem('pokemon-wishlist', JSON.stringify(data))
      
      collectionStorage.clearWishlist()
      const stored = localStorage.getItem('pokemon-wishlist')
      expect(stored).toBeNull()
    })
  })

  describe('clearAll', () => {
    it('should remove both collection and wishlist from localStorage', () => {
      localStorage.setItem('pokemon-collection', JSON.stringify({ id: 'my-collection' }))
      localStorage.setItem('pokemon-wishlist', JSON.stringify({ id: 'my-wishlist' }))
      
      collectionStorage.clearAll()
      expect(localStorage.getItem('pokemon-collection')).toBeNull()
      expect(localStorage.getItem('pokemon-wishlist')).toBeNull()
    })
  })
})
