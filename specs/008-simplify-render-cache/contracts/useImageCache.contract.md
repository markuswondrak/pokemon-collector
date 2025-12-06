# useImageCache Hook Contract

**Version**: 1.0.0  
**Feature**: 008-simplify-render-cache  
**Purpose**: Define the API contract for the image cache React hook

## Hook Interface

### Function: `useImageCache`

Custom React hook for managing image loading with localStorage caching.

**Signature**:
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

---

## Parameters

### `pokemonIndex`

**Type**: `number`  
**Required**: Yes  
**Validation**: Must be integer between 1 and 1025

**Description**: Pokemon index to load/cache image for

**Example**:
```typescript
const { imageDataUrl, isLoading } = useImageCache(25) // Pikachu
```

---

## Return Value

### Object Properties

#### `imageDataUrl`

**Type**: `string | null`  
**Description**: Base64-encoded Data URL of cached/loaded image

**Values**:
- `null`: Image not loaded yet, or loading failed
- `string`: Valid Data URL (e.g., "data:image/png;base64,...")

**Usage**:
```typescript
{imageDataUrl && <img src={imageDataUrl} alt="Pokemon" />}
```

---

#### `isLoading`

**Type**: `boolean`  
**Description**: True while image is being fetched/converted

**Values**:
- `true`: Loading in progress (show skeleton)
- `false`: Loading complete (success or error)

**Usage**:
```typescript
{isLoading && <SkeletonCard />}
```

---

#### `hasError`

**Type**: `boolean`  
**Description**: True if image loading failed

**Values**:
- `true`: Error occurred (display error state)
- `false`: No error (loading or success)

**Usage**:
```typescript
{hasError && <ErrorMessage>{errorMessage}</ErrorMessage>}
```

---

#### `errorMessage`

**Type**: `string | null`  
**Description**: Human-readable error message for display

**Values**:
- `null`: No error
- `string`: Error description (e.g., "Network error. Please try again.")

**Usage**:
```typescript
{hasError && <Text color="red.500">{errorMessage}</Text>}
```

---

#### `loadImage`

**Type**: `() => Promise<void>`  
**Description**: Function to trigger image loading (for retry scenarios)

**Behavior**:
1. Checks `ImageCacheService.get(pokemonIndex)` for cached image
2. If cached: Sets `imageDataUrl` immediately (cache hit)
3. If not cached: Fetches from PokeAPI, converts to Data URL, saves to cache
4. On success: Sets `imageDataUrl`, clears error state
5. On failure: Sets `hasError` and `errorMessage`, increments retry count

**Usage**:
```typescript
const { loadImage, hasError } = useImageCache(25)

// Retry button
{hasError && <Button onClick={loadImage}>Retry</Button>}
```

**Error Handling**:
- Transient errors (network timeout, 5xx): Retryable (up to 2 attempts)
- Permanent errors (invalid image, quota exceeded): Not retryable
- Exponential backoff: 1s, 2s, 4s between retries

---

#### `clearError`

**Type**: `() => void`  
**Description**: Function to reset error state

**Behavior**:
- Sets `hasError` to `false`
- Sets `errorMessage` to `null`
- Does not clear `imageDataUrl` (preserves any successfully loaded image)

**Usage**:
```typescript
const { clearError } = useImageCache(25)

// Dismiss error
<Button onClick={clearError}>Dismiss</Button>
```

---

## State Machine

### States

```
IDLE → LOADING → LOADED (success path)
IDLE → LOADING → ERROR → RETRY → LOADING → LOADED/ERROR
```

### State Definitions

1. **IDLE**: Initial state, no loading started
   - `imageDataUrl`: `null`
   - `isLoading`: `false`
   - `hasError`: `false`

2. **LOADING**: Image fetch in progress
   - `imageDataUrl`: `null`
   - `isLoading`: `true`
   - `hasError`: `false`

3. **LOADED**: Image successfully loaded
   - `imageDataUrl`: `string` (Data URL)
   - `isLoading`: `false`
   - `hasError`: `false`

4. **ERROR**: Loading failed
   - `imageDataUrl`: `null`
   - `isLoading`: `false`
   - `hasError`: `true`
   - `errorMessage`: `string`

5. **RETRY**: User triggered retry after error
   - Transitions to `LOADING` state
   - Increments internal retry counter

---

## Behavior Specifications

### Automatic Loading on Mount

**Trigger**: IntersectionObserver detects card entering viewport

**Sequence**:
```typescript
useEffect(() => {
  if (!isIntersecting || imageDataUrl) return
  loadImage() // Automatic load on visibility
}, [isIntersecting])
```

**Purpose**: On-demand loading without manual trigger

---

### Cache Hit Path (Fast)

**Duration**: < 50ms

**Sequence**:
1. Call `ImageCacheService.get(pokemonIndex)`
2. If Data URL returned: Set `imageDataUrl`, skip API call
3. Transition to `LOADED` state immediately

**User Experience**: Instant image render (no loading state)

---

### Cache Miss Path (Slow)

