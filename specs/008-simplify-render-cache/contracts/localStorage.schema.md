# localStorage Schema Contract

**Version**: 1.0.0  
**Feature**: 008-simplify-render-cache  
**Purpose**: Define localStorage storage schema and key conventions

## Overview

This contract defines the structure, keys, and validation rules for localStorage entries used by the image caching system. It ensures separation between ephemeral image cache data and persistent collection/wishlist data.

---

## Storage Keys

### Image Cache Keys (Ephemeral - LRU Evicted)

#### Individual Cache Entry

**Key Pattern**: `pokemon_image_<index>`

**Example Keys**:
- `pokemon_image_1` (Bulbasaur)
- `pokemon_image_25` (Pikachu)
- `pokemon_image_150` (Mewtwo)
- `pokemon_image_1025` (Last Pokemon)

**Value Type**: JSON-serialized `ImageCacheEntry`

**Lifecycle**:
- Created: When image fetched from API
- Updated: Timestamp refreshed on access
- Deleted: LRU eviction or version invalidation

---

#### Cache Metadata

**Key**: `pokemon_image_metadata`

**Value Type**: JSON-serialized `CacheMetadata`

**Lifecycle**:
- Created: On first cache operation
- Updated: On every cache save/delete
- Reset: On version invalidation

---

#### App Version Tracker

**Key**: `app_version`

**Value Type**: String (semantic version, e.g., "0.0.0")

**Lifecycle**:
- Created: On first app initialization
- Updated: On version change
- Used For: Cache invalidation detection

---

### Collection/Wishlist Keys (Persistent - NEVER Evicted)

#### Collection Data

**Key**: `pokemon-collection`

**Value Type**: JSON-serialized collection data (existing schema)

**Lifecycle**: Managed by `collectionStorage.ts` (unchanged)

**Protection**: MUST NEVER be touched by image cache operations

---

#### Wishlist Data

**Key**: `pokemon-wishlist`

**Value Type**: JSON-serialized wishlist data (existing schema)

**Lifecycle**: Managed by `collectionStorage.ts` (unchanged)

**Protection**: MUST NEVER be touched by image cache operations

---

## Data Schemas

### ImageCacheEntry Schema

```typescript
interface ImageCacheEntry {
  dataUrl: string       // Base64-encoded Data URL
  timestamp: number     // Unix timestamp (ms) of last access
  version: string       // App version when cached
  sizeBytes: number     // Estimated size in bytes
  pokemonIndex: number  // Pokemon index (1-1025)
}
```

**JSON Example**:
```json
{
  "dataUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==",
  "timestamp": 1733500800000,
  "version": "0.0.0",
  "sizeBytes": 51200,
  "pokemonIndex": 25
}
```

**Field Validation**:

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `dataUrl` | string | Yes | Must match `/^data:image\/(png\|jpeg\|jpg\|gif\|webp);base64,[A-Za-z0-9+/=]+$/` |
| `timestamp` | number | Yes | Must be positive integer ≤ current time |
| `version` | string | Yes | Must match `/^\d+\.\d+\.\d+$/` (semantic versioning) |
| `sizeBytes` | number | Yes | Must be positive integer > 0 and < 5MB |
| `pokemonIndex` | number | Yes | Must be integer in range [1, 1025] |

**Size Calculation**:
```typescript
function calculateSizeBytes(dataUrl: string): number {
  // Base64 overhead: ~1.33x original size
  // Account for JSON serialization overhead
  return dataUrl.length + 200 // 200 bytes for metadata
}
```

---

### CacheMetadata Schema

```typescript
interface CacheMetadata {
  totalSizeBytes: number      // Aggregate size of all cached images
  totalEntries: number        // Count of cached images
  lastEvictionTimestamp: number | null  // Last LRU eviction time
  version: string             // App version for metadata schema
}
```

**JSON Example**:
```json
{
  "totalSizeBytes": 5242880,
  "totalEntries": 100,
  "lastEvictionTimestamp": 1733500000000,
  "version": "0.0.0"
}
```

**Field Validation**:

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `totalSizeBytes` | number | Yes | Must be ≥ 0, should equal sum of all `ImageCacheEntry.sizeBytes` |
| `totalEntries` | number | Yes | Must be ≥ 0, should equal count of `pokemon_image_*` keys |
| `lastEvictionTimestamp` | number \| null | Yes | Must be positive integer or `null` (if never evicted) |
| `version` | string | Yes | Must match current `APP_VERSION` |

**Consistency Rules**:
- `totalEntries` MUST equal count of localStorage keys matching `pokemon_image_<index>` pattern
- `totalSizeBytes` MUST equal sum of all `ImageCacheEntry.sizeBytes` values
- Mismatch indicates corruption → trigger full cache rebuild

---

## Key Conventions

### Naming Rules

