# Developer Quickstart: Simplify Render and Caching Mechanism

**Feature**: 008-simplify-render-cache  
**Branch**: `008-simplify-render-cache`  
**Date**: 2025-12-06

## Overview

This feature simplifies the Pokémon image rendering and caching mechanism by removing complex lazy-loading logic (LazyRenderService, useLazyRender hook, LazyLoadingGrid) and replacing it with straightforward on-demand image loading backed by localStorage.

**Key Changes**:
- ✅ Simple IntersectionObserver-based viewport detection per card
- ✅ Base64 Data URL caching in localStorage
- ✅ LRU eviction policy for quota management
- ✅ Version-based cache invalidation
- ❌ Remove LazyRenderService, useLazyRender, LazyLoadingGrid

---

## Prerequisites

- Node.js 18+
- pnpm 8+
- TypeScript 5.9+
- React 19+

**Project Setup**:
```bash
cd /home/markus/workspace/pokemon-collector
pnpm install
```

---

## Architecture Overview

### Before (Complex)

```
┌─────────────────────────────────────────────┐
│ LazyLoadingGrid                             │
│  ├─ LazyRenderService (IntersectionObserver)│
│  ├─ useLazyRender (State Management)        │
│  ├─ Batch Rendering Queue                   │
│  ├─ Debouncing & Throttling                 │
│  └─ Priority Management                     │
└─────────────────────────────────────────────┘
```

### After (Simple)

```
┌─────────────────────────────────────────────┐
│ PokemonCard (Individual)                    │
│  ├─ IntersectionObserver (per card)         │
│  ├─ useImageCache Hook                      │
│  └─ ImageCacheService (localStorage)        │
└─────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Add New Services (Parallel to Existing)

**No breaking changes yet - coexist with old implementation**

#### 1.1 Create ImageCacheService

**File**: `src/services/imageCacheService.ts`

**Core Methods**:
```typescript
class ImageCacheService {
  get(pokemonIndex: number): string | null
  save(pokemonIndex: number, dataUrl: string): void
  delete(pokemonIndex: number): void
  clear(): void
  invalidateOnVersionChange(): void
}
```

**Key Features**:
- LRU eviction when approaching quota
- Version-based invalidation
- Metadata tracking (totalSizeBytes, totalEntries)

**Test First** (TDD):
```bash
pnpm test tests/unit/imageCacheService.test.ts --run
```

---

#### 1.2 Create useImageCache Hook

**File**: `src/hooks/useImageCache.ts`

**Interface**:
```typescript
function useImageCache(pokemonIndex: number): {
  imageDataUrl: string | null
  isLoading: boolean
  hasError: boolean
  errorMessage: string | null
  loadImage: () => Promise<void>
  clearError: () => void
}
```

**Behavior**:
- Check cache first (instant retrieval)
- Fetch from API on cache miss
- Convert to Data URL and save to cache
- Handle errors with retry logic

**Test First** (TDD):
```bash
pnpm test tests/unit/useImageCache.test.ts --run
```

---

#### 1.3 Update Constants

**File**: `src/utils/constants.ts`

**Add**:
```typescript
// Image Cache Keys
export const IMAGE_CACHE_KEY_PREFIX = 'pokemon_image_'
export const IMAGE_CACHE_METADATA_KEY = 'pokemon_image_metadata'
export const APP_VERSION_KEY = 'app_version'

