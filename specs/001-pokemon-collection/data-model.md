# Data Model: Pokemon Collection Organizer

**Date**: 2025-11-29 | **Status**: Complete | **Phase**: 1 (Design)

## Entity Definitions

### Pokemon

Represents a single Pokemon entry fetched from PokéAPI with collection status.

```typescript
interface Pokemon {
  // Immutable identifiers
  id: number;              // Unique Pokemon index (1-1025)
  name: string;            // Pokemon name from PokéAPI
  
  // Image data
  imageUrl: string;        // Official artwork image URL
  
  // Collection status
  isCollected: boolean;    // true if in user's collected list
  isWishlisted: boolean;   // true if in user's wishlist (only if NOT collected per FR-003)
}
```

**Validation Rules**:
- `id` MUST be integer in range [1, 1025]
- `name` MUST be non-empty string (alphanumeric + hyphens)
- `imageUrl` MUST be valid HTTPS URL
- `isCollected` and `isWishlisted` MUST NOT both be true (FR-003)
- Exactly one status is primary (collected XOR wishlisted XOR available)

**State Transitions**:
```
Available (isCollected=false, isWishlisted=false)
  ↔ Collected (isCollected=true, isWishlisted=false)
  ↔ Wishlisted (isCollected=false, isWishlisted=true)
```

**Allowed Transitions** (FR-020):
- Available → Collected (mark as collected)
- Available → Wishlisted (add to wishlist)
- Collected → Available (remove from collected)
- Wishlisted → Available (remove from wishlist)
- Collected → Wishlisted (remove from collected AND add to wishlist in single atomic operation)
- Wishlisted → Collected (remove from wishlist AND add to collected in single atomic operation)

---

### Collection

Represents the user's collected Pokemon entries.

```typescript
interface Collection {
  // Metadata
  id: string;              // "collection" (singleton)
  lastUpdated: number;     // Timestamp of last modification (milliseconds)
  
  // Data
  items: Map<number, Pokemon>; // Pokemon ID → Pokemon mapping
  count: number;           // Convenience: number of collected items
}
```

**Validation Rules**:
- `id` MUST be exactly "collection"
- `lastUpdated` MUST be valid timestamp (Date.now())
- All `items` MUST have `isCollected=true`
- `count` MUST equal `items.size`

**Invariants**:
- A Pokemon cannot appear in both Collection and Wishlist simultaneously (FR-003, FR-004)
- Collection is persisted to storage on every modification
- Maximum 1025 items (one per Pokemon)

---

### Wishlist

Represents the user's desired Pokemon entries (not yet collected).

```typescript
interface Wishlist {
  // Metadata
  id: string;              // "wishlist" (singleton)
  lastUpdated: number;     // Timestamp of last modification (milliseconds)
  
  // Data
  items: Map<number, Pokemon>; // Pokemon ID → Pokemon mapping
  count: number;           // Convenience: number of wishlist items
}
```

**Validation Rules**:
- `id` MUST be exactly "wishlist"
- `lastUpdated` MUST be valid timestamp (Date.now())
- All `items` MUST have `isWishlisted=true` and `isCollected=false`
- `count` MUST equal `items.size`

**Invariants**:
- A Pokemon cannot appear in both Wishlist and Collection simultaneously (FR-003, FR-004)
- Wishlist is persisted to storage on every modification
- Maximum 1025 items (one per Pokemon)

---

### UserCollectionData (Persisted Root)

The complete user state persisted to localStorage.

```typescript
interface UserCollectionData {
  version: "1.0";          // Schema version for migrations
  createdAt: number;       // Initial account creation timestamp
  lastUpdated: number;     // Last modification timestamp
  
  collected: {
    [pokemonId: number]: {
      id: number;
      name: string;
      imageUrl: string;
      collectedAt: number; // When user marked as collected
    };
  };
  
  wishlisted: {
    [pokemonId: number]: {
      id: number;
      name: string;
      imageUrl: string;
      wishlistedAt: number; // When user added to wishlist
    };
  };
}
```

**Storage Key**: `"pokemon-collector:v1"`

