# Tasks: Preload All Pokemon Names

Feature: 005-preload-all-names

## Phase 1 — Setup

Goal: Establish versioned cache keys and registry scaffolding without altering UI behavior.

Independent Test Criteria:
- Names cache key format clearly defined and importable by services.
- Registry module compiles and exports planned API (no UI usage yet).

Implementation Tasks

- [X] T001 Create NameRegistry module at `/home/markus/workspace/pokemon-collector/src/services/nameRegistry.ts`
- [X] T002 Define cache key helpers in `/home/markus/workspace/pokemon-collector/src/utils/constants.ts` (e.g., `NAMES_CACHE_KEY_PREFIX`)
- [X] T003 [P] Add version import in `/home/markus/workspace/pokemon-collector/src/utils/version.ts` using `resolveJsonModule` to read `package.json`

## Phase 2 — Foundational

Goal: Implement preload, caching, completeness validation, and retry with backoff.

Independent Test Criteria:
- Given network offline, after 3 retries registry exposes `error` and `ready=false`.
- Given valid response, registry `ready=true` and `byId.size === MAX_POKEMON_INDEX`.
- Cached load path avoids network after first success until app version changes.

Implementation Tasks

- [X] T004 Implement `loadAllNamesWithCache()` in `/home/markus/workspace/pokemon-collector/src/services/nameRegistry.ts` (parse IDs from URLs, validate completeness, hydrate in-memory)
- [X] T005 Add retry with exponential backoff + jitter in `/home/markus/workspace/pokemon-collector/src/services/nameRegistry.ts`
- [X] T006 [P] Update `/home/markus/workspace/pokemon-collector/src/services/pokemonApi.ts` `getAllPokemonList()` to use single bulk request and surface errors (no silent empty array)
- [X] T007 [P] Add `isCompleteList()` validator in `/home/markus/workspace/pokemon-collector/src/services/nameRegistry.ts` to verify IDs 1..MAX without gaps
- [X] T008 Persist and read cache via localStorage in `/home/markus/workspace/pokemon-collector/src/services/nameRegistry.ts` (key `names.v<version>`)
- [X] T009 Expose `getName(id:number)`, `search(term:string)`, `ready:boolean`, `error:string|null` from `/home/markus/workspace/pokemon-collector/src/services/nameRegistry.ts`

## Phase 3 — User Story 1 (P1): Global Search

Story Goal: Users can search any Pokemon by name immediately after load, without scrolling.

Independent Test Criteria:
- After reload, entering "Mewtwo" yields a result before any scrolling.
- When registry not ready, search input is disabled and labeled "Loading names...".
- On 3 failed attempts, a blocking error is shown and app usage is prevented until retry.

Implementation Tasks

- [X] T010 [US1] Initialize names preload on app start in `/home/markus/workspace/pokemon-collector/src/components/App.tsx`
- [X] T011 [P] [US1] Wire search to `NameRegistry.search()` in `/home/markus/workspace/pokemon-collector/src/components/StickySearchBar.tsx`
- [X] T012 [US1] Disable search input until registry `ready` in `/home/markus/workspace/pokemon-collector/src/components/StickySearchBar.tsx` (label: "Loading names...")
- [X] T013 [US1] Show blocking error overlay on preload failure in `/home/markus/workspace/pokemon-collector/src/components/App.tsx`
- [X] T014 [P] [US1] Update `/home/markus/workspace/pokemon-collector/src/services/pokemonService.ts` to use `NameRegistry.search()` results for filtering

## Phase 4 — User Story 2 (P2): Correct Names on Placeholders

Story Goal: Cards and lists show correct Pokemon names from the preloaded registry even when details (images/types) are still loading.

Independent Test Criteria:
- While details load, visible cards show the correct name (e.g., "Bulbasaur" not "Pokemon 1").
- Collections and wishlist lists render correct names immediately from registry.

Implementation Tasks

- [X] T015 [US2] Use `NameRegistry.getName(id)` for card titles in `/home/markus/workspace/pokemon-collector/src/components/PokemonCard.tsx`
- [X] T016 [P] [US2] Ensure `CollectionList.tsx` uses registry names in `/home/markus/workspace/pokemon-collector/src/components/CollectionList.tsx`
- [X] T017 [P] [US2] Ensure `WishlistList.tsx` uses registry names in `/home/markus/workspace/pokemon-collector/src/components/WishlistList.tsx`
- [X] T018 [US2] Ensure `AvailableGrid.tsx` renders registry names for unloaded items in `/home/markus/workspace/pokemon-collector/src/components/AvailableGrid.tsx`

## Final Phase — Polish & Cross-Cutting

Goal: Solidify resilience, UX, and performance with minor enhancements.

Independent Test Criteria:
- Search performance meets debounce + render SLA (< 350ms perceived update time).
- Error messages are actionable and consistent with app tone.

Implementation Tasks

- [X] T019 Add simple dev telemetry logs (duration, retries) behind `import.meta.env.DEV` in `/home/markus/workspace/pokemon-collector/src/services/nameRegistry.ts`
- [X] T020 [P] Ensure a11y for disabled state and error overlay in `/home/markus/workspace/pokemon-collector/src/components/StickySearchBar.tsx` and `/home/markus/workspace/pokemon-collector/src/components/App.tsx`

---

## Dependencies

- Story Order: US1 → US2
- Blocking prerequisites: Phase 1 → Phase 2 must complete before US1.

## Parallel Execution Examples

- Within Foundational: T006 and T007 can run in parallel (different files, independent).
- Within US1: T011 and T014 can run in parallel after T010 is in place.
- Within US2: T016 and T017 can run in parallel once T015 is available.

## Implementation Strategy

- MVP: Complete Phase 1, Phase 2, and US1 (T001–T014). This enables global search using preloaded names and fulfills the primary requirement.
- Incremental: Ship US2 (T015–T018) to improve placeholder naming; then apply polish tasks T019–T020.
