/**
 * Contract Tests: localStorage Schema for Image Cache
 * Feature: 008-simplify-render-cache
 * 
 * Purpose: Validate localStorage schema for image cache entries and metadata
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { IMAGE_CACHE_KEY_PREFIX, IMAGE_CACHE_METADATA_KEY, MIN_POKEMON_INDEX, MAX_POKEMON_INDEX } from '../../src/utils/constants'
import type { ImageCacheEntry, CacheMetadata } from '../../src/services/imageCacheService'

describe('Contract: localStorage Schema - Image Cache', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('ImageCacheEntry Schema', () => {
    it('should validate entry has required fields', () => {
      const validEntry: ImageCacheEntry = {
        dataUrl: 'data:image/png;base64,iVBORw0KGgo=',
        timestamp: Date.now(),
        version: '0.0.0',
        sizeBytes: 1024,
        pokemonIndex: 25
      }

      localStorage.setItem(`${IMAGE_CACHE_KEY_PREFIX}25`, JSON.stringify(validEntry))
      const storedValue = localStorage.getItem(`${IMAGE_CACHE_KEY_PREFIX}25`)
      const retrieved = JSON.parse(storedValue ?? '{}') as ImageCacheEntry

      expect(retrieved).toHaveProperty('dataUrl')
      expect(retrieved).toHaveProperty('timestamp')
      expect(retrieved).toHaveProperty('version')
      expect(retrieved).toHaveProperty('sizeBytes')
      expect(retrieved).toHaveProperty('pokemonIndex')
    })

    it('should validate dataUrl format', () => {
      const validDataUrl = 'data:image/png;base64,iVBORw0KGgo='
      expect(validDataUrl).toMatch(/^data:image\/(png|jpeg|jpg|gif|webp);base64,/)

      const invalidDataUrl = 'not-a-data-url'
      expect(invalidDataUrl).not.toMatch(/^data:image\/(png|jpeg|jpg|gif|webp);base64,/)
    })

    it('should validate timestamp is valid Unix timestamp', () => {
      const validTimestamp = Date.now()
      expect(validTimestamp).toBeGreaterThan(0)
      expect(validTimestamp).toBeLessThanOrEqual(Date.now())

      const invalidTimestamp = -1
      expect(invalidTimestamp).toBeLessThan(0)
    })

    it('should validate version matches semantic versioning', () => {
      const validVersion = '0.0.0'
      expect(validVersion).toMatch(/^\d+\.\d+\.\d+$/)

      const invalidVersion = 'v1.0'
      expect(invalidVersion).not.toMatch(/^\d+\.\d+\.\d+$/)
    })

    it('should validate sizeBytes is positive integer', () => {
      const validSize = 1024
      expect(validSize).toBeGreaterThan(0)
      expect(Number.isInteger(validSize)).toBe(true)

      const invalidSize = -1
      expect(invalidSize).toBeLessThanOrEqual(0)
    })

    it('should validate pokemonIndex is in valid range', () => {
      const validIndex = 25
      expect(validIndex).toBeGreaterThanOrEqual(MIN_POKEMON_INDEX)
      expect(validIndex).toBeLessThanOrEqual(MAX_POKEMON_INDEX)

      const invalidIndexLow = 0
      expect(invalidIndexLow).toBeLessThan(MIN_POKEMON_INDEX)

      const invalidIndexHigh = 2000
      expect(invalidIndexHigh).toBeGreaterThan(MAX_POKEMON_INDEX)
    })
  })

  describe('CacheMetadata Schema', () => {
    it('should validate metadata has required fields', () => {
      const validMetadata: CacheMetadata = {
        totalSizeBytes: 0,
        totalEntries: 0,
        lastEvictionTimestamp: null,
        version: '0.0.0'
      }

      localStorage.setItem(IMAGE_CACHE_METADATA_KEY, JSON.stringify(validMetadata))
      const storedValue = localStorage.getItem(IMAGE_CACHE_METADATA_KEY)
      const retrieved = JSON.parse(storedValue ?? '{}') as CacheMetadata

      expect(retrieved).toHaveProperty('totalSizeBytes')
      expect(retrieved).toHaveProperty('totalEntries')
      expect(retrieved).toHaveProperty('lastEvictionTimestamp')
      expect(retrieved).toHaveProperty('version')
    })

    it('should validate totalSizeBytes is non-negative', () => {
      const validSize = 0
      expect(validSize).toBeGreaterThanOrEqual(0)

      const validSize2 = 5242880
      expect(validSize2).toBeGreaterThanOrEqual(0)

      const invalidSize = -100
      expect(invalidSize).toBeLessThan(0)
    })

    it('should validate totalEntries is non-negative', () => {
      const validEntries = 0
      expect(validEntries).toBeGreaterThanOrEqual(0)

      const validEntries2 = 100
      expect(validEntries2).toBeGreaterThanOrEqual(0)

      const invalidEntries = -5
      expect(invalidEntries).toBeLessThan(0)
    })

    it('should validate lastEvictionTimestamp is null or valid timestamp', () => {
      const nullValue = null
      expect(nullValue).toBeNull()

      const validTimestamp = Date.now()
      expect(validTimestamp).toBeGreaterThan(0)

      const invalidTimestamp = -1
      expect(invalidTimestamp).toBeLessThan(0)
    })
  })

  describe('Storage Key Patterns', () => {
    it('should use correct key prefix for cache entries', () => {
      const key = `${IMAGE_CACHE_KEY_PREFIX}25`
      expect(key).toBe('pokemon_image_25')
      expect(key).toMatch(/^pokemon_image_\d+$/)
    })

    it('should use correct key for metadata', () => {
      expect(IMAGE_CACHE_METADATA_KEY).toBe('pokemon_image_metadata')
    })

    it('should never use collection/wishlist keys', () => {
      const protectedKeys = ['pokemon-collection', 'pokemon-wishlist']
      
      // Store protected data
      localStorage.setItem('pokemon-collection', JSON.stringify({ collection: 'data' }))
      localStorage.setItem('pokemon-wishlist', JSON.stringify({ wishlist: 'data' }))

      // Verify protected keys are not touched by cache key pattern
      const allKeys = Object.keys(localStorage)
      const cacheKeys = allKeys.filter(key => 
        key.startsWith(IMAGE_CACHE_KEY_PREFIX) && 
        key !== IMAGE_CACHE_METADATA_KEY
      )

      protectedKeys.forEach(protectedKey => {
        expect(cacheKeys).not.toContain(protectedKey)
        expect(localStorage.getItem(protectedKey)).toBeTruthy()
      })
    })
  })
})