1. **Image Cache Keys**:
   - MUST use prefix `pokemon_image_`
   - MUST include Pokemon index as suffix
   - MUST use lowercase
   - Example: `pokemon_image_42`

2. **Metadata Keys**:
   - MUST use prefix `pokemon_image_`
   - MUST use descriptive suffix
   - Example: `pokemon_image_metadata`

3. **Collection/Wishlist Keys**:
   - MUST use `pokemon-collection` (hyphenated)
   - MUST use `pokemon-wishlist` (hyphenated)
   - These keys are **PROTECTED** from cache operations

### Key Filtering

**To iterate image cache entries**:
```typescript
function getAllImageCacheKeys(): string[] {
  const allKeys = Object.keys(localStorage)
  return allKeys.filter(key => 
    key.startsWith('pokemon_image_') && 
    key !== 'pokemon_image_metadata'
  )
}
```

**To protect collection/wishlist data**:
```typescript
function isProtectedKey(key: string): boolean {
  return key === 'pokemon-collection' || key === 'pokemon-wishlist'
}

function clearImageCache(): void {
  const allKeys = Object.keys(localStorage)
  
  for (const key of allKeys) {
    if (key.startsWith('pokemon_image_') && !isProtectedKey(key)) {
      localStorage.removeItem(key)
    }
  }
}
```

---

## Validation Rules

### Entry Validation

**Required Checks**:
1. JSON parse succeeds without errors
2. All required fields present
3. Field types match schema
4. Field values pass validation rules
5. Data URL format is valid Base64

**Validation Function**:
```typescript
function validateImageCacheEntry(entry: unknown): entry is ImageCacheEntry {
  if (typeof entry !== 'object' || entry === null) return false
  
  const e = entry as Record<string, unknown>
  
  // Required fields
  if (typeof e.dataUrl !== 'string') return false
  if (typeof e.timestamp !== 'number') return false
  if (typeof e.version !== 'string') return false
  if (typeof e.sizeBytes !== 'number') return false
  if (typeof e.pokemonIndex !== 'number') return false
  
  // Data URL format
  const dataUrlPattern = /^data:image\/(png|jpeg|jpg|gif|webp);base64,[A-Za-z0-9+/=]+$/
  if (!dataUrlPattern.test(e.dataUrl)) return false
  
  // Timestamp validation
  if (e.timestamp < 0 || e.timestamp > Date.now()) return false
  
  // Version format
  const versionPattern = /^\d+\.\d+\.\d+$/
  if (!versionPattern.test(e.version)) return false
  
  // Size validation
  if (e.sizeBytes <= 0 || e.sizeBytes > 5 * 1024 * 1024) return false
  
  // Index validation
  if (!Number.isInteger(e.pokemonIndex)) return false
  if (e.pokemonIndex < 1 || e.pokemonIndex > 1025) return false
  
  return true
}
```

---

### Metadata Validation

**Required Checks**:
1. JSON parse succeeds
2. All required fields present
3. Field types match schema
4. Consistency with actual cache entries

**Validation Function**:
```typescript
function validateCacheMetadata(metadata: unknown): metadata is CacheMetadata {
  if (typeof metadata !== 'object' || metadata === null) return false
  
  const m = metadata as Record<string, unknown>
  
  // Required fields
  if (typeof m.totalSizeBytes !== 'number') return false
  if (typeof m.totalEntries !== 'number') return false
  if (m.lastEvictionTimestamp !== null && typeof m.lastEvictionTimestamp !== 'number') return false
  if (typeof m.version !== 'string') return false
  
  // Value validation
  if (m.totalSizeBytes < 0) return false
  if (m.totalEntries < 0) return false
  if (m.lastEvictionTimestamp !== null && m.lastEvictionTimestamp < 0) return false
  
  // Version format
  const versionPattern = /^\d+\.\d+\.\d+$/
  if (!versionPattern.test(m.version)) return false
  
  return true
}
```

---

## Consistency Guarantees

### Atomic Operations

**Single Entry Save**:
```typescript
function saveImageCache(entry: ImageCacheEntry): void {
  // 1. Validate entry
  if (!validateImageCacheEntry(entry)) {
    throw new Error('Invalid cache entry')
  }
  
  // 2. Save entry
  const key = `pokemon_image_${entry.pokemonIndex}`
  localStorage.setItem(key, JSON.stringify(entry))
  
  // 3. Update metadata (atomic with entry save)
  updateMetadata(entry.sizeBytes, 1)
}
```

### Metadata Synchronization

**On every cache operation**, metadata MUST be updated:

```typescript
function updateMetadata(sizeBytesDelta: number, entriesDelta: number): void {
  const metadata = loadMetadata()
  metadata.totalSizeBytes += sizeBytesDelta
  metadata.totalEntries += entriesDelta
  localStorage.setItem('pokemon_image_metadata', JSON.stringify(metadata))
}
```

### Corruption Recovery