**Persistence Contract**:
- Format: JSON (human-readable)
- Size: ~2-5 KB for typical user (1000 items)
- Encoding: UTF-8
- Backup: Browser localStorage automatically synced (no manual export needed currently)

---

## Derived Grids

Three computed grids derived from Pokemon collection state (FR-008, FR-009):

### Collected Grid

**Criteria**: `isCollected === true`
**Display**: All Pokemon with collected status
**Sorting**: By Pokemon index ascending (1-1025, FR-017)
**Max Items**: 1025
**Visual Indicator**: Badge/checkmark (FR-006)

### Wishlisted Grid

**Criteria**: `isWishlisted === true && isCollected === false`
**Display**: All Pokemon with wishlist status only
**Sorting**: By Pokemon index ascending (1-1025, FR-017)
**Max Items**: 1025
**Visual Indicator**: Distinct badge from collected (FR-007)

### Available Grid

**Criteria**: `isCollected === false && isWishlisted === false`
**Display**: All Pokemon NOT in collection or wishlist
**Sorting**: By Pokemon index ascending (1-1025, FR-017)
**Max Items**: 1025
**Visual Indicator**: No badge

---

## Search & Filtering

### Search by Index

**Input**: Integer 1-1025 or partial number (e.g., "25" matches 25, 125, 225, 250-259)
**Scope**: Searches across all three grids simultaneously
**Result**: Pokemon object if found, null if not
**Performance**: O(1) lookup using Map (FR-010, SC-006)

---

## Relationships & Constraints

```
┌─────────────┐     ┌─────────────┐
│ Collection  │     │  Wishlist   │
│   (sorted)  │     │   (sorted)  │
└──────┬──────┘     └──────┬──────┘
       │                   │
       │ contains          │ contains
       │                   │
       v                   v
    Pokemon <─────────── Pokemon
    (id, name,         (id, name,
     imageUrl,          imageUrl,
     isCollected=true) isWishlisted=true)
     
All remaining Pokemon → Available Grid
```

**Uniqueness Constraints**:
- Each Pokemon ID appears at most once across all collections/wishlists (natural consequence of Map keys)
- No duplicate entries

**Temporal Constraints**:
- `lastUpdated` timestamps track state changes
- Enables audit trails if needed (future feature)
- Supports optimistic UI updates (show change immediately, persist async)

---

## Migration Path

**Current Schema**: Version 1.0 (initial)

**Future Considerations**:
- Version 2.0: Add categories/tags to wishlist items
- Version 2.1: Add notes/acquisition URLs to collected items
- Version 3.0: Multi-user support with cloud backend

**Migration Strategy**:
- Check `version` field on load
- If version < current, run migration function
- Update version after successful migration
- Log migration for debugging

---

## Type Definitions (TypeScript)

```typescript
// Core Pokemon entity
type Pokemon = {
  readonly id: number;
  readonly name: string;
  readonly imageUrl: string;
  isCollected: boolean;
  isWishlisted: boolean;
};

// Collection snapshots
type Collection = {
  readonly id: "collection";
  lastUpdated: number;
  items: Map<number, Pokemon>;
  readonly count: number;
};

type Wishlist = {
  readonly id: "wishlist";
  lastUpdated: number;
  items: Map<number, Pokemon>;
  readonly count: number;
};

// Persisted state
type UserCollectionData = {
  readonly version: "1.0";
  createdAt: number;
  lastUpdated: number;
  collected: Record<number, PersistablePokemons>;
  wishlisted: Record<number, PersistablePokemons>;
};

type PersistablePokemons = {
  id: number;
  name: string;
  imageUrl: string;
  collectedAt?: number;
  wishlistedAt?: number;
};
```

---

## Summary

This data model provides:
- ✅ Clear entity definitions aligned with FR-001 through FR-020
- ✅ Validation rules preventing invalid states
- ✅ Atomic state transitions (FR-020)
- ✅ Efficient O(1) lookups and filtering
- ✅ Persistent storage schema ready for localStorage
- ✅ Migration path for future schema evolution
- ✅ TypeScript strict mode compatibility