**Duration**: 500-2000ms

**Sequence**:
1. Call `ImageCacheService.get(pokemonIndex)` → returns `null`
2. Set `isLoading` to `true` (show skeleton)
3. Fetch image from PokeAPI: `GET https://pokeapi.co/api/v2/pokemon/{index}`
4. Extract image URL from response: `data.sprites.other['official-artwork'].front_default`
5. Fetch image binary: `fetch(imageUrl)`
6. Convert to Data URL: `FileReader.readAsDataURL(blob)`
7. Save to cache: `ImageCacheService.save(pokemonIndex, dataUrl)`
8. Set `imageDataUrl` and `isLoading` to `false`
9. Transition to `LOADED` state

**User Experience**: Skeleton card → image render

---

### Error Handling Path

**Transient Errors** (retryable):
- Network timeout
- HTTP 5xx errors
- `QuotaExceededError` (after eviction attempt)

**Permanent Errors** (not retryable):
- HTTP 404 (Pokemon not found)
- Invalid image format
- Corrupted API response
- Max retries exceeded (2 attempts)

**Retry Strategy**:
```typescript
async function loadImageWithRetry(attempt: number = 0): Promise<void> {
  try {
    await loadImage()
  } catch (error) {
    if (isTransientError(error) && attempt < 2) {
      const delay = Math.pow(2, attempt) * 1000 // 1s, 2s, 4s
      await sleep(delay)
      await loadImageWithRetry(attempt + 1)
    } else {
      setHasError(true)
      setErrorMessage(formatErrorMessage(error))
    }
  }
}
```

---

## Error Messages

### User-Facing Error Messages

```typescript
const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to load image. Check your internet connection.',
  API_ERROR: 'Image temporarily unavailable. Please try again later.',
  QUOTA_ERROR: 'Storage full. Some older images were removed.',
  INVALID_IMAGE: 'Invalid image format. Unable to display.',
  UNKNOWN_ERROR: 'An error occurred while loading the image.'
}
```

---

## Integration with IntersectionObserver

### Recommended Usage Pattern

```typescript
function PokemonCard({ pokemon }: { pokemon: Pokemon }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)
  
  const {
    imageDataUrl,
    isLoading,
    hasError,
    errorMessage,
    loadImage,
    clearError
  } = useImageCache(pokemon.index)
  
  // Observe viewport intersection
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      { threshold: 0 }
    )
    
    if (cardRef.current) {
      observer.observe(cardRef.current)
    }
    
    return () => observer.disconnect()
  }, [])
  
  // Trigger loading when visible
  useEffect(() => {
    if (isIntersecting && !imageDataUrl && !isLoading && !hasError) {
      loadImage()
    }
  }, [isIntersecting, imageDataUrl, isLoading, hasError])
  
  return (
    <Card ref={cardRef}>
      {isLoading && <SkeletonCard />}
      {imageDataUrl && <img src={imageDataUrl} alt={pokemon.name} />}
      {hasError && (
        <Box>
          <Text color="red.500">{errorMessage}</Text>
          <Button onClick={loadImage}>Retry</Button>
        </Box>
      )}
    </Card>
  )
}
```

---

## Performance Considerations

### Optimization Strategies

1. **Prevent Duplicate Loads**: Check `imageDataUrl` before calling `loadImage()`
2. **Debounce IntersectionObserver**: Only trigger once per intersection
3. **Cancel In-Flight Requests**: Use AbortController for cleanup
4. **Memoize Callbacks**: Use `useCallback` for `loadImage` and `clearError`

### Memory Management

- **Single Data URL per card**: ~50-100KB in component state
- **No in-memory cache**: Rely on localStorage only
- **Cleanup on unmount**: Cancel pending fetch requests

---

## Testing Contract

### Unit Tests Required

1. **Initial State**:
   - `imageDataUrl` is `null`
   - `isLoading` is `false`
   - `hasError` is `false`

2. **Cache Hit Scenario**:
   - `loadImage()` retrieves from cache
   - `imageDataUrl` set immediately
   - `isLoading` remains `false` (instant load)

3. **Cache Miss Scenario**:
   - `loadImage()` fetches from API
   - `isLoading` set to `true` during fetch
   - `imageDataUrl` set after successful fetch
   - `isLoading` set to `false` after completion

4. **Error Handling**:
   - Transient error triggers retry
   - Permanent error sets `hasError` and `errorMessage`
   - `clearError()` resets error state

5. **Retry Logic**:
   - Exponential backoff applied
   - Max 2 retry attempts
   - Error state after max retries

---

## Integration Tests Required

1. IntersectionObserver triggers `loadImage()` automatically
2. Skeleton card displayed during loading
3. Error state displayed on failure
4. Retry button re-triggers loading
5. Multiple cards don't interfere with each other

---

## Backward Compatibility

**Breaking Changes**: None (new hook)

**Migration**: Replace manual image loading logic in `PokemonCard` component

**Dependencies**:
- `ImageCacheService` (singleton)
- `pokemonApi` service (existing)
- React 19+ (hooks API)