**Detection**:
```typescript
function detectMetadataCorruption(): boolean {
  const metadata = loadMetadata()
  const actualEntries = getAllImageCacheKeys().length
  const actualSizeBytes = calculateActualCacheSize()
  
  return (
    metadata.totalEntries !== actualEntries ||
    Math.abs(metadata.totalSizeBytes - actualSizeBytes) > 1024 // 1KB tolerance
  )
}
```

**Recovery**:
```typescript
function rebuildMetadata(): void {
  let totalSizeBytes = 0
  let totalEntries = 0
  
  const keys = getAllImageCacheKeys()
  for (const key of keys) {
    const entry = JSON.parse(localStorage.getItem(key))
    if (validateImageCacheEntry(entry)) {
      totalSizeBytes += entry.sizeBytes
      totalEntries += 1
    } else {
      // Remove corrupted entry
      localStorage.removeItem(key)
    }
  }
  
  const metadata: CacheMetadata = {
    totalSizeBytes,
    totalEntries,
    lastEvictionTimestamp: null,
    version: APP_VERSION
  }
  
  localStorage.setItem('pokemon_image_metadata', JSON.stringify(metadata))
}
```

---

## Quota Management

### Quota Thresholds

```typescript
const RESERVED_FOR_USER_DATA = 500 * 1024 // 500KB
const TOTAL_QUOTA_ESTIMATE = 5 * 1024 * 1024 // 5MB (conservative)
const AVAILABLE_FOR_CACHE = TOTAL_QUOTA_ESTIMATE - RESERVED_FOR_USER_DATA // 4.5MB

const CACHE_SIZE_WARNING = 4 * 1024 * 1024 // 4MB
const CACHE_SIZE_CRITICAL = 4.5 * 1024 * 1024 // 4.5MB
const EVICTION_TARGET = 3.5 * 1024 * 1024 // 3.5MB
```

### Eviction Strategy

**LRU (Least Recently Used)**:
1. Load all `ImageCacheEntry` entries
2. Sort by `timestamp` ascending (oldest first)
3. Delete entries until `totalSizeBytes < EVICTION_TARGET`
4. Update metadata after each deletion

---

## Migration & Versioning

### Version Change Detection

```typescript
function checkVersionChange(): boolean {
  const storedVersion = localStorage.getItem('app_version')
  const currentVersion = APP_VERSION
  
  return storedVersion !== currentVersion
}
```

### Cache Invalidation

```typescript
function invalidateCacheOnVersionChange(): void {
  if (!checkVersionChange()) return
  
  // Clear all image cache entries
  const keys = getAllImageCacheKeys()
  for (const key of keys) {
    localStorage.removeItem(key)
  }
  
  // Reset metadata
  const metadata: CacheMetadata = {
    totalSizeBytes: 0,
    totalEntries: 0,
    lastEvictionTimestamp: null,
    version: APP_VERSION
  }
  localStorage.setItem('pokemon_image_metadata', JSON.stringify(metadata))
  
  // Update version tracker
  localStorage.setItem('app_version', APP_VERSION)
  
  console.log(`[Cache] Invalidated on version change: ${storedVersion} → ${APP_VERSION}`)
}
```

---

## Testing Contract

### Unit Tests Required

1. **Schema Validation**:
   - Valid entries pass validation
   - Invalid entries rejected (missing fields, wrong types, invalid formats)

2. **Key Conventions**:
   - Key generation follows pattern
   - Protected keys never deleted by cache operations

3. **Metadata Consistency**:
   - Metadata updates reflect actual cache state
   - Corruption detection works correctly
   - Rebuild restores accurate metadata

4. **Version Invalidation**:
   - Version mismatch triggers full cache clear
   - Collection/wishlist data preserved
   - Metadata reset correctly

### Integration Tests Required

1. **localStorage Persistence**:
   - Cache survives page reload
   - Metadata consistency maintained across reloads

2. **Quota Enforcement**:
   - Eviction triggered at threshold
   - Protected keys never evicted
   - Metadata accurate after eviction

3. **Multi-Tab Scenarios**:
   - Cache changes reflected across tabs
   - No race conditions on metadata updates

---

## Error Handling

### QuotaExceededError

**Trigger**: localStorage write exceeds quota

**Recovery**:
1. Call `evictLRU(EVICTION_TARGET)`
2. Retry write operation
3. If still fails: throw `StorageUnavailableError`

### Corrupted Entry

**Detection**: JSON parse fails or validation fails

**Recovery**:
1. Delete corrupted entry
2. Log error with key
3. Continue with next entry

### Missing Metadata

**Detection**: `pokemon_image_metadata` key not found

**Recovery**:
1. Call `rebuildMetadata()` to reconstruct from entries
2. Log warning

---

## Backward Compatibility

**Breaking Changes**: None (new storage schema)

**Migration**: No migration required (no existing cache)

**Rollback**: Safe to delete all `pokemon_image_*` keys without data loss (collection/wishlist unaffected)
