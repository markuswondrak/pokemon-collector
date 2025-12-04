# Quickstart: Preload All Pokemon Names

## Prerequisites
- Node.js 18+, pnpm 8+

## Install
```bash
pnpm install
```

## Run Dev
```bash
pnpm dev
```

- App loads immediately.
- Search input is disabled with label "Loading names..." until names are ready.
- After preload completes, search is enabled.

## Validate User Stories

- US1 (Global Search): Without scrolling, type a high-index name (e.g., "Mewtwo"). Result should appear immediately.
- US2 (Correct Names on Placeholders): While images/details load, cards show the correct name from the preloaded registry.

## Tests (during implementation)

- Run isolated tests per constitution (≤4 threads):
```bash
pnpm test --run -- --threads --maxThreads=4 tests/integration/search.us4.test.jsx
pnpm test --run -- --threads --maxThreads=4 tests/integration/search-performance.test.jsx
pnpm test --run -- --threads --maxThreads=4 tests/integration/us3-three-grids.test.jsx
```

- After implementation, run broader checks:
```bash
pnpm test --run -- --threads --maxThreads=4
```

## Notes
- Cache persists indefinitely; invalidated only when app version changes.
- On 3 consecutive failures, a blocking error is shown and app usage is prevented until retry.
