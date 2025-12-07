# Research: Global Data Index

**Date**: 2025-12-07
**Status**: Completed
**Context**: Researching data sources and storage limits for the Global Data Index feature.

## 1. Data Source: PokeAPI

We will use the `pokemon` endpoint to fetch the list of all Pokemon.

- **Endpoint**: `https://pokeapi.co/api/v2/pokemon?limit=10000`
- **Method**: `GET`
- **Response Format**: JSON

### Sample Response

```json
{
  "count": 1302,
  "next": null,
  "previous": null,
  "results": [
    {
      "name": "bulbasaur",
      "url": "https://pokeapi.co/api/v2/pokemon/1/"
    },
    {
      "name": "ivysaur",
      "url": "https://pokeapi.co/api/v2/pokemon/2/"
    }
    // ...
  ]
}
```

### Data Extraction Strategy

We need to extract the `id` from the `url` field.
Regex pattern: `/\/(\d+)\/$/`

```typescript
const url = "https://pokeapi.co/api/v2/pokemon/1/";
const id = url.split('/').filter(Boolean).pop(); // "1"
```

## 2. Image Source

We will use the official artwork from the PokeAPI GitHub repository.

- **URL Pattern**: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{id}.png`
- **Example**: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png`
- **Content-Type**: `image/png`

## 3. Storage Estimation

### Data Volume

- **Total Pokemon**: ~1300
- **Per Item Size**:
  - `id`: 4 bytes (number)
  - `name`: ~10-15 bytes (string)
  - `image_url`: ~80 bytes (string)
  - **Total per item**: ~100 bytes
- **Total Size**: 1300 * 100 bytes ≈ 130 KB

### LocalStorage Limits

- **Typical Limit**: 5 MB (5,000 KB)
- **Usage**: 130 KB is ~2.6% of the available quota.
- **Conclusion**: LocalStorage is sufficient for storing the index.

## 4. Implementation Details

### Storage Keys

- `pokemon-collector:index`: The JSON array of Pokemon data.
- `pokemon-collector:index-timestamp`: The timestamp (ms) of the last fetch.

### Types

```typescript
interface PokemonRef {
  id: number;
  name: string;
  imageUrl: string;
}

interface StorageSchema {
  timestamp: number;
  data: PokemonRef[];
}
```

### Error Handling: QuotaExceededError

If `localStorage.setItem` throws a `QuotaExceededError`, we must catch it and notify the user.

```typescript
try {
  localStorage.setItem(KEY, JSON.stringify(data));
} catch (e) {
  if (e.name === 'QuotaExceededError') {
    // Show blocking error UI
  }
}
```

## 5. Cache Invalidation

- **TTL**: 24 hours (86,400,000 ms)
- **Logic**:
  1. Read `timestamp` from storage.
  2. If `Date.now() - timestamp > TTL`, re-fetch.
  3. If fetch fails, fall back to existing data (stale-while-revalidate pattern not strictly required by spec, but good practice; spec says "retry" on failure, implies blocking if no data).

## 6. Performance

- **Fetch Time**: ~200-500ms (depending on network)
- **Parse Time**: Negligible (< 10ms)
- **Render Time**: Virtualization might be needed for the list view later, but for the index itself, it's just data processing.