// Quota Thresholds
export const CACHE_SIZE_WARNING_THRESHOLD = 4 * 1024 * 1024  // 4MB
export const CACHE_SIZE_CRITICAL_THRESHOLD = 4.5 * 1024 * 1024  // 4.5MB
export const EVICTION_TARGET_SIZE = 3.5 * 1024 * 1024  // 3.5MB
```

**Remove** (after migration):
```typescript
// OLD: Lazy render constants (delete after migration)
export const LAZY_RENDER_BUFFER_SIZE
export const LAZY_RENDER_BATCH_SIZE
export const LAZY_RENDER_BATCH_DELAY
export const LAZY_RENDER_INTERSECTION_THRESHOLD
export const LAZY_RENDER_INTERSECTION_ROOT_MARGIN
```

---

### Phase 2: Migrate Components

**One grid at a time to minimize risk**

#### 2.1 Update PokemonCard Component

**File**: `src/components/PokemonCard.tsx`

**Changes**:
1. Add `useImageCache` hook
2. Add IntersectionObserver for viewport detection
3. Replace `pokemon.image` with `imageDataUrl` from hook
4. Display skeleton during loading
5. Display error state on failure

**Before**:
```typescript
function PokemonCard({ pokemon }: { pokemon: Pokemon }) {
  return (
    <Card>
      {pokemon.image && <img src={pokemon.image} alt={pokemon.name} />}
    </Card>
  )
}
```

**After**:
```typescript
function PokemonCard({ pokemon }: { pokemon: Pokemon }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)
  
  const { imageDataUrl, isLoading, hasError, errorMessage, loadImage } = 
    useImageCache(pokemon.index)
  
  // Observe viewport intersection
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      { threshold: 0 }
    )
    if (cardRef.current) observer.observe(cardRef.current)
    return () => observer.disconnect()
  }, [])
  
  // Trigger loading when visible
  useEffect(() => {
    if (isIntersecting && !imageDataUrl && !isLoading) {
      loadImage()
    }
  }, [isIntersecting, imageDataUrl, isLoading])
  
  return (
    <Card ref={cardRef}>
      {isLoading && <SkeletonCard />}
      {imageDataUrl && <img src={imageDataUrl} alt={pokemon.name} />}
      {hasError && (
        <>
          <Text color="red.500">{errorMessage}</Text>
          <Button onClick={loadImage}>Retry</Button>
        </>
      )}
    </Card>
  )
}
```

**Test**:
```bash
pnpm test tests/integration/viewport-image-loading.test.tsx --run
```

---

#### 2.2 Remove LazyLoadingGrid Wrapper

**Files to Update**:
- `src/components/AvailableGrid.tsx`
- `src/components/CollectionList.tsx`
- `src/components/WishlistList.tsx`

**Before**:
```typescript
<LazyLoadingGrid items={pokemonList}>
  {(visiblePokemon) => (
    <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }}>
      {visiblePokemon.map(pokemon => (
        <PokemonCard key={pokemon.index} pokemon={pokemon} />
      ))}
    </SimpleGrid>
  )}
</LazyLoadingGrid>
```

**After**:
```typescript
<SimpleGrid columns={{ base: 2, md: 4, lg: 6 }}>
  {pokemonList.map(pokemon => (
    <PokemonCard key={pokemon.index} pokemon={pokemon} />
  ))}
</SimpleGrid>
```

**Test**:
```bash
pnpm test tests/integration/grid-responsive.test.jsx --run
```

---

### Phase 3: Remove Old Services

**Once all components migrated and tests passing**

#### 3.1 Delete Files

```bash
rm src/services/lazyRenderService.ts
rm src/hooks/useLazyRender.ts
rm src/components/LazyLoadingGrid.tsx
```

#### 3.2 Remove Constants

**File**: `src/utils/constants.ts`

Delete all `LAZY_RENDER_*` constants

#### 3.3 Update Tests

Remove or update tests for deleted components:
```bash
rm tests/unit/lazyRenderService.test.ts
rm tests/unit/useLazyRender.test.ts
rm tests/integration/lazy-loading-grid.test.tsx
rm tests/integration/lazy-loading-edge-cases.test.jsx
```

---

## Testing Strategy

### Test Execution Order

**1. Unit Tests (Parallel)**:
```bash
pnpm test tests/unit/imageCacheService.test.ts --run
pnpm test tests/unit/useImageCache.test.ts --run
```

**2. Contract Tests (Parallel)**:
```bash
pnpm test tests/contract/imageCacheSchema.test.ts --run
```

**3. Integration Tests (Sequential)**:
```bash
pnpm test tests/integration/viewport-image-loading.test.tsx --run
pnpm test tests/integration/cache-eviction.test.tsx --run
```

**4. Full Test Suite**:
```bash
pnpm test:all --run
```

---

## Development Workflow

### Step-by-Step Implementation

**Day 1: Services (TDD)**
1. Write unit tests for `ImageCacheService`
2. Implement `ImageCacheService` (pass tests)
3. Write unit tests for `useImageCache`
4. Implement `useImageCache` (pass tests)
5. Write contract tests for localStorage schema
6. Verify all tests pass

**Day 2: Component Migration**
1. Write integration test for viewport-based loading
2. Update `PokemonCard` component
3. Test with `AvailableGrid` (single grid migration)
4. Verify no regressions

**Day 3: Complete Migration**
1. Update `CollectionList` component
2. Update `WishlistList` component
3. Remove old services and tests
4. Run full test suite
5. Verify code coverage ≥ 80%

---

## Common Development Tasks

### Running the Application

```bash
# Development mode with hot reload
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Testing

