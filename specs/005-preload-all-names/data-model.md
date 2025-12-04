# Data Model: Preload All Pokemon Names

## Entities

### PokemonReference
- id: number (1..MAX_POKEMON_INDEX)
- name: string (API lowercase; UI may display capitalized)

Validation:
- `1 <= id <= MAX_POKEMON_INDEX`
- `name` non-empty ASCII string

### NameRegistry (in-memory)
- byId: `Map<number, string>`
- all: `Array<{ id: number; name: string }>` (ordered by id asc)
- ready: `boolean` (true when registry loaded)
- error: `string | null` (blocking message after retries exhausted)

Operations:
- `getName(id: number): string | undefined`
- `search(term: string): Array<{ id: number; name: string }>` (case-insensitive, substring)

### NamesCacheRecord (localStorage payload)
- version: string (from package.json `version`)
- items: `Array<{ id: number; name: string }>`
- fetchedAt: number (epoch ms)

Storage:
- Key: `names.v<version>`

## Derived/Parsing Rules
- Extract `id` from PokeAPI item `url` using `/\\/pokemon\\/(\\d+)\\/?$/`.
- Capitalization for display: first letter uppercase (e.g., `bulbasaur` → `Bulbasaur`).

## State Model
- `loading` → `ready` on successful fetch/cache hydrate
- `loading` → `retrying` (internal) → `ready | error` after up to 3 attempts
- `error` displays blocking message; search remains disabled

## Error Conditions
- Network error (Axios)
- Partial list (missing IDs or count < MAX)
- Corrupt cache (JSON parse error or failed validation)

## Non-Functional Requirements
- Time to ready < 2s on typical 4G (with cache: ~0ms)
- LocalStorage size: < 100KB (actual ~30KB)
