/**
 * Integration Test: LRU Cache Eviction
 * Feature: 008-simplify-render-cache
 * 
 * Tests that ImageCacheService correctly evicts oldest entries when quota is exceeded.
 * Validates LRU (Least Recently Used) eviction policy.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { ImageCacheService } from '../../src/services/imageCacheService'
import { 
  IMAGE_CACHE_KEY_PREFIX,
  IMAGE_CACHE_METADATA_KEY,
  IMAGE_CACHE_MAX_SIZE_BYTES,
  IMAGE_CACHE_EVICTION_THRESHOLD
} from '../../src/utils/constants'

describe('LRU Cache Eviction', () => {
  let cacheService: ImageCacheService

  beforeEach(() => {
    localStorage.clear()
    cacheService = ImageCacheService.getInstance()
  })

  const generateDataUrl = (size: number): string => {
    // Generate a Data URL of approximately specified size
    const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
    const targetLength = Math.floor(size / 2) // UTF-16 encoding
    let data = ''
    for (let i = 0; i < targetLength; i++) {
      data += base64Chars.charAt(Math.floor(Math.random() * base64Chars.length))
    }
    return `data:image/png;base64,${data}`
  }

  it('should evict oldest entries when quota threshold exceeded', () => {
    const imageSize = 100 * 1024 // 100KB per image
    const threshold = IMAGE_CACHE_MAX_SIZE_BYTES * IMAGE_CACHE_EVICTION_THRESHOLD

    // Calculate how many images to trigger eviction
    const imagesToCache = Math.ceil(threshold / (imageSize * 2)) + 2

    // Cache images sequentially
    for (let i = 1; i <= imagesToCache; i++) {
      const dataUrl = generateDataUrl(imageSize)
      cacheService.save(i, dataUrl)
    }

    // First image should be evicted (oldest)
    const firstImage = cacheService.get(1)
    expect(firstImage).toBeNull()

    // Most recent images should still be cached
    const lastImage = cacheService.get(imagesToCache)
    expect(lastImage).not.toBeNull()
  })

  it('should update metadata after eviction', () => {
    const imageSize = 150 * 1024 // 150KB per image
    const threshold = IMAGE_CACHE_MAX_SIZE_BYTES * IMAGE_CACHE_EVICTION_THRESHOLD

    // Cache enough images to trigger eviction
    const imagesToCache = Math.ceil(threshold / (imageSize * 2)) + 3

    for (let i = 1; i <= imagesToCache; i++) {
      const dataUrl = generateDataUrl(imageSize)
      cacheService.save(i, dataUrl)
    }

    // Check metadata
    const metadataJson = localStorage.getItem(IMAGE_CACHE_METADATA_KEY)
    expect(metadataJson).not.toBeNull()

    const metadata = JSON.parse(metadataJson!)
    expect(metadata.lastEvictionTimestamp).not.toBeNull()
    expect(metadata.totalSizeBytes).toBeGreaterThan(0)
    expect(metadata.totalSizeBytes).toBeLessThan(threshold)
  })

  it('should preserve most recently accessed images', () => {
    const imageSize = 120 * 1024 // 120KB per image
    const threshold = IMAGE_CACHE_MAX_SIZE_BYTES * IMAGE_CACHE_EVICTION_THRESHOLD

    // Cache initial images
    const imagesToCache = Math.ceil(threshold / (imageSize * 2))

    for (let i = 1; i <= imagesToCache; i++) {
      const dataUrl = generateDataUrl(imageSize)
      cacheService.save(i, dataUrl)
    }

    // Access first image to update its timestamp (make it recent)
    cacheService.get(1)

    // Add more images to trigger eviction
    for (let i = imagesToCache + 1; i <= imagesToCache + 3; i++) {
      const dataUrl = generateDataUrl(imageSize)
      cacheService.save(i, dataUrl)
    }

    // First image should still be cached (was recently accessed)
    const firstImage = cacheService.get(1)
    expect(firstImage).not.toBeNull()

    // Some middle images should be evicted
    let evictedCount = 0
    for (let i = 2; i <= imagesToCache; i++) {
      if (cacheService.get(i) === null) {
        evictedCount++
      }
    }
    expect(evictedCount).toBeGreaterThan(0)
  })

  it('should evict multiple entries if single eviction insufficient', () => {
    const largeImageSize = 500 * 1024 // 500KB per image
    const threshold = IMAGE_CACHE_MAX_SIZE_BYTES * IMAGE_CACHE_EVICTION_THRESHOLD

    // Cache small images first
    const smallImageSize = 50 * 1024
    const smallImageCount = 5
    for (let i = 1; i <= smallImageCount; i++) {
      const dataUrl = generateDataUrl(smallImageSize)
      cacheService.save(i, dataUrl)
    }

    // Fill near threshold with medium images
    const mediumImageSize = 200 * 1024
    const mediumImageCount = Math.ceil((threshold - (smallImageCount * smallImageSize * 2)) / (mediumImageSize * 2))
    
    for (let i = smallImageCount + 1; i <= smallImageCount + mediumImageCount; i++) {
      const dataUrl = generateDataUrl(mediumImageSize)
      cacheService.save(i, dataUrl)
    }

    // Try to cache a large image
    const dataUrl = generateDataUrl(largeImageSize)
    cacheService.save(999, dataUrl)

    // Multiple small/medium images should be evicted
    let evictedCount = 0
    for (let i = 1; i <= smallImageCount + mediumImageCount; i++) {
      if (cacheService.get(i) === null) {
        evictedCount++
      }
    }
    expect(evictedCount).toBeGreaterThan(1)

    // Large image should be cached
    const largeImage = cacheService.get(999)
    expect(largeImage).not.toBeNull()
  })

  it('should maintain correct entry count after eviction', () => {
    const imageSize = 100 * 1024 // 100KB per image
    const threshold = IMAGE_CACHE_MAX_SIZE_BYTES * IMAGE_CACHE_EVICTION_THRESHOLD

    // Cache images to trigger eviction
    const imagesToCache = Math.ceil(threshold / (imageSize * 2)) + 3

    for (let i = 1; i <= imagesToCache; i++) {
      const dataUrl = generateDataUrl(imageSize)
      cacheService.save(i, dataUrl)
    }

    // Count actual cached entries
    let actualCount = 0
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(IMAGE_CACHE_KEY_PREFIX)) {
        actualCount++
      }
    }

    // Get metadata count
    const metadataJson = localStorage.getItem(IMAGE_CACHE_METADATA_KEY)
    const metadata = JSON.parse(metadataJson!)
    
    expect(metadata.totalEntries).toBe(actualCount)
  })

  it('should not evict when under threshold', () => {
    const smallImageSize = 10 * 1024 // 10KB per image
    
    // Cache a few small images (well under threshold)
    for (let i = 1; i <= 5; i++) {
      const dataUrl = generateDataUrl(smallImageSize)
      cacheService.save(i, dataUrl)
    }

    // All images should still be cached
    for (let i = 1; i <= 5; i++) {
      const image = cacheService.get(i)
      expect(image).not.toBeNull()
    }

    // No eviction should have occurred
    const metadataJson = localStorage.getItem(IMAGE_CACHE_METADATA_KEY)
    const metadata = JSON.parse(metadataJson!)
    expect(metadata.lastEvictionTimestamp).toBeNull()
  })

  it('should handle edge case of single large image exceeding quota', () => {
    const hugeImageSize = IMAGE_CACHE_MAX_SIZE_BYTES * 0.95 // 95% of quota
    
    const dataUrl = generateDataUrl(hugeImageSize)
    
    // Should throw QuotaExceededError or handle gracefully
    try {
      cacheService.save(1, dataUrl)
      // If save succeeds, verify it was cached
      const cached = cacheService.get(1)
      expect(cached).not.toBeNull()
    } catch (error) {
      // Should throw QuotaExceededError
      expect(error).toBeInstanceOf(Error)
      expect((error as Error).name).toBe('QuotaExceededError')
    }
  })

  it('should sort entries by timestamp for LRU eviction', () => {
    const imageSize = 100 * 1024
    
    // Cache images with delays to ensure distinct timestamps
    const indices = [1, 2, 3, 4, 5]
    for (const index of indices) {
      const dataUrl = generateDataUrl(imageSize)
      cacheService.save(index, dataUrl)
    }

    // Access middle images to update their timestamps
    cacheService.get(2)
    cacheService.get(4)

    // Fill to trigger eviction
    const threshold = IMAGE_CACHE_MAX_SIZE_BYTES * IMAGE_CACHE_EVICTION_THRESHOLD
    const imagesToCache = Math.ceil(threshold / (imageSize * 2)) + 2

    for (let i = 6; i <= imagesToCache; i++) {
      const dataUrl = generateDataUrl(imageSize)
      cacheService.save(i, dataUrl)
    }

    // Images 2 and 4 (recently accessed) should be preserved
    expect(cacheService.get(2)).not.toBeNull()
    expect(cacheService.get(4)).not.toBeNull()

    // Oldest untouched images should be evicted
    const image1 = cacheService.get(1)
    const image3 = cacheService.get(3)
    const image5 = cacheService.get(5)
    
    const evictedCount = [image1, image3, image5].filter(img => img === null).length
    expect(evictedCount).toBeGreaterThan(0)
  })

  it('should clear all caches without affecting collection data', () => {
    // Add collection data
    localStorage.setItem('pokemon-collection', JSON.stringify({ test: 'data' }))
    localStorage.setItem('pokemon-wishlist', JSON.stringify({ test: 'wishlist' }))

    // Cache some images
    for (let i = 1; i <= 5; i++) {
      const dataUrl = generateDataUrl(50 * 1024)
      cacheService.save(i, dataUrl)
    }

    // Clear cache
    cacheService.clear()

    // Image caches should be cleared
    for (let i = 1; i <= 5; i++) {
      expect(cacheService.get(i)).toBeNull()
    }

    // Collection data should remain
    expect(localStorage.getItem('pokemon-collection')).not.toBeNull()
    expect(localStorage.getItem('pokemon-wishlist')).not.toBeNull()
  })
})
