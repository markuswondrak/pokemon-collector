# ImageCacheService Contract

**Version**: 1.0.0  
**Feature**: 008-simplify-render-cache  
**Purpose**: Define the API contract for the image caching service

## Service Interface

### Class: ImageCacheService

Singleton service managing localStorage-based image caching with LRU eviction.

---

### Method: `get`

Retrieve cached image Data URL by Pokemon index.

**Signature**:
```typescript
get(pokemonIndex: number): string | null
```

**Parameters**:
- `pokemonIndex` (number, required): Pokemon index (1-1025)

**Returns**:
- `string`: Base64-encoded Data URL if cached and valid
- `null`: If not cached, cache invalid, or error occurred

**Behavior**:
- Updates `timestamp` field in cache entry (LRU tracking)
- Validates cache entry version against `APP_VERSION`
- Returns `null` for version mismatch (stale cache)
- Validates Data URL format before returning

**Side Effects**:
- Updates `ImageCacheEntry.timestamp` in localStorage
- No network requests

**Example**:
```typescript
const cacheService = ImageCacheService.getInstance()
const dataUrl = cacheService.get(25) // Pikachu
if (dataUrl) {
  imageElement.src = dataUrl // Instant render
} else {
  fetchFromApi(25) // Cache miss, load from API
}
```

**Error Handling**:
- Invalid index: Returns `null` (silently fails)
- Corrupted cache entry: Deletes entry, returns `null`
- localStorage unavailable: Returns `null`

---

### Method: `save`

Save image Data URL to cache with metadata.

**Signature**:
```typescript
save(pokemonIndex: number, dataUrl: string): void
```

**Parameters**:
- `pokemonIndex` (number, required): Pokemon index (1-1025)
- `dataUrl` (string, required): Base64-encoded Data URL (e.g., "data:image/png;base64,...")

**Returns**: `void`

**Behavior**:
- Validates Data URL format (must start with `"data:image/"`)
- Calculates `sizeBytes` from Data URL length
- Creates `ImageCacheEntry` with current timestamp and `APP_VERSION`
- Checks quota and triggers LRU eviction if needed
- Writes to localStorage with key `pokemon_image_<index>`
- Updates `CacheMetadata` (totalSizeBytes, totalEntries)

**Side Effects**:
- Writes to localStorage (one entry + metadata update)
- May trigger LRU eviction (deletes oldest entries)
- Updates global cache metadata

**Example**:
```typescript
const cacheService = ImageCacheService.getInstance()
const response = await fetch('https://pokeapi.co/api/v2/pokemon/25')
const blob = await response.blob()
const dataUrl = await blobToDataUrl(blob)
cacheService.save(25, dataUrl) // Cache for future use
```

**Error Handling**:
- Invalid Data URL format: Throws `InvalidDataUrlError`
- Invalid index: Throws `InvalidPokemonIndexError`
- Quota exceeded (after eviction): Throws `QuotaExceededError`
- localStorage unavailable: Throws `StorageUnavailableError`

**Exceptions**:
```typescript
class InvalidDataUrlError extends Error {
  constructor(dataUrl: string) {
    super(`Invalid Data URL format: ${dataUrl.substring(0, 50)}...`)
  }
}

class InvalidPokemonIndexError extends Error {
  constructor(index: number) {
    super(`Invalid Pokemon index: ${index}. Must be between 1 and 1025.`)
  }
}

class QuotaExceededError extends Error {
  constructor(requiredBytes: number, availableBytes: number) {
    super(`localStorage quota exceeded. Required: ${requiredBytes}B, Available: ${availableBytes}B`)
  }
}

class StorageUnavailableError extends Error {
  constructor() {
    super('localStorage is unavailable (disabled or quota exceeded)')
  }
}
```

---

### Method: `delete`

Remove cached image entry by Pokemon index.

**Signature**:
```typescript
delete(pokemonIndex: number): void
```

**Parameters**:
- `pokemonIndex` (number, required): Pokemon index (1-1025)

**Returns**: `void`

**Behavior**:
- Removes localStorage entry with key `pokemon_image_<index>`
- Updates `CacheMetadata` (decrements totalSizeBytes, totalEntries)
- No-op if entry doesn't exist

