# Data Model: Global Data Index

## Entities

### PokemonRef
Lightweight reference to a Pokemon.

| Field | Type | Description |
|-------|------|-------------|
| id | number | Unique identifier (1-1025) |
| name | string | Pokemon name (lowercase) |
| imageUrl | string | Derived URL to official artwork |

## Storage Schema

### LocalStorage Keys

- `pokemon-collector:index`: `PokemonRef[]`
- `pokemon-collector:index-timestamp`: `number` (Epoch ms)
