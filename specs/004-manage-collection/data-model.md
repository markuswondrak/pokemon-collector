# Data Model: Manage Collection

## Entities

### UserCollection
Represents the user's personal collection status.

| Field | Type | Description |
|-------|------|-------------|
| `caught` | `number[]` | List of Pokemon IDs that have been caught. |
| `wishlist` | `number[]` | List of Pokemon IDs that are in the wishlist. |

**Storage Key**: `pokemon-collector:collection`

### PokemonState
Represents the derived state of a single Pokemon relative to the user.

| State | Description |
|-------|-------------|
| `Available` | Not in `caught` AND not in `wishlist`. |
| `Caught` | Present in `caught` list. |
| `Wishlisted` | Present in `wishlist` list. |

## State Transitions

| From | To | Action | Side Effects |
|------|----|--------|--------------|
| `Available` | `Caught` | User clicks "Catch" | Add ID to `caught`. |
| `Available` | `Wishlisted` | User clicks "Wishlist" | Add ID to `wishlist`. |
| `Wishlisted` | `Caught` | User clicks "Catch" | Add ID to `caught`, Remove ID from `wishlist`. |
| `Wishlisted` | `Available` | User clicks "Wishlist" (toggle) | Remove ID from `wishlist`. |
| `Caught` | `Available` | User clicks "Catch" (toggle) | Remove ID from `caught`. |
| `Caught` | `Wishlisted` | N/A | **Forbidden**. Must uncatch first. |

## Validation Rules

1. **Uniqueness**: IDs in `caught` and `wishlist` must be unique (no duplicates).
2. **Exclusivity**: An ID cannot exist in both `caught` and `wishlist` simultaneously.
3. **Integrity**: IDs must correspond to valid Pokemon IDs (1-1025).
