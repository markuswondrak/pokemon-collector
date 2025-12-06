# Data Model: Simplify Render and Caching Mechanism

**Feature**: 008-simplify-render-cache  
**Date**: 2025-12-06  
**Phase**: Phase 1 - Design

## Overview

This document defines the data structures, entities, and state management for the simplified image caching system. The design separates image cache (ephemeral, LRU-evicted) from collection/wishlist data (persistent, never auto-evicted).

## Core Entities

### 1. ImageCacheEntry

Represents a single cached Pokémon image stored in localStorage.

**Storage Key**: `pokemon_image_<index>` (e.g., `pokemon_image_25` for Pikachu)

```typescript
interface ImageCacheEntry {
  dataUrl: string       // Base64-encoded Data URL (e.g., "data:image/png;base64,...")
  timestamp: number     // Unix timestamp (ms) of last access (for LRU eviction)
  version: string       // App version when cached (for invalidation)
  sizeBytes: number     // Estimated size in bytes (for quota tracking)
  pokemonIndex: number  // Pokemon index (1-1025) for validation
}
```

**Validation Rules**:
- `dataUrl` MUST start with `"data:image/"` prefix
- `timestamp` MUST be valid Unix timestamp (positive integer)
- `version` MUST match semantic versioning format (e.g., "0.0.0")
- `sizeBytes` MUST be positive integer
- `pokemonIndex` MUST be between 1 and 1025 (inclusive)

**Lifecycle**:
- **Created**: When image is fetched from API and converted to Data URL
- **Updated**: Timestamp refreshed on each access (read operation)
- **Deleted**: Via LRU eviction when storage quota approached, or version invalidation

**Example**:
```json
{
  "dataUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...",
  "timestamp": 1733500800000,
  "version": "0.0.0",
  "sizeBytes": 51200,
  "pokemonIndex": 25
}
```

---

### 2. CacheMetadata

Tracks global cache state for quota management and statistics.

**Storage Key**: `pokemon_image_metadata`

```typescript
interface CacheMetadata {
  totalSizeBytes: number      // Aggregate size of all cached images
  totalEntries: number        // Count of cached images
  lastEvictionTimestamp: number | null  // Last LRU eviction time (null if never evicted)
  version: string             // App version for metadata schema
}
```

**Purpose**:
- Quick quota checks without iterating all cache entries
- Statistics for debugging and monitoring
- Tracks eviction events for logging

**Lifecycle**:
- **Initialized**: On first cache operation (if not exists)
- **Updated**: On every cache save/delete operation
- **Reset**: On app version change (alongside cache invalidation)

**Example**:
```json
{
  "totalSizeBytes": 5242880,
  "totalEntries": 100,
  "lastEvictionTimestamp": 1733500000000,
  "version": "0.0.0"
}
```

---

### 3. PokemonCardState (Component State)

Tracks loading and error state for individual Pokémon cards.

```typescript
interface PokemonCardState {
  imageDataUrl: string | null   // Loaded Data URL (null if not loaded)
  isLoading: boolean            // True while fetching image
  hasError: boolean             // True if loading failed
  errorMessage: string | null   // Error details for user display
  retryCount: number            // Number of retry attempts (max 2)
}
```

**State Transitions**:
```
Initial → Loading → Loaded (success path)
Initial → Loading → Error → Retry → Loading → Loaded/Error
```

**Error States**:
- `NETWORK_ERROR`: Transient network failure (retryable)
- `API_ERROR`: PokeAPI returned error (retryable with backoff)
- `QUOTA_ERROR`: localStorage quota exceeded (trigger eviction, retry)
- `INVALID_IMAGE`: Image encoding failed (not retryable)
- `PERSISTENT_ERROR`: Max retries exceeded (not retryable)

---

### 4. Pokemon (Existing Entity - Modified)

Updated to support optional image loading.

```typescript
interface Pokemon {
  index: number              // Pokemon index (1-1025)
  name: string               // Pokemon name
  image: string | null       // Data URL or null (lazy-loaded)
  collected: boolean         // Collection status
  wishlist: boolean          // Wishlist status
}
```

**Changes from Current Implementation**:
- `image` field becomes truly optional (null until loaded)
- No longer pre-fetched during initial data load
- Loaded on-demand when card enters viewport

---

## Storage Schema

### localStorage Keys

