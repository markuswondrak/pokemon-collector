# Research: Simplify Render and Caching Mechanism

**Feature**: 008-simplify-render-cache  
**Date**: 2025-12-06  
**Phase**: Phase 0 - Research & Discovery

## Overview

This document captures research decisions for simplifying the Pokémon image rendering and caching mechanism by replacing complex lazy-loading logic with a straightforward on-demand loading approach backed by localStorage.

## Research Areas

### 1. Image Encoding for localStorage

**Decision**: Use Base64-encoded Data URLs

**Rationale**:
- Data URLs (`data:image/png;base64,...`) are the standard format for encoding images as strings
- Natively supported by HTML `<img>` tags without additional decoding
- Widely used pattern in web applications for offline image storage
- TypeScript/JavaScript `fetch` + `FileReader` API provides built-in conversion
- No additional dependencies required

**Alternatives Considered**:
- **Binary Blob storage**: Rejected because localStorage only supports strings; would require IndexedDB which adds complexity
- **Image compression libraries**: Rejected because images from PokeAPI are already optimized; additional compression adds processing overhead
- **External image CDN**: Rejected because it defeats the purpose of offline caching and adds external dependency

**Implementation Approach**:
```typescript
// Fetch image from API and convert to Data URL
async function imageUrlToDataUrl(url: string): Promise<string> {
  const response = await fetch(url)
  const blob = await response.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
```

**References**:
- MDN Web Docs: Data URLs - https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URLs
- MDN Web Docs: FileReader API - https://developer.mozilla.org/en-US/docs/Web/API/FileReader

---

### 2. localStorage Capacity Management & LRU Eviction

**Decision**: Implement Least Recently Used (LRU) eviction policy with access timestamp tracking

**Rationale**:
- localStorage quota varies by browser (typically 5-10MB per origin)
- Average Pokémon image (~50KB Base64) → ~100-200 images before hitting limits
- LRU ensures most-accessed images remain cached (optimal for user behavior)
- Simple timestamp-based implementation without complex data structures
- Proactive eviction prevents `QuotaExceededError` disruptions

