/**
 * ImageCacheService
 * 
 * Singleton service managing localStorage-based image caching with LRU eviction.
 * Feature: 008-simplify-render-cache
 */

import { 
  MIN_POKEMON_INDEX, 
  MAX_POKEMON_INDEX,
  IMAGE_CACHE_KEY_PREFIX,
  IMAGE_CACHE_METADATA_KEY,
  IMAGE_CACHE_MAX_SIZE_BYTES,
  IMAGE_CACHE_EVICTION_THRESHOLD
} from '../utils/constants'
import { APP_VERSION } from '../utils/version'

/**
 * Represents a single cached Pokémon image stored in localStorage
 */
export interface ImageCacheEntry {
  dataUrl: string       // Base64-encoded Data URL
  timestamp: number     // Unix timestamp (ms) of last access (for LRU eviction)
  version: string       // App version when cached (for invalidation)
  sizeBytes: number     // Estimated size in bytes (for quota tracking)
  pokemonIndex: number  // Pokemon index (1-1025) for validation
}

/**
 * Tracks global cache state for quota management and statistics
 */
export interface CacheMetadata {
  totalSizeBytes: number           // Aggregate size of all cached images
  totalEntries: number             // Count of cached images
  lastEvictionTimestamp: number | null  // Last LRU eviction time
  version: string                  // App version for metadata schema
}

/**
 * Custom error classes for image cache operations
 */
export class InvalidDataUrlError extends Error {
  constructor(dataUrl: string) {
    super(`Invalid Data URL format: ${dataUrl.substring(0, 50)}...`)
    this.name = 'InvalidDataUrlError'
  }
}

export class InvalidPokemonIndexError extends Error {
  constructor(index: number) {
    super(`Invalid Pokemon index: ${String(index)}. Must be between ${String(MIN_POKEMON_INDEX)} and ${String(MAX_POKEMON_INDEX)}.`)
    this.name = 'InvalidPokemonIndexError'
  }
}

export class QuotaExceededError extends Error {
  constructor(requiredBytes: number, availableBytes: number) {
    super(`localStorage quota exceeded. Required: ${String(requiredBytes)}B, Available: ${String(availableBytes)}B`)
    this.name = 'QuotaExceededError'
  }
}

export class StorageUnavailableError extends Error {
  constructor() {
    super('localStorage is unavailable (disabled or quota exceeded)')
    this.name = 'StorageUnavailableError'
  }
}

/**
 * ImageCacheService - Singleton service for image caching
 */
export class ImageCacheService {
  private static instance: ImageCacheService | null = null

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ImageCacheService {
    if (!ImageCacheService.instance) {
      ImageCacheService.instance = new ImageCacheService()
    }
    return ImageCacheService.instance
  }

  /**
   * Retrieve cached image Data URL by Pokemon index
   * @param pokemonIndex - Pokemon index (1-1025)
   * @returns Base64-encoded Data URL if cached and valid, null otherwise
   */
  public get(pokemonIndex: number): string | null {
    try {
      // Validate index
      if (!this.isValidPokemonIndex(pokemonIndex)) {
        return null
      }

      // Check localStorage availability
      if (!this.isStorageAvailable()) {
        return null
      }

      // Retrieve cache entry
      const key = this.getCacheKey(pokemonIndex)
      const entryJson = localStorage.getItem(key)
      if (!entryJson) {
        return null
      }

      // Parse and validate cache entry
      const entry = JSON.parse(entryJson) as ImageCacheEntry
      if (!this.isValidCacheEntry(entry, pokemonIndex)) {
        // Corrupted or invalid entry, delete it
        this.delete(pokemonIndex)
        return null
      }

      // Check version compatibility
      if (entry.version !== this.getAppVersion()) {
        // Stale cache, delete it
        this.delete(pokemonIndex)
        return null
      }

      // Update timestamp for LRU tracking
      entry.timestamp = Date.now()
      localStorage.setItem(key, JSON.stringify(entry))

      return entry.dataUrl
    } catch (error) {
      // Silent failure on any error
      console.error(`Failed to get cache for Pokemon ${String(pokemonIndex)}:`, error)
      return null
    }
  }

