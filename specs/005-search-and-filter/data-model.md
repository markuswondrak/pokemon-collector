# Data Model: Search & Filter

**Feature**: Search & Filter
**Date**: 2025-12-07

## Entities

### FilterState

Represents the current status filter selected by the user.

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `status` | `enum` | The selected filter status. | Must be one of: `'all'`, `'caught'`, `'wishlist'` |

### SearchQuery

Represents the search text entered by the user.

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `query` | `string` | The text to search for. | Case-insensitive. Treated as literal. |

## State Management

### Component State (Local)

The search and filter state will be managed locally within the `App` component (or a dedicated context if it grows, but local state is sufficient for this scope).

```typescript
interface SearchFilterState {
  searchQuery: string;
  filterStatus: 'all' | 'caught' | 'wishlist';
}
```

### Derived State

The displayed list of Pokemon is derived from the source list and the current state.

```typescript
// Pseudo-code for derived state logic
const filteredPokemon = allPokemon.filter(pokemon => {
  // 1. Filter by Status
  if (filterStatus === 'caught' && !isCaught(pokemon.id)) return false;
  if (filterStatus === 'wishlist' && !isWishlisted(pokemon.id)) return false;

  // 2. Filter by Search (Debounced)
  if (!debouncedSearchQuery) return true;
  
  // Numeric ID match
  if (isNumeric(debouncedSearchQuery)) {
    return pokemon.id === parseInt(debouncedSearchQuery);
  }
  
  // Name match (min 3 chars)
  if (debouncedSearchQuery.length >= 3) {
    return pokemon.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
  }

  return true;
});
```