**Side Effects**:
- Deletes from localStorage
- Updates global cache metadata

**Example**:
```typescript
const cacheService = ImageCacheService.getInstance()
cacheService.delete(25) // Remove Pikachu from cache
```

**Error Handling**:
- Invalid index: Silent no-op (idempotent)
- localStorage unavailable: Silent failure (cache already inaccessible)

---

### Method: `clear`

Clear all image cache entries (preserves collection/wishlist data).

**Signature**:
```typescript
clear(): void
```

**Parameters**: None

**Returns**: `void`

**Behavior**:
- Iterates all localStorage keys
- Deletes keys starting with `pokemon_image_` prefix
- Resets `CacheMetadata` (totalSizeBytes=0, totalEntries=0)
- **NEVER** touches `pokemon-collection` or `pokemon-wishlist` keys

**Side Effects**:
- Deletes multiple localStorage entries
- Resets cache metadata
- Logs clear operation (count, freed bytes)

**Example**:
```typescript
const cacheService = ImageCacheService.getInstance()
cacheService.clear() // Clear all cached images
```

**Error Handling**:
- localStorage unavailable: Silent failure
- Partial deletion: Continues with remaining entries, logs errors

---

### Method: `invalidateOnVersionChange`

Clear all image caches if app version changed.

**Signature**:
```typescript
invalidateOnVersionChange(): void
```

**Parameters**: None

**Returns**: `void`

**Behavior**:
- Reads `localStorage['app_version']`
- Compares with current `APP_VERSION` (from package.json)
- If version mismatch: calls `clear()` and updates `app_version`
- If version match: no-op

**Side Effects**:
- May clear entire image cache
- Updates `localStorage['app_version']`

**Example**:
```typescript
const cacheService = ImageCacheService.getInstance()
cacheService.invalidateOnVersionChange() // Call on app initialization
```

**Error Handling**:
- localStorage unavailable: Silent failure (cache inaccessible anyway)
- Invalid version format: Treats as mismatch, clears cache

---

### Private Method: `evictLRU`

Evict oldest cached images until target size reached (LRU policy).

**Signature**:
```typescript
private evictLRU(targetSizeBytes: number): void
```

**Parameters**:
- `targetSizeBytes` (number, required): Target cache size after eviction

**Returns**: `void`

**Behavior**:
- Loads all `ImageCacheEntry` entries from localStorage
- Sorts by `timestamp` ascending (oldest first)
- Deletes entries until `totalSizeBytes <= targetSizeBytes`
- Updates `CacheMetadata` after eviction
- Logs eviction event (count, freed bytes, oldest timestamp)

**Side Effects**:
- Deletes multiple localStorage entries
- Updates cache metadata
- Logs eviction metrics

**Error Handling**:
- Insufficient space after full eviction: Logs warning, throws `QuotaExceededError`
- Corrupted entries: Skips and continues with next entry

---

## Data Structures

### ImageCacheEntry

```typescript
interface ImageCacheEntry {
  dataUrl: string       // Base64-encoded Data URL
  timestamp: number     // Unix timestamp (ms) of last access
  version: string       // App version when cached
  sizeBytes: number     // Estimated size in bytes
  pokemonIndex: number  // Pokemon index (1-1025)
}
```

**localStorage Key Format**: `pokemon_image_<index>`

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

### CacheMetadata

```typescript
interface CacheMetadata {
  totalSizeBytes: number      // Aggregate size of all cached images
  totalEntries: number        // Count of cached images
  lastEvictionTimestamp: number | null  // Last LRU eviction time
  version: string             // App version for metadata schema
}
```

**localStorage Key**: `pokemon_image_metadata`

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

## Constants