  /**
   * Save image Data URL to cache with metadata
   * @param pokemonIndex - Pokemon index (1-1025)
   * @param dataUrl - Base64-encoded Data URL
   */
  public save(pokemonIndex: number, dataUrl: string): void {
    // Validate inputs
    if (!this.isValidPokemonIndex(pokemonIndex)) {
      throw new InvalidPokemonIndexError(pokemonIndex)
    }

    if (!this.isValidDataUrl(dataUrl)) {
      throw new InvalidDataUrlError(dataUrl)
    }

    // Check localStorage availability
    if (!this.isStorageAvailable()) {
      throw new StorageUnavailableError()
    }

    // Create cache entry
    const sizeBytes = this.estimateDataUrlSize(dataUrl)
    const entry: ImageCacheEntry = {
      dataUrl,
      timestamp: Date.now(),
      version: this.getAppVersion(),
      sizeBytes,
      pokemonIndex
    }

    // Check if entry already exists and calculate net size change
    const key = this.getCacheKey(pokemonIndex)
    let oldSizeBytes = 0
    let isNewEntry = true
    
    try {
      const existingEntryJson = localStorage.getItem(key)
      if (existingEntryJson) {
        const existingEntry = JSON.parse(existingEntryJson) as ImageCacheEntry
        oldSizeBytes = existingEntry.sizeBytes
        isNewEntry = false
      }
    } catch {
      // If parsing fails, treat as new entry
    }

    // Calculate net size increase for quota check
    const netSizeIncrease = sizeBytes - oldSizeBytes

    // Check quota and evict if needed (only check for increase)
    if (netSizeIncrease > 0) {
      this.checkQuotaAndEvict(netSizeIncrease)
    }

    // Save to localStorage
    try {
      localStorage.setItem(key, JSON.stringify(entry))
      
      // Update metadata based on whether this is new or replacement
      if (isNewEntry) {
        this.updateMetadataAfterSave(sizeBytes)
      } else {
        this.updateMetadataAfterReplace(oldSizeBytes, sizeBytes)
      }
    } catch (error) {
      // Quota exceeded even after eviction
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        throw new QuotaExceededError(sizeBytes, 0)
      }
      throw error
    }
  }

  /**
   * Remove cached image entry by Pokemon index
   * @param pokemonIndex - Pokemon index (1-1025)
   */
  public delete(pokemonIndex: number): void {
    try {
      if (!this.isStorageAvailable()) {
        return
      }

      const key = this.getCacheKey(pokemonIndex)
      const entryJson = localStorage.getItem(key)
      if (!entryJson) {
        return // Already deleted or never existed
      }

      // Parse to get size for metadata update
      const entry = JSON.parse(entryJson) as ImageCacheEntry
      localStorage.removeItem(key)
      this.updateMetadataAfterDelete(entry.sizeBytes)
    } catch (error) {
      // Silent failure
      console.error(`Failed to delete cache for Pokemon ${String(pokemonIndex)}:`, error)
    }
  }

  /**
   * Clear all image cache entries (preserves collection/wishlist data)
   */
  public clear(): void {
    try {
      if (!this.isStorageAvailable()) {
        return
      }

      const keysToDelete: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && this.isImageCacheKey(key)) {
          keysToDelete.push(key)
        }
      }

      // Delete all image cache entries
      for (const key of keysToDelete) {
        localStorage.removeItem(key)
      }

      // Reset metadata
      this.resetMetadata()
    } catch (error) {
      console.error('Failed to clear image cache:', error)
    }
  }

  /**
   * Invalidate cache entries with version mismatch
   */
  public invalidateOnVersionChange(): void {
    try {
      if (!this.isStorageAvailable()) {
        return
      }

      const currentVersion = this.getAppVersion()
      const metadata = this.getMetadata()

      // Check if version changed
      if (metadata.version === currentVersion) {
        return // No version change
      }

      // Clear all image caches
      this.clear()

      // Update metadata version
      const newMetadata: CacheMetadata = {
        totalSizeBytes: 0,
        totalEntries: 0,
        lastEvictionTimestamp: null,
        version: currentVersion
      }
      localStorage.setItem(IMAGE_CACHE_METADATA_KEY, JSON.stringify(newMetadata))
    } catch (error) {
      console.error('Failed to invalidate cache on version change:', error)
    }
  }

  /**
   * Private helper methods
   */

  private getCacheKey(pokemonIndex: number): string {
    return `${IMAGE_CACHE_KEY_PREFIX}${String(pokemonIndex)}`
  }

  private isImageCacheKey(key: string): boolean {
    return key.startsWith(IMAGE_CACHE_KEY_PREFIX) || key === IMAGE_CACHE_METADATA_KEY
  }

  private isValidPokemonIndex(index: number): boolean {
    return Number.isInteger(index) && index >= MIN_POKEMON_INDEX && index <= MAX_POKEMON_INDEX
  }

  private isValidDataUrl(dataUrl: string): boolean {
    return typeof dataUrl === 'string' && dataUrl.startsWith('data:image/')
  }

  private isValidCacheEntry(entry: ImageCacheEntry, expectedIndex: number): boolean {
    return (
      entry &&
      typeof entry.dataUrl === 'string' &&
      entry.dataUrl.startsWith('data:image/') &&
      typeof entry.timestamp === 'number' &&
      entry.timestamp > 0 &&
      typeof entry.version === 'string' &&
      typeof entry.sizeBytes === 'number' &&
      entry.sizeBytes > 0 &&
      entry.pokemonIndex === expectedIndex
    )
  }

  private isStorageAvailable(): boolean {
    try {
      const testKey = '__storage_test__'
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)
      return true
    } catch {
      return false
    }
  }

  private estimateDataUrlSize(dataUrl: string): number {
    // Calculate the actual size of the JSON-encoded cache entry
    // This includes the dataUrl plus overhead from the JSON object structure
    const tempEntry: ImageCacheEntry = {
      dataUrl,
      timestamp: Date.now(),
      version: this.getAppVersion(),
      sizeBytes: 0, // Placeholder, will be calculated
      pokemonIndex: 0 // Placeholder
    }
    // Calculate actual JSON encoded size
    const jsonString = JSON.stringify(tempEntry)
    return jsonString.length * 2 // UTF-16 encoding
  }

  private getAppVersion(): string {
    return APP_VERSION
  }

  private getMetadata(): CacheMetadata {
    try {
      const metadataJson = localStorage.getItem(IMAGE_CACHE_METADATA_KEY)
      if (metadataJson) {
        return JSON.parse(metadataJson) as CacheMetadata
      }
    } catch (error) {
      console.error('Failed to load cache metadata:', error)
    }

    // Return default metadata
    return {
      totalSizeBytes: 0,
      totalEntries: 0,
      lastEvictionTimestamp: null,
      version: this.getAppVersion()
    }
  }

  private updateMetadataAfterSave(addedSizeBytes: number): void {
    const metadata = this.getMetadata()
    metadata.totalSizeBytes += addedSizeBytes
    metadata.totalEntries += 1
    localStorage.setItem(IMAGE_CACHE_METADATA_KEY, JSON.stringify(metadata))
  }

  private updateMetadataAfterReplace(oldSizeBytes: number, newSizeBytes: number): void {
    const metadata = this.getMetadata()
    const sizeDifference = newSizeBytes - oldSizeBytes
    metadata.totalSizeBytes = Math.max(0, metadata.totalSizeBytes + sizeDifference)
    // totalEntries stays the same (replacing, not adding)
    localStorage.setItem(IMAGE_CACHE_METADATA_KEY, JSON.stringify(metadata))
  }

  private updateMetadataAfterDelete(removedSizeBytes: number): void {
    const metadata = this.getMetadata()
    metadata.totalSizeBytes = Math.max(0, metadata.totalSizeBytes - removedSizeBytes)
    metadata.totalEntries = Math.max(0, metadata.totalEntries - 1)
    localStorage.setItem(IMAGE_CACHE_METADATA_KEY, JSON.stringify(metadata))
  }

  private resetMetadata(): void {
    const metadata: CacheMetadata = {
      totalSizeBytes: 0,
      totalEntries: 0,
      lastEvictionTimestamp: null,
      version: this.getAppVersion()
    }
    localStorage.setItem(IMAGE_CACHE_METADATA_KEY, JSON.stringify(metadata))
  }

  private checkQuotaAndEvict(requiredSizeBytes: number): void {
    const metadata = this.getMetadata()
    const threshold = IMAGE_CACHE_MAX_SIZE_BYTES * IMAGE_CACHE_EVICTION_THRESHOLD

    if (metadata.totalSizeBytes + requiredSizeBytes > threshold) {
      // Trigger LRU eviction
      const targetSize = IMAGE_CACHE_MAX_SIZE_BYTES * 0.7 // Evict to 70% capacity
      this.evictLRU(targetSize)
    }
  }

  private evictLRU(targetSizeBytes: number): void {
    try {
      const metadata = this.getMetadata()
      if (metadata.totalSizeBytes <= targetSizeBytes) {
        return // No eviction needed
      }

      // Collect all cache entries
      const entries: Array<{ key: string; entry: ImageCacheEntry }> = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(IMAGE_CACHE_KEY_PREFIX) && key !== IMAGE_CACHE_METADATA_KEY) {
          try {
            const entryJson = localStorage.getItem(key)
            if (entryJson) {
              const entry = JSON.parse(entryJson) as ImageCacheEntry
              entries.push({ key, entry })
            }
          } catch {
            // Skip corrupted entries
          }
        }
      }

      // Sort by timestamp (oldest first)
      entries.sort((a, b) => a.entry.timestamp - b.entry.timestamp)

      // Evict until target size reached
      let currentSize = metadata.totalSizeBytes
      let evictedCount = 0
      for (const { key, entry } of entries) {
        if (currentSize <= targetSizeBytes) {
          break
        }
        localStorage.removeItem(key)
        currentSize -= entry.sizeBytes
        evictedCount++
      }

      // Update metadata with correct counts
      metadata.totalSizeBytes = currentSize
      metadata.totalEntries = Math.max(0, metadata.totalEntries - evictedCount)
      metadata.lastEvictionTimestamp = Date.now()
      localStorage.setItem(IMAGE_CACHE_METADATA_KEY, JSON.stringify(metadata))
    } catch (error) {
      console.error('Failed to evict LRU entries:', error)
    }
  }
}

export default ImageCacheService