```bash
# Run unit + contract tests (default)
pnpm test

# Run specific test file
pnpm test tests/unit/imageCacheService.test.ts --run

# Run integration tests (sequential)
pnpm test:integration

# Run all tests
pnpm test:all

# Generate coverage report
pnpm test:coverage
```

### Debugging

**localStorage Inspection**:
```javascript
// Browser DevTools Console

// View all cache entries
Object.keys(localStorage)
  .filter(k => k.startsWith('pokemon_image_'))
  .forEach(k => console.log(k, localStorage.getItem(k)))

// View metadata
JSON.parse(localStorage.getItem('pokemon_image_metadata'))

// Clear cache manually
Object.keys(localStorage)
  .filter(k => k.startsWith('pokemon_image_'))
  .forEach(k => localStorage.removeItem(k))
```

**React DevTools**:
- Inspect `useImageCache` hook state
- Monitor `isLoading`, `hasError`, `imageDataUrl` values
- Track component re-renders

---

## Key Files & Locations

### New Files (Create)
```
src/
├── services/
│   └── imageCacheService.ts       # NEW: localStorage cache service
├── hooks/
│   └── useImageCache.ts           # NEW: Image loading hook
tests/
├── unit/
│   ├── imageCacheService.test.ts  # NEW: Service tests
│   └── useImageCache.test.ts      # NEW: Hook tests
├── contract/
│   └── imageCacheSchema.test.ts   # NEW: Schema validation
└── integration/
    ├── viewport-image-loading.test.tsx  # NEW: IntersectionObserver test
    └── cache-eviction.test.tsx    # NEW: LRU eviction test
```

### Modified Files
```
src/
├── components/
│   ├── PokemonCard.tsx            # MODIFIED: Add useImageCache
│   ├── AvailableGrid.tsx          # MODIFIED: Remove LazyLoadingGrid
│   ├── CollectionList.tsx         # MODIFIED: Remove LazyLoadingGrid
│   └── WishlistList.tsx           # MODIFIED: Remove LazyLoadingGrid
└── utils/
    └── constants.ts               # MODIFIED: Add cache constants
```

### Deleted Files (After Migration)
```
src/
├── services/
│   └── lazyRenderService.ts       # DELETE
├── hooks/
│   └── useLazyRender.ts           # DELETE
└── components/
    └── LazyLoadingGrid.tsx        # DELETE
```

---

## API References

### ImageCacheService

See `specs/008-simplify-render-cache/contracts/imageCacheService.contract.md`

**Quick Reference**:
```typescript
const cache = ImageCacheService.getInstance()

// Retrieve cached image
const dataUrl = cache.get(25) // Returns Data URL or null

// Save image to cache
cache.save(25, 'data:image/png;base64,...')

// Delete specific entry
cache.delete(25)

// Clear all caches
cache.clear()

// Invalidate on version change
cache.invalidateOnVersionChange()
```

---

### useImageCache Hook

See `specs/008-simplify-render-cache/contracts/useImageCache.contract.md`

**Quick Reference**:
```typescript
const {
  imageDataUrl,    // Data URL or null
  isLoading,       // Loading state
  hasError,        // Error state
  errorMessage,    // Error details
  loadImage,       // Trigger loading
  clearError       // Reset error
} = useImageCache(pokemonIndex)
```

---

## Troubleshooting

### Issue: Images not loading