```typescript
// Image Cache (LRU-evicted)
const IMAGE_CACHE_KEY_PREFIX = 'pokemon_image_'
const IMAGE_CACHE_METADATA_KEY = 'pokemon_image_metadata'

// Collection/Wishlist (Never evicted)
const STORAGE_KEY_COLLECTION = 'pokemon-collection'  // Existing
const STORAGE_KEY_WISHLIST = 'pokemon-wishlist'      // Existing

// App Version (for cache invalidation)
const APP_VERSION_KEY = 'app_version'  // Track last known version
```

### Storage Allocation Strategy

**Target Quotas** (conservative estimates):
- **Total localStorage quota**: 5MB (browser-dependent, typically 5-10MB)
- **Reserved for collection/wishlist**: 500KB (user data protected)
- **Available for image cache**: 4.5MB (~90 images at 50KB average)

**Eviction Trigger**:
```typescript
const CACHE_SIZE_WARNING_THRESHOLD = 4 * 1024 * 1024  // 4MB
const CACHE_SIZE_CRITICAL_THRESHOLD = 4.5 * 1024 * 1024  // 4.5MB
const EVICTION_TARGET_SIZE = 3.5 * 1024 * 1024  // 3.5MB (after eviction)
```

---

## Data Flow

### Image Loading Flow

```
1. User scrolls → Card enters viewport
   ↓
2. IntersectionObserver triggers callback
   ↓
3. Check ImageCacheService.get(pokemonIndex)
   ↓
4a. Cache HIT → Load Data URL from localStorage → Render image
   ↓
4b. Cache MISS → Fetch from PokeAPI → Convert to Data URL
   ↓
5. ImageCacheService.save(pokemonIndex, dataUrl)
   ↓
6. Check quota → Trigger LRU eviction if needed
   ↓
7. Render image in card
```

### Cache Eviction Flow

```
1. Detect quota threshold exceeded (totalSizeBytes > CRITICAL_THRESHOLD)
   ↓
2. Load all ImageCacheEntry entries from localStorage
   ↓
3. Sort entries by timestamp (oldest first)
   ↓
4. Evict entries until totalSizeBytes < EVICTION_TARGET_SIZE
   ↓
5. Update CacheMetadata (totalSizeBytes, totalEntries, lastEvictionTimestamp)
   ↓
6. Log eviction event (count, freed bytes)
```

### Version-Based Invalidation Flow

```
1. App loads → Check localStorage['app_version']
   ↓
2. Compare with current APP_VERSION (from package.json)
   ↓
3a. Version MATCH → No action
   ↓
3b. Version MISMATCH → Invalidate all image caches
   ↓
4. Iterate all keys starting with IMAGE_CACHE_KEY_PREFIX
   ↓
5. Delete each image cache entry
   ↓
6. Reset CacheMetadata (totalSizeBytes=0, totalEntries=0)
   ↓
7. Update localStorage['app_version'] = APP_VERSION
   ↓
8. Preserve collection/wishlist data (different storage keys)
```

---

## State Management

### ImageCacheService (Singleton)

```typescript
class ImageCacheService {
  private metadata: CacheMetadata

  // Core operations
  get(pokemonIndex: number): string | null
  save(pokemonIndex: number, dataUrl: string): void
  delete(pokemonIndex: number): void
  clear(): void  // Clear all caches (not collection/wishlist)

  // Quota management
  private checkQuota(): void
  private evictLRU(targetSizeBytes: number): void
  private updateMetadata(): void

  // Validation
  private validateCacheEntry(entry: ImageCacheEntry): boolean
  private estimateDataUrlSize(dataUrl: string): number

  // Version invalidation
  invalidateOnVersionChange(): void
}
```

### useImageCache Hook

```typescript
function useImageCache(pokemonIndex: number): {
  imageDataUrl: string | null
  isLoading: boolean
  hasError: boolean
  errorMessage: string | null
  loadImage: () => Promise<void>
  clearError: () => void
} {
  // Manages component state for image loading
  // Integrates with ImageCacheService
  // Handles error states and retry logic
}
```

---

## Validation & Constraints

### Data Validation Rules

1. **ImageCacheEntry**:
   - Data URL format: `^data:image\/(png|jpeg|jpg|gif|webp);base64,[A-Za-z0-9+/=]+$`
   - Timestamp: Must be ≤ current time
   - Version: Must match `^\d+\.\d+\.\d+$` pattern
   - Size: Must be > 0 and < 5MB (single image limit)
   - Index: Must be integer in range [1, 1025]

