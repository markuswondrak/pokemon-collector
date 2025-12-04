# Phase 0 Research: Preload All Pokemon Names

## Decisions

### Decision: Bulk fetch via single request
- Rationale: Minimizes latency and complexity; PokeAPI supports `limit` query param.
- Alternatives considered:
  - Paginated fetch (offset/limit): Rejected due to multiple round trips and failure complexity.
  - Per-Pokemon fetch: Rejected due to 1000+ requests and rate limits.

### Decision: Use high `limit` (20000) and validate completeness
- Rationale: Future-proof against new generations while enforcing exact ID coverage 1..MAX.
- Alternatives considered:
  - Use `limit=MAX_POKEMON_INDEX`: Works today but brittle to future growth; still acceptable but less flexible.

### Decision: Extract IDs from resource URLs
- Rationale: PokeAPI `pokemon` list returns `{name, url}`; the numeric ID is the last path segment.
- Alternatives considered:
  - Secondary fetch to resolve each ID: Rejected for performance and rate limits.

### Decision: Cache in localStorage keyed by app version
- Rationale: Persist indefinitely and invalidate only on app version change; simple and robust.
- Alternatives considered:
  - Time-based expiry: Rejected; spec requires indefinite cache.
  - IndexedDB: Overkill for small payload (~20–30KB), added complexity.

### Decision: App version from package.json `version`
- Rationale: Standard practice; ensures deployment-driven invalidation.
- Alternatives considered:
  - Hardcoded constant: Error-prone; requires manual sync.
  - Build-time env var: Viable but adds extra configuration.

### Decision: Retry policy with exponential backoff + jitter (3 attempts)
- Rationale: Reduces thundering herd and improves resilience.
- Policy: delays ≈ 500ms, 1000ms, 2000ms plus ±20% jitter.
- Alternatives considered:
  - Fixed delay (e.g., 1s x3): Simpler but less network friendly.

### Decision: Treat partial results as failure
- Rationale: Ensures search and placeholders are correct for all IDs.
- Validation: verify result count ≥ `MAX_POKEMON_INDEX` and that IDs set covers all from 1..MAX without gaps.
- Alternatives considered:
  - Accept best-effort subset: Rejected per spec FR-008.

### Decision: NameRegistry shape and API
- Rationale: Efficient lookup and small memory footprint.
- Shape: `{ byId: Map<number,string>, all: Array<{id:number,name:string}> }` stored in memory; localStorage stores `[{id,name}]`.
- Alternatives considered:
  - Object map only: OK, but array helpful for search ordering.

### Decision: UI readiness & failure states
- Rationale: Non-blocking UI per spec; search disabled until ready.
- Behavior: Search input disabled with label "Loading names..."; on 3 failures, show blocking error with retry guidance.
- Alternatives considered:
  - Fully block UI until names loaded: Rejected per FR-007.

## Implementation Notes

- Endpoint: `GET https://pokeapi.co/api/v2/pokemon?limit=<large>`
- ID extraction regex: `/\/pokemon\/(\d+)\/?$/`
- Storage keys: `names.v<APP_VERSION>`; companion key `names.meta.v<APP_VERSION>` optional for diagnostics
- Package version: read from `package.json` at build time or embed via Vite `define` to `import.meta.env`.
- Size: ~1025 entries; JSON ≈ 20-30KB; well within localStorage limits.
- Telemetry (optional): log fetch duration and retry count to console in dev.