**Alternatives Considered**:
- **FIFO (First In First Out)**: Rejected because it doesn't account for access patterns; recently added images might be less valuable than frequently accessed older ones
- **LFU (Least Frequently Used)**: Rejected due to implementation complexity (requires access counters, decay mechanisms); overkill for this use case
- **Random eviction**: Rejected because it provides no predictability and poor cache hit rates
- **Manual user clearing**: Rejected because it creates poor UX (users shouldn't manage technical constraints)

**Implementation Approach**:
```typescript
interface CacheEntry {
  dataUrl: string
  timestamp: number  // Last access time
  version: string    // App version for invalidation
  sizeBytes: number  // For quota tracking
}

// LRU eviction logic
function evictOldestEntries(bytesNeeded: number): void {
  const entries = getAllCacheEntries()
  entries.sort((a, b) => a.timestamp - b.timestamp) // Oldest first
  
  let freedBytes = 0
  for (const entry of entries) {
    if (freedBytes >= bytesNeeded) break
    removeFromCache(entry.key)
    freedBytes += entry.sizeBytes
  }
}
```

**References**:
- Web Storage API Quota - https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
- LRU Cache Patterns - https://en.wikipedia.org/wiki/Cache_replacement_policies#Least_recently_used_(LRU)

---

### 3. IntersectionObserver Trigger Strategy

**Decision**: Use IntersectionObserver with 0% threshold (element enters viewport) for image loading trigger

**Rationale**:
- IntersectionObserver is the standard browser API for viewport detection
- Zero threshold (`threshold: 0`) triggers callback as soon as any part of element enters viewport
- Avoids complex batching/debouncing logic from previous implementation
- Lightweight: browser-native implementation with minimal overhead
- Decouples observation from rendering (each card manages its own state)

**Alternatives Considered**:
- **Scroll event listeners**: Rejected due to poor performance (frequent callback invocations, requires manual viewport calculations)
- **IntersectionObserver with rootMargin buffer**: Rejected because it pre-loads images before visible, defeating the simplification goal
- **Manual visibility checks on mount**: Rejected because it misses dynamically revealed cards (search filtering, scrolling)
- **Viewport-based batching (previous implementation)**: Rejected as overly complex for this feature's goals

**Implementation Approach**:
```typescript
useEffect(() => {
  if (!cardRef.current || imageLoaded) return
  
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        loadImage() // Trigger image load
        observer.disconnect() // Only trigger once
      }
    },
    { threshold: 0 } // Trigger when element enters viewport
  )
  
  observer.observe(cardRef.current)
  return () => observer.disconnect()
}, [imageLoaded])
```

**References**:
- MDN Web Docs: IntersectionObserver - https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
- Lazy Loading Images with IntersectionObserver - https://web.dev/articles/lazy-loading-images

---

### 4. Cache Invalidation Strategy

**Decision**: Version-based cache invalidation using `APP_VERSION` from package.json

**Rationale**:
- App version changes indicate potential image schema/format changes
- Already established pattern in codebase (see `nameRegistry.ts`)
- Simple comparison: `cacheEntry.version !== APP_VERSION` → invalidate
- Automatic cleanup prevents stale data accumulation
- Collection/wishlist data explicitly preserved (separate storage keys)

**Alternatives Considered**:
- **Manual cache clearing by user**: Rejected because it's poor UX and requires user understanding of technical concepts
- **Time-based expiration (TTL)**: Rejected because images don't change; version-based invalidation is more reliable
- **Content hash-based validation**: Rejected due to complexity (requires fetching image headers, comparing hashes) for marginal benefit
- **Never invalidate**: Rejected because it risks compatibility issues when image formats or schemas change

**Implementation Approach**:
```typescript
function isCacheEntryValid(entry: CacheEntry): boolean {
  return entry.version === APP_VERSION
}

function clearInvalidCaches(): void {
  const allKeys = Object.keys(localStorage)
  const imageCacheKeys = allKeys.filter(k => k.startsWith('pokemon_image_'))
  
  for (const key of imageCacheKeys) {
    const entry = JSON.parse(localStorage.getItem(key))
    if (entry.version !== APP_VERSION) {
      localStorage.removeItem(key)
    }
  }
}
```

**References**:
- Existing implementation: `src/services/nameRegistry.ts` (lines 61-64)
- Cache-Control and versioning patterns - https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching

---

### 5. Separation of Concerns: Image Cache vs Collection Data

**Decision**: Maintain strict separation with distinct localStorage keys and independent lifecycle management

**Rationale**:
- Collection/wishlist data is user-generated and must NEVER be evicted automatically
- Image cache is ephemeral and can be regenerated from API
- Separate storage keys prevent accidental data loss during cache management
- Clear ownership: `collectionStorage.ts` owns collection data, `imageCacheService.ts` owns image cache
- Enables independent versioning and migration strategies

**Storage Key Scheme**:
```typescript
// Collection/Wishlist (NEVER auto-evicted)
STORAGE_KEY_COLLECTION = 'pokemon-collection'
STORAGE_KEY_WISHLIST = 'pokemon-wishlist'

// Image Cache (LRU-evicted when needed)
IMAGE_CACHE_KEY_PREFIX = 'pokemon_image_'
// Example: 'pokemon_image_25' for Pikachu (index 25)
```

**Alternatives Considered**:
- **Single unified storage object**: Rejected because it couples image cache to collection data; eviction logic becomes complex and error-prone
- **Namespaced keys under single root**: Rejected because localStorage key iteration is required for eviction; prefix-based filtering is simpler
- **IndexedDB for images**: Rejected because it adds significant complexity (async API, transaction management) for minimal benefit

**References**:
- Existing pattern: `src/services/collectionStorage.ts` (separate keys for collection/wishlist)
- localStorage best practices - https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

---

### 6. Error Handling & Fallback States

**Decision**: Multi-layer fallback strategy with skeleton → retry → error state progression

**Rationale**:
- Network failures are common (offline, API downtime, rate limiting)
- Users need clear feedback about image availability
- Skeleton cards provide consistent loading UX (already implemented)
- Cached images bypass network entirely (no error possible)
- Graceful degradation ensures app remains functional without images

**Fallback Progression**:
1. **Skeleton Card**: Displayed while image is loading (initial state)
2. **Cached Image**: If available in localStorage, display immediately (skip loading)
3. **Fetch from API**: If not cached, attempt to load from PokeAPI
4. **Retry on transient errors**: Network timeout, 5xx errors (up to 2 retries with exponential backoff)
5. **Error State**: Display "Image unavailable" with retry button for persistent failures
6. **Continue app functionality**: Collection/wishlist operations work regardless of image status

**Implementation Approach**:
```typescript
async function loadImageWithFallback(pokemonIndex: number): Promise<string | null> {
  // 1. Check cache first
  const cached = imageCacheService.get(pokemonIndex)
  if (cached) return cached
  
  // 2. Attempt API fetch with retries
  try {
    const imageUrl = await pokemonApi.getPokemonImage(pokemonIndex)
    const dataUrl = await imageUrlToDataUrl(imageUrl)
    imageCacheService.save(pokemonIndex, dataUrl)
    return dataUrl
  } catch (error) {
    if (isTransientError(error)) {
      return retryWithBackoff(() => loadImageWithFallback(pokemonIndex))
    }
    // 3. Persistent failure → return null (triggers error UI)
    return null
  }
}
```

**Alternatives Considered**:
- **Fail silently**: Rejected because users need to know when data is unavailable
- **Block app until images load**: Rejected because it degrades UX; images are secondary to collection functionality
- **Infinite retries**: Rejected because it can cause performance issues and doesn't handle permanent failures
- **Generic error placeholder**: Rejected in favor of actionable error message with retry capability

**References**:
- Error handling best practices - https://web.dev/articles/reliable
- Exponential backoff pattern - https://en.wikipedia.org/wiki/Exponential_backoff

---

### 7. Removal of Complex Lazy-Loading Logic

**Decision**: Delete `LazyRenderService`, `useLazyRender`, and `LazyLoadingGrid` components entirely

**Rationale**:
- Complexity removal is the core goal of this feature
- IntersectionObserver in individual cards is sufficient for viewport detection
- No need for centralized render queue, batching, or priority management
- Reduces cognitive load for future maintainers
- Eliminates performance optimization that isn't needed (premature optimization)

**Components to Remove**:
- `src/services/lazyRenderService.ts` (279 lines) - Complex IntersectionObserver orchestration
- `src/hooks/useLazyRender.ts` (231 lines) - Hook managing LazyRenderService lifecycle
- `src/components/LazyLoadingGrid.tsx` - Grid wrapper with lazy rendering logic
- Constants in `src/utils/constants.ts`: `LAZY_RENDER_BUFFER_SIZE`, `LAZY_RENDER_BATCH_SIZE`, `LAZY_RENDER_BATCH_DELAY`, etc.

**Simplification Benefits**:
- **Reduced code**: ~500+ lines deleted
- **Simpler mental model**: Each card manages its own loading state
- **Easier debugging**: No complex state machines or event queues
- **Faster onboarding**: New developers understand IntersectionObserver pattern immediately

**Alternatives Considered**:
- **Refactor existing services**: Rejected because incremental changes don't achieve simplification goal; still leaves complex abstractions
- **Keep lazy loading for performance**: Rejected because modern browsers handle 1000+ DOM elements efficiently; images are the bottleneck, not rendering
- **Hybrid approach (lazy + caching)**: Rejected because it maintains complexity; this feature aims for simplicity

**References**:
- YAGNI principle (You Aren't Gonna Need It) - https://en.wikipedia.org/wiki/You_aren%27t_gonna_need_it
- Simple Made Easy (Rich Hickey) - Prefer simple solutions over complex optimizations

---

## Technical Unknowns Resolved

All technical unknowns from the feature spec have been researched and resolved:

1. **Image encoding for localStorage**: ✅ Base64 Data URLs
2. **Capacity management**: ✅ LRU eviction with timestamp tracking
3. **Viewport detection**: ✅ IntersectionObserver with 0% threshold
4. **Cache invalidation**: ✅ Version-based using APP_VERSION
5. **Data separation**: ✅ Distinct storage keys and lifecycle management
6. **Error handling**: ✅ Multi-layer fallback with skeleton → retry → error state
7. **Complexity removal**: ✅ Delete LazyRenderService, useLazyRender, LazyLoadingGrid

## Dependencies & Best Practices

### New Dependencies
None required. Feature uses existing browser APIs and project dependencies:
- `FileReader` API (built-in)
- `IntersectionObserver` API (built-in)
- `localStorage` API (built-in)
- React hooks (`useEffect`, `useState`, `useRef`) - already in use

### Best Practices Applied
- **Browser API compatibility**: All APIs supported in target browsers (Chrome 90+, Firefox 88+, Safari 14+)
- **TypeScript strict mode**: Type safety for cache entries, Data URLs, error states
- **Separation of concerns**: Clear boundaries between image cache and collection storage
- **Defensive programming**: Validate cache entries, handle quota exceeded errors, fallback gracefully
- **Performance**: Avoid unnecessary re-renders (cache checks before API calls)
- **Testing**: Unit tests for cache operations, integration tests for IntersectionObserver behavior

## Implementation Readiness

All research is complete. No NEEDS CLARIFICATION items remaining. Ready to proceed to Phase 1 (Design & Contracts).