2. **CacheMetadata**:
   - totalSizeBytes: Must be ≥ 0
   - totalEntries: Must be ≥ 0
   - totalSizeBytes consistency: Must equal sum of all ImageCacheEntry.sizeBytes

3. **Storage Keys**:
   - Collection/wishlist keys: Must NEVER be auto-deleted
   - Image cache keys: Must use consistent prefix (`pokemon_image_<index>`)

### Error Handling

**QuotaExceededError**:
- Trigger immediate LRU eviction
- Retry save operation after eviction
- Log warning if eviction insufficient (disk full scenario)

**Invalid Data URL**:
- Log error with pokemon index
- Skip cache save
- Display error state to user
- Allow retry from API

**Version Mismatch**:
- Clear all image caches atomically
- Never touch collection/wishlist data
- Log invalidation event with old/new version

---

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**: Images only fetched when card enters viewport (reduces initial load)
2. **Cache-First Strategy**: Always check localStorage before API call (instant retrieval)
3. **Timestamp Updates**: Only update timestamp on read (not on every render)
4. **Batch Eviction**: Evict multiple entries in single operation (minimize localStorage writes)
5. **Debounced Quota Checks**: Check quota every 10 cache writes (not every write)

### Expected Performance Metrics

- **Cache HIT latency**: <50ms (localStorage read + Data URL decode)
- **Cache MISS latency**: 500-2000ms (API fetch + Base64 encoding + localStorage write)
- **Eviction operation**: <500ms (100 entries sorted and deleted)
- **Version invalidation**: <1000ms (clear all image caches)

### Memory Considerations

- **In-memory cache**: None (rely on localStorage only)
- **Component state**: Minimal (one Data URL per visible card)
- **Temporary buffers**: FileReader conversion (~50-100KB per operation)

---

## Migration Strategy

### From Current Implementation

**Phase 1: Add new image cache service** (parallel to existing)
- Implement `ImageCacheService`
- Implement `useImageCache` hook
- No breaking changes to existing code

**Phase 2: Migrate components** (one grid at a time)
- Update `PokemonCard` to use `useImageCache`
- Remove `LazyLoadingGrid` wrapper from `AvailableGrid`
- Remove `LazyLoadingGrid` wrapper from `CollectionList`
- Remove `LazyLoadingGrid` wrapper from `WishlistList`

**Phase 3: Remove old services**
- Delete `lazyRenderService.ts`
- Delete `useLazyRender.ts`
- Delete `LazyLoadingGrid.tsx`
- Remove lazy render constants

### Data Preservation

- Collection/wishlist data: **ZERO IMPACT** (different storage keys)
- Existing API cache: **PRESERVED** (in-memory, unrelated to localStorage)
- Names registry cache: **PRESERVED** (separate storage key)

---

## Testing Strategy

### Unit Tests

1. **ImageCacheService**:
   - Save/retrieve/delete operations
   - LRU eviction algorithm correctness
   - Quota threshold detection
   - Version invalidation logic
   - Data URL validation

2. **useImageCache Hook**:
   - State transitions (loading → loaded → error)
   - Retry logic with exponential backoff
   - Cache integration (hit/miss scenarios)

### Contract Tests

1. **localStorage Schema**:
   - ImageCacheEntry structure matches schema
   - CacheMetadata structure matches schema
   - Storage keys follow naming convention

2. **Data URL Format**:
   - Valid Base64 encoding
   - Proper MIME type prefix
   - Browser-compatible format

### Integration Tests

1. **Viewport-Based Loading**:
   - IntersectionObserver triggers image load
   - Skeleton card displays during loading
   - Error state displays on failure

2. **Cache Eviction**:
   - LRU eviction frees sufficient space
   - Collection/wishlist data never touched
   - Metadata consistency after eviction

3. **Version Invalidation**:
   - All image caches cleared on version change
   - Collection/wishlist preserved
   - New version caches start fresh

---

## Summary

The data model provides a clean separation between ephemeral image caching and persistent user data. The LRU eviction policy ensures optimal cache utilization within localStorage constraints, while version-based invalidation prevents stale data issues. The simplified design removes complex lazy-loading abstractions in favor of straightforward IntersectionObserver-based on-demand loading.
