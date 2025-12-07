# Tasks: Global Data Index (Preload)

**Feature**: Global Data Index (Preload)
**Status**: Todo

## Phase 1: Setup

**Goal**: Initialize project structure and dependencies.

- [x] T001 Create project directory structure (`src/services/storage`, `src/services/api`, `src/hooks`, `src/types`)
- [x] T002 [P] Verify and install dependencies (Chakra UI, React, Vite) in `package.json`

## Phase 2: Foundational

**Goal**: Establish core services and types needed for data fetching and storage.

- [x] T003 Define shared types `PokemonRef` and `StorageSchema` in `src/types/index.ts`
- [x] T004 [P] Implement LocalStorage wrapper with `getItem`, `setItem` (handling quota errors) in `src/services/storage/localStorage.ts`
- [x] T005 [P] Implement PokeAPI client with `fetchPokemonList` (limit=10000) and data mapping in `src/services/api/pokeApi.ts`

## Phase 3: User Story 1 - First App Launch (P1)

**Goal**: App fetches and stores data on first launch.
**Independent Test**: Clear browser storage, open the app, and verify that data is fetched and stored.

- [x] T006 [US1] Create `usePokemonIndex` hook with state management (loading, data, error) in `src/hooks/usePokemonIndex.ts`
- [x] T007 [US1] Integrate `pokeApi` service to fetch data in `src/hooks/usePokemonIndex.ts`
- [x] T008 [US1] Integrate `localStorage` service to store fetched data in `src/hooks/usePokemonIndex.ts`
- [x] T009 [US1] Implement loading UI with Chakra UI `Spinner` or `Progress` in `src/App.tsx`

## Phase 4: User Story 2 - Subsequent App Launch (P1)

**Goal**: App loads from cache without network requests.
**Independent Test**: Open the app after data has been cached and verify no network request is made for the index.

- [x] T010 [US2] Implement cache check logic (read from storage on init) in `src/hooks/usePokemonIndex.ts`
- [x] T011 [US2] Implement TTL (24h) validation logic (compare timestamp) in `src/hooks/usePokemonIndex.ts`

## Phase 5: User Story 3 - Network Error Handling (P2)

**Goal**: App handles network failures and storage limits gracefully.
**Independent Test**: Simulate a network failure during the initial fetch and verify the retry behavior.

- [x] T012 [US3] Implement retry logic (1 attempt, 3s delay) in `src/services/api/pokeApi.ts`
- [x] T013 [US3] Implement `QuotaExceededError` handling in `src/services/storage/localStorage.ts` and propagate to UI
- [x] T014 [US3] Implement Error UI with manual "Retry" button in `src/App.tsx`

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T015 Verify strict mode compliance in `src/main.tsx`
- [ ] T016 Verify performance (load time < 200ms) using DevTools

## Dependencies

- **Foundational** blocks **US1**
- **US1** blocks **US2** and **US3**
- **US2** and **US3** can be implemented in parallel

## Parallel Execution Examples

- **Foundational**: T004 (Storage) and T005 (API) can be implemented simultaneously.
- **US3**: T012 (Retry logic) and T014 (UI) can be implemented simultaneously by mocking the error state.

## Implementation Strategy

1.  **MVP (US1)**: Focus on fetching and displaying data. Ignore caching and error handling initially.
2.  **Performance (US2)**: Add caching layer to avoid redundant requests.
3.  **Robustness (US3)**: Add error handling and retries for edge cases.
