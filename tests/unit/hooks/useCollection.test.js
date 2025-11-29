import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCollection } from '../../../src/hooks/useCollection'
import * as collectionStorageModule from '../../../src/services/collectionStorage'
import * as pokemonApiModule from '../../../src/services/pokemonApi'

// Mock modules
vi.mock('../../../src/services/collectionStorage')
vi.mock('../../../src/services/pokemonApi')

describe('useCollection Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Setup default mock implementations
    collectionStorageModule.collectionStorage.loadCollection.mockReturnValue(null)
    collectionStorageModule.collectionStorage.loadWishlist.mockReturnValue(null)
  })

  describe('initialization', () => {
    it('should initialize with empty collection and wishlist', () => {
      const { result } = renderHook(() => useCollection())
      
      expect(result.current.collected).toEqual([])
      expect(result.current.wishlist).toEqual([])
    })

    it('should load persisted collection on mount', () => {
      const mockCollection = [
        { index: 25, name: 'Pikachu', image: 'url', collected: true, wishlist: false }
      ]
      collectionStorageModule.collectionStorage.loadCollection.mockReturnValue({
        pokemon: mockCollection
      })

      const { result } = renderHook(() => useCollection())
      expect(result.current.collected).toEqual(mockCollection)
    })

    it('should load persisted wishlist on mount', () => {
      const mockWishlist = [
        { index: 39, name: 'Jigglypuff', image: 'url', collected: false, wishlist: true }
      ]
      collectionStorageModule.collectionStorage.loadWishlist.mockReturnValue({
        pokemon: mockWishlist
      })

      const { result } = renderHook(() => useCollection())
      expect(result.current.wishlist).toEqual(mockWishlist)
    })
  })

  describe('addToCollection', () => {
    it('should add Pokemon to collection', async () => {
      const { result } = renderHook(() => useCollection())
      const pokemon = { index: 25, name: 'Pikachu', image: 'https://example.com/pikachu.png', collected: false, wishlist: false }

      await act(async () => {
        await result.current.addToCollection(pokemon)
      })

      expect(result.current.collected).toContainEqual(expect.objectContaining({ index: 25 }))
    })

    it('should update collected state', async () => {
      const { result } = renderHook(() => useCollection())
      const pokemon = { index: 25, name: 'Pikachu', image: 'https://example.com/pikachu.png', collected: false, wishlist: false }

      await act(async () => {
        await result.current.addToCollection(pokemon)
      })

      expect(result.current.collected.length).toBe(1)
      expect(result.current.collected[0].index).toBe(25)
    })

    it('should persist to storage', async () => {
      const { result } = renderHook(() => useCollection())
      const pokemon = { index: 25, name: 'Pikachu', image: 'https://example.com/pikachu.png', collected: false, wishlist: false }

      await act(async () => {
        await result.current.addToCollection(pokemon)
      })

      expect(collectionStorageModule.collectionStorage.saveCollection).toHaveBeenCalled()
    })

    it('should throw error if Pokemon is already collected', async () => {
      collectionStorageModule.collectionStorage.loadCollection.mockReturnValue({
        pokemon: [{ index: 25, name: 'Pikachu', image: 'url', collected: true, wishlist: false }]
      })
      
      const { result } = renderHook(() => useCollection())
      const pokemon = { index: 25, name: 'Pikachu', image: 'url', collected: false, wishlist: false }

      await act(async () => {
        expect(async () => {
          await result.current.addToCollection(pokemon)
        }).rejects.toThrow()
      })
    })
  })

  describe('removeFromCollection', () => {
    it('should remove Pokemon from collection', async () => {
      const mockCollection = [
        { index: 25, name: 'Pikachu', image: 'url', collected: true, wishlist: false }
      ]
      collectionStorageModule.collectionStorage.loadCollection.mockReturnValue({
        pokemon: mockCollection
      })

      const { result } = renderHook(() => useCollection())

      await act(async () => {
        await result.current.removeFromCollection(25)
      })

      expect(result.current.collected).toEqual([])
    })

    it('should persist removal to storage', async () => {
      const mockCollection = [
        { index: 25, name: 'Pikachu', image: 'url', collected: true, wishlist: false }
      ]
      collectionStorageModule.collectionStorage.loadCollection.mockReturnValue({
        pokemon: mockCollection
      })

      const { result } = renderHook(() => useCollection())

      await act(async () => {
        await result.current.removeFromCollection(25)
      })

      expect(collectionStorageModule.collectionStorage.saveCollection).toHaveBeenCalled()
    })
  })

  describe('addToWishlist', () => {
    it('should add Pokemon to wishlist', async () => {
      const { result } = renderHook(() => useCollection())
      const pokemon = { index: 39, name: 'Jigglypuff', image: 'https://example.com/jigglypuff.png', collected: false, wishlist: false }

      await act(async () => {
        await result.current.addToWishlist(pokemon)
      })

      expect(result.current.wishlist).toContainEqual(expect.objectContaining({ index: 39 }))
    })

    it('should not allow adding collected Pokemon to wishlist', async () => {
      const mockCollection = [
        { index: 25, name: 'Pikachu', image: 'https://example.com/pikachu.png', collected: true, wishlist: false }
      ]
      collectionStorageModule.collectionStorage.loadCollection.mockReturnValue({
        pokemon: mockCollection
      })

      const { result } = renderHook(() => useCollection())
      const pokemon = { index: 25, name: 'Pikachu', image: 'https://example.com/pikachu.png', collected: true, wishlist: false }

      await expect(result.current.addToWishlist(pokemon)).rejects.toThrow()
    })

    it('should persist to storage', async () => {
      const { result } = renderHook(() => useCollection())
      const pokemon = { index: 39, name: 'Jigglypuff', image: 'https://example.com/jigglypuff.png', collected: false, wishlist: false }

      await act(async () => {
        await result.current.addToWishlist(pokemon)
      })

      expect(collectionStorageModule.collectionStorage.saveWishlist).toHaveBeenCalled()
    })
  })

  describe('removeFromWishlist', () => {
    it('should remove Pokemon from wishlist', async () => {
      const mockWishlist = [
        { index: 39, name: 'Jigglypuff', image: 'url', collected: false, wishlist: true }
      ]
      collectionStorageModule.collectionStorage.loadWishlist.mockReturnValue({
        pokemon: mockWishlist
      })

      const { result } = renderHook(() => useCollection())

      await act(async () => {
        await result.current.removeFromWishlist(39)
      })

      expect(result.current.wishlist).toEqual([])
    })

    it('should persist removal to storage', async () => {
      const mockWishlist = [
        { index: 39, name: 'Jigglypuff', image: 'url', collected: false, wishlist: true }
      ]
      collectionStorageModule.collectionStorage.loadWishlist.mockReturnValue({
        pokemon: mockWishlist
      })

      const { result } = renderHook(() => useCollection())

      await act(async () => {
        await result.current.removeFromWishlist(39)
      })

      expect(collectionStorageModule.collectionStorage.saveWishlist).toHaveBeenCalled()
    })
  })

  describe('isCollected', () => {
    it('should return true if Pokemon is collected', () => {
      const mockCollection = [
        { index: 25, name: 'Pikachu', image: 'url', collected: true, wishlist: false }
      ]
      collectionStorageModule.collectionStorage.loadCollection.mockReturnValue({
        pokemon: mockCollection
      })

      const { result } = renderHook(() => useCollection())
      expect(result.current.isCollected(25)).toBe(true)
    })

    it('should return false if Pokemon is not collected', () => {
      const { result } = renderHook(() => useCollection())
      expect(result.current.isCollected(25)).toBe(false)
    })
  })

  describe('isWishlisted', () => {
    it('should return true if Pokemon is in wishlist', () => {
      const mockWishlist = [
        { index: 39, name: 'Jigglypuff', image: 'url', collected: false, wishlist: true }
      ]
      collectionStorageModule.collectionStorage.loadWishlist.mockReturnValue({
        pokemon: mockWishlist
      })

      const { result } = renderHook(() => useCollection())
      expect(result.current.isWishlisted(39)).toBe(true)
    })

    it('should return false if Pokemon is not in wishlist', () => {
      const { result } = renderHook(() => useCollection())
      expect(result.current.isWishlisted(39)).toBe(false)
    })
  })

  describe('getCollectionCount', () => {
    it('should return count of collected Pokemon', () => {
      const mockCollection = [
        { index: 25, name: 'Pikachu', image: 'url', collected: true, wishlist: false },
        { index: 39, name: 'Jigglypuff', image: 'url', collected: true, wishlist: false }
      ]
      collectionStorageModule.collectionStorage.loadCollection.mockReturnValue({
        pokemon: mockCollection
      })

      const { result } = renderHook(() => useCollection())
      expect(result.current.getCollectionCount()).toBe(2)
    })

    it('should return 0 for empty collection', () => {
      const { result } = renderHook(() => useCollection())
      expect(result.current.getCollectionCount()).toBe(0)
    })
  })

  describe('getWishlistCount', () => {
    it('should return count of wishlist Pokemon', () => {
      const mockWishlist = [
        { index: 39, name: 'Jigglypuff', image: 'url', collected: false, wishlist: true },
        { index: 50, name: 'Diglett', image: 'url', collected: false, wishlist: true }
      ]
      collectionStorageModule.collectionStorage.loadWishlist.mockReturnValue({
        pokemon: mockWishlist
      })

      const { result } = renderHook(() => useCollection())
      expect(result.current.getWishlistCount()).toBe(2)
    })

    it('should return 0 for empty wishlist', () => {
      const { result } = renderHook(() => useCollection())
      expect(result.current.getWishlistCount()).toBe(0)
    })
  })
})
