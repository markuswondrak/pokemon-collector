# Quickstart: Global Data Index

## Verification Steps

1. **Clear Storage**:
   - Open DevTools > Application > Local Storage.
   - Clear all keys for `http://localhost:5173`.

2. **Initial Load**:
   - Reload the page.
   - Verify a loading indicator appears briefly.
   - Check Local Storage:
     - `pokemon-collector:index` should contain ~1300 items.
     - `pokemon-collector:index-timestamp` should be present.

3. **Subsequent Load**:
   - Reload the page again.
   - Verify NO network request to `pokeapi.co` is made (check Network tab).
   - App should load instantly.

4. **Offline Mode**:
   - Set Network throttling to "Offline" in DevTools.
   - Reload the page.
   - App should still load (using cached data).

## Development

- **Service**: `src/services/api/pokeApi.ts`
- **Storage**: `src/services/storage/localStorage.ts`
- **Hook**: `src/hooks/usePokemonIndex.ts`