**Symptoms**: Skeleton cards persist, images never render

**Diagnosis**:
1. Check browser console for errors
2. Verify IntersectionObserver triggering: `console.log(isIntersecting)`
3. Check cache service: `ImageCacheService.getInstance().get(pokemonIndex)`
4. Verify API endpoint: Test `https://pokeapi.co/api/v2/pokemon/25` manually

**Solutions**:
- Network error: Check internet connection
- API rate limiting: Add delay between requests
- Corrupted cache: Clear localStorage and retry

---

### Issue: Quota exceeded errors

**Symptoms**: `QuotaExceededError` thrown, images not saving

**Diagnosis**:
1. Check cache size: `JSON.parse(localStorage.getItem('pokemon_image_metadata')).totalSizeBytes`
2. Compare with quota: Should be < 4.5MB
3. Verify eviction triggered: Check `lastEvictionTimestamp`

**Solutions**:
- Trigger manual eviction: `ImageCacheService.getInstance().clear()`
- Lower quota thresholds in constants
- Verify LRU eviction logic working correctly

---

### Issue: Collection/wishlist data lost

**Symptoms**: User collection or wishlist reset unexpectedly

**Diagnosis**:
1. Check localStorage keys: `Object.keys(localStorage)`
2. Verify `pokemon-collection` and `pokemon-wishlist` keys exist
3. Check cache clearing code: Ensure protected keys never deleted

**Solutions**:
- **CRITICAL**: Cache operations MUST NEVER touch collection/wishlist keys
- Restore from backup if available
- Add stricter key filtering in cache service

---

### Issue: Old lazy-loading tests failing

**Symptoms**: Tests referencing `LazyRenderService` or `useLazyRender` fail

**Solution**: Delete old tests after verifying new tests pass:
```bash
rm tests/unit/lazyRenderService.test.ts
rm tests/unit/useLazyRender.test.ts
rm tests/integration/lazy-loading-*.test.*
```

---

## Performance Benchmarks

### Expected Metrics

- **Cache HIT**: < 50ms (instant render)
- **Cache MISS**: 500-2000ms (API fetch + encode)
- **Eviction**: < 500ms (100 entries)
- **Version invalidation**: < 1000ms (clear all)

### Measuring Performance

```typescript
// In useImageCache hook
const startTime = performance.now()
const dataUrl = await loadImage()
const duration = performance.now() - startTime
console.log(`Image load time: ${duration}ms`)
```

---

## Constitution Compliance Checklist

- ✅ **Code Quality**: Simplified codebase (removes ~500 lines)
- ✅ **Testing Standards**: TDD approach, 80%+ coverage
- ✅ **User Experience**: Consistent loading states, error handling
- ✅ **Fast Development**: Streamlined architecture, easier maintenance
- ✅ **Test Execution**: Uses `--run` flag, respects worker limits
- ✅ **Styling**: Chakra UI components only (SkeletonCard)
- ✅ **Test Suite Separation**: Unit/contract parallel, integration sequential

---

## Resources

### Documentation
- [Feature Spec](./spec.md)
- [Data Model](./data-model.md)
- [Research Decisions](./research.md)
- [ImageCacheService Contract](./contracts/imageCacheService.contract.md)
- [useImageCache Contract](./contracts/useImageCache.contract.md)
- [localStorage Schema](./contracts/localStorage.schema.md)

### External References
- [IntersectionObserver API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [FileReader API](https://developer.mozilla.org/en-US/docs/Web/API/FileReader)
- [Data URLs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URLs)
- [localStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

---

## Next Steps

After completing this feature:

1. Run full test suite: `pnpm test:all --run`
2. Verify code coverage: `pnpm test:coverage`
3. Build production bundle: `pnpm build`
4. Test production build: `pnpm preview`
5. Update `.specify/memory/constitution.md` (if new technologies added)
6. Create PR with constitution compliance checklist

---

## Questions or Issues?

For questions about this feature, refer to:
- Feature spec: `specs/008-simplify-render-cache/spec.md`
- Implementation plan: `specs/008-simplify-render-cache/plan.md`
- Constitution: `.specify/memory/constitution.md`