```typescript
// Storage Keys
const IMAGE_CACHE_KEY_PREFIX = 'pokemon_image_'
const IMAGE_CACHE_METADATA_KEY = 'pokemon_image_metadata'
const APP_VERSION_KEY = 'app_version'

// Quota Thresholds
const CACHE_SIZE_WARNING_THRESHOLD = 4 * 1024 * 1024  // 4MB
const CACHE_SIZE_CRITICAL_THRESHOLD = 4.5 * 1024 * 1024  // 4.5MB
const EVICTION_TARGET_SIZE = 3.5 * 1024 * 1024  // 3.5MB

// Validation
const MIN_POKEMON_INDEX = 1
const MAX_POKEMON_INDEX = 1025
const MAX_SINGLE_IMAGE_SIZE = 5 * 1024 * 1024  // 5MB
const DATA_URL_PATTERN = /^data:image\/(png|jpeg|jpg|gif|webp);base64,[A-Za-z0-9+/=]+$/
```

---

## Validation Rules

1. **Data URL Validation**:
   - MUST start with `"data:image/"` prefix
   - MUST include valid MIME type (png, jpeg, jpg, gif, webp)
   - MUST include `;base64,` separator
   - MUST contain valid Base64 characters

2. **Pokemon Index Validation**:
   - MUST be integer
   - MUST be >= 1 and <= 1025

3. **Size Validation**:
   - Single image size MUST be < 5MB
   - Total cache size SHOULD be < 4.5MB (triggers eviction)

4. **Version Validation**:
   - MUST match semantic versioning format: `^\d+\.\d+\.\d+$`

---

## Error Scenarios

### Quota Exceeded

**Trigger**: localStorage quota reached during `save()` operation

**Handling**:
1. Call `evictLRU(EVICTION_TARGET_SIZE)` to free space
2. Retry `save()` operation
3. If still fails: throw `QuotaExceededError`

**User Impact**: Oldest cached images removed, current image saved

---

### Version Mismatch

**Trigger**: `ImageCacheEntry.version` differs from current `APP_VERSION`

**Handling**:
1. Return `null` from `get()` (cache miss)
2. On app initialization: call `invalidateOnVersionChange()` to clear all stale caches

**User Impact**: Images re-fetched from API (one-time cost after upgrade)

---

### Corrupted Cache Entry

**Trigger**: Invalid JSON or missing required fields in `ImageCacheEntry`

**Handling**:
1. Delete corrupted entry from localStorage
2. Log error with entry key
3. Return `null` from `get()` (cache miss)

**User Impact**: Single image re-fetched from API

---

### localStorage Unavailable

**Trigger**: Browser private mode, quota disabled, or disk full

**Handling**:
1. All operations fail silently (return `null` or no-op)
2. Log warning on first failure
3. App continues without caching (direct API calls)

**User Impact**: Images fetched from API every time (no caching benefit)

---

## Performance Guarantees

- **get() latency**: < 50ms (localStorage read + validation)
- **save() latency**: < 200ms (write + metadata update, excluding eviction)
- **evictLRU() latency**: < 500ms (100 entries sorted and deleted)
- **clear() latency**: < 1000ms (delete all entries + metadata reset)

---

## Testing Contract

### Unit Tests Required

1. **get() method**:
   - Returns cached Data URL for valid entry
   - Returns null for missing entry
   - Returns null for version mismatch
   - Updates timestamp on access
   - Handles corrupted entries gracefully

2. **save() method**:
   - Saves valid entry to localStorage
   - Updates metadata correctly
   - Triggers eviction when quota approached
   - Throws error for invalid Data URL
   - Throws error for invalid index

3. **delete() method**:
   - Removes entry from localStorage
   - Updates metadata correctly
   - Idempotent (no error if entry missing)

4. **clear() method**:
   - Removes all image cache entries
   - Preserves collection/wishlist data
   - Resets metadata

5. **invalidateOnVersionChange() method**:
   - Clears cache on version mismatch
   - No-op on version match
   - Updates app_version in localStorage

6. **evictLRU() method**:
   - Evicts oldest entries first
   - Stops when target size reached
   - Updates metadata after eviction

### Integration Tests Required

1. Cache persistence across page reloads
2. LRU eviction under quota pressure
3. Version invalidation on app upgrade
4. Collection/wishlist data never touched by cache operations

---

## Backward Compatibility

**Breaking Changes**: None

**Migration**: No migration required (new feature, no existing cache)

**Rollback**: Safe to delete all `pokemon_image_*` keys without affecting app functionality
