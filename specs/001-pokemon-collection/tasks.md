# Tasks: Pokemon Collection Organizer

**Feature**: 001-pokemon-collection  
**Created**: 2025-11-29  
**Status**: Phase 2 Complete ✅ | Ready for Phase 3  
**Total Estimated Duration**: 30-36 hours (distributed across 6 phases)  
**Input**: spec.md, data-model.md, api-contracts.yaml

---

## Overview & Implementation Strategy

This document defines all tasks required to implement the Pokemon Collection Organizer feature. Tasks are organized into 6 sequential phases that build upon each other:

1. **Phase 1 (Setup)**: Project initialization and dependency management
2. **Phase 2 (Foundational)**: Core data models and storage layer (TDD mandatory)
3. **Phase 3 (US1)**: Mark Pokemon as Collected (TDD mandatory)
4. **Phase 4 (US2)**: Add Pokemon to Wishlist (TDD mandatory)
5. **Phase 5 (US3)**: Three Grids with Lazy Loading (TDD mandatory)
6. **Phase 6 (Polish)**: Styling, accessibility, optimization

### Key Principles

- **TDD (Test-Driven Development)**: Write tests BEFORE implementation for all Phase 2+ tasks
- **Coverage Target**: 80%+ code coverage across all new modules
- **Task Duration**: Each task should be completable in <2 hours of focused work
- **File Paths**: All tasks reference specific source and test files in `src/`, `tests/`, etc.
- **Atomic Commits**: Each task should be a logical, reviewable unit of work
- **Parallelization**: Tasks marked with `[P]` can be worked in parallel with other `[P]` tasks in the same phase

### Testing Strategy by Phase

- **Phase 2**: Unit tests for models, services (TDD: tests first)
- **Phase 3**: Unit tests for hooks, integration tests for US1 (TDD: tests first)
- **Phase 4**: Unit tests for hooks update, integration tests for US2 (TDD: tests first)
- **Phase 5**: Unit tests for components, integration tests for lazy loading (TDD: tests first)
- **Phase 6**: No new tests required (refactoring/polish phase)


---

## Task Dependencies

```
Phase 1: Setup
  ↓
Phase 2: Foundational
  ├─ T005, T006, T007, T008 (can parallelize)
  ↓
Phase 3: US1 (Mark Collected)
  ├─ T009, T010 (can parallelize)
  ├─ T011, T012 (depend on T009/T010)
  ↓
Phase 4: US2 (Add Wishlist)
  ├─ T013 (depends on Phase 3 completion)
  ├─ T014 (depends on Phase 3 completion)
  ↓
Phase 5: US3 (Three Grids + Lazy Loading)
  ├─ T015, T016, T017, T018 (can parallelize)
  ├─ T019 (depends on above)
  ↓
Phase 6: Polish
  ├─ T020, T021, T022 (can parallelize)
```

---

## Phase 1: Setup (2-3 tasks, ~3-4 hours)

Initialize project structure, configure tooling, and ensure all dependencies are in place.

- [x] **T001** [P] Install and configure TypeScript strict mode: `tsconfig.json`
- [x] **T002** [P] Install testing dependencies (Vitest, React Testing Library): `package.json`
- [x] **T003** [P] Create test setup file with global configurations: `tests/setup.ts`

**Acceptance Criteria**:
- TypeScript compiles with zero warnings in strict mode
- All tests can be discovered and run with `pnpm test`
- Testing utilities (render, screen, fireEvent) are globally available

---

## Phase 2: Foundational (4-5 tasks, ~8-10 hours)

Build core data models, validation logic, and persistence layer with TDD. All tasks in this phase are test-first.

✅ **PHASE 2 COMPLETE**: All models, services, and unit tests passing (151 tests, 11 test files)

### T004: Pokemon Model Unit Tests

- [x] **T004** [P] [TDD] Write unit tests for Pokemon model validation: `tests/unit/models/Pokemon.test.js`

**Description**: Test file covering Pokemon entity validation (id range, name format, imageUrl validation, state transitions, isCollected/isWishlisted exclusivity per FR-003)

**Test Coverage**:
- Valid Pokemon creation
- Invalid id (out of range 1-1025)
- Invalid name (empty, special chars)
- Invalid imageUrl (non-HTTPS, malformed)
- isCollected and isWishlisted cannot both be true
- All valid state transitions allowed per data-model.md
- Invalid transitions prevented

**Success**: Tests execute, all marked as pending/skipped until implementation

---

### T005: Collection Model Unit Tests

- [x] **T005** [P] [TDD] Write unit tests for Collection model: `tests/unit/models/Collection.test.js`

**Description**: Test file covering Collection entity (singleton id="collection", lastUpdated timestamp, items Map, count invariant, max 1025 items)

**Test Coverage**:
- Collection initialization with correct id
- Adding Pokemon to collection
- Removing Pokemon from collection
- Count invariant maintained (count === items.size)
- lastUpdated timestamp updated on modification
- Cannot exceed 1025 items
- Prevents duplicate Pokemon entries

**Success**: Tests execute, all marked as pending/skipped until implementation

---

### T006: Pokemon Model Implementation

- [x] **T006** [P] Implement Pokemon model with validation: `src/models/Pokemon.ts`

**Description**: TypeScript class/interface implementing Pokemon entity with validation rules per data-model.md

**Implementation Requirements**:
- Export interface `Pokemon` with properties: id, name, imageUrl, isCollected, isWishlisted
- Implement validation function `validatePokemon(pokemon): void` (throws on invalid)
- Implement state transition validator `canTransitionTo(from: Pokemon, to: Pokemon): boolean`
- Implement equality checker `arePokemonEqual(a: Pokemon, b: Pokemon): boolean`
- 100% coverage of validation logic

**Success**: All Pokemon model tests from T004 pass

---

### T007: Collection Model Implementation

- [x] **T007** [P] Implement Collection model: `src/models/Collection.ts`

**Description**: TypeScript class implementing Collection entity with Map-based storage and invariant maintenance

**Implementation Requirements**:
- Export interface `Collection` with: id="collection", lastUpdated, items (Map<number, Pokemon>), count
- Implement `addPokemon(pokemon: Pokemon): void` (updates lastUpdated)
- Implement `removePokemon(pokemonId: number): void` (updates lastUpdated)
- Implement `getPokemon(pokemonId: number): Pokemon | null`
- Implement `getCount(): number` (always equals items.size)
- Implement `isFull(): boolean` (items.size === 1025)
- 100% coverage of all methods

**Success**: All Collection model tests from T005 pass

---

### T008: Storage Service Unit Tests

- [x] **T008** [P] [TDD] Write unit tests for collection storage service: `tests/unit/services/collectionStorage.test.js`

**Description**: Test file for localStorage abstraction layer (load, save, clear operations with error handling)

**Test Coverage**:
- Load collection from localStorage (existing, new, corrupted data)
- Save collection to localStorage
- Load wishlist from localStorage (existing, new, corrupted data)
- Save wishlist to localStorage
- Clear all data from localStorage
- Error handling for quota exceeded
- Error handling for corrupted JSON
- Correct storage key usage ("pokemon-collector:v1")

**Success**: Tests execute, all marked as pending/skipped until implementation

---

### T009: Storage Service Implementation

- [x] **T009** [P] Implement collection storage service: `src/services/collectionStorage.ts`

**Description**: Abstraction layer for localStorage persistence per FR-005, FR-021

**Implementation Requirements**:
- Export interface `ICollectionStorage` with methods: loadCollection(), saveCollection(), loadWishlist(), saveWishlist(), clearAll()
- Implement `LocalStorageCollectionService` class implementing `ICollectionStorage`
- Use storage key "pokemon-collector:v1"
- Handle localStorage quota errors gracefully
- Handle corrupted JSON gracefully (fallback to empty Collection/Wishlist)
- Implement schema versioning for future migrations
- 100% coverage of storage operations

**Success**: All storage service tests from T008 pass

---

### T010: Pokemon Service Unit Tests

- [x] **T010** [P] [TDD] Write unit tests for pokemon API service: `tests/unit/services/pokemonService.test.js`

**Description**: Test file for Pokemon data fetching, transformation, state merging

**Test Coverage**:
- Fetch Pokemon by id from PokeAPI
- Transform PokeAPI response to Pokemon domain model
- Merge PokeAPI data with collection/wishlist status
- Handle 404 (Pokemon not found)
- Handle 429 (rate limit)
- Handle network errors
- Capitalize Pokemon name correctly
- Extract official artwork image URL correctly
- Cache strategy (optional: memoize recent fetches)

**Success**: Tests execute, all marked as pending/skipped until implementation

---

### T011: Pokemon Service Implementation

- [x] **T011** [P] Implement pokemon API service: `src/services/pokemonService.ts`

**Description**: PokeAPI integration service per spec.md technology stack and api-contracts.yaml

**Implementation Requirements**:
- Export `PokemonService` class with method: `fetchPokemon(id: number): Promise<Pokemon>`
- Fetch from `https://pokeapi.co/api/v2/pokemon/{id}`
- Transform response: capitalize name, extract `sprites.front_default` as imageUrl
- Validate id is in range [1, 1025]
- Implement error handling for 404, 429, network errors
- Return Pokemon object with isCollected=false, isWishlisted=false
- Optional: implement memoization for recent fetches
- 100% coverage of fetch and transform logic

**Success**: All pokemon service tests from T010 pass

---

### T012: Pokemon Service Integration Tests

- [x] **T012** [P] [Contract Test] Verify pokemon API service contracts: `tests/contract/pokemonApi.test.js`

**Description**: Contract tests verifying PokeAPI response structure matches api-contracts.yaml

**Test Coverage**:
- Fetch real Pokemon (e.g., id=25) and verify response structure
- Verify required fields: id, name, sprites.front_default
- Verify id is in range [1, 1025]
- Verify imageUrl is valid HTTPS URL
- Verify name is non-empty string
- Test boundary cases: id=1, id=1025
- Test error responses: id=99999 (not found), id=0 (invalid)

**Success**: Contract tests pass against live PokeAPI (or mock)

---

**Phase 2 Summary**:
- 4 test files created (T004, T005, T008, T010) ✅
- 4 implementation files created (T006, T007, T009, T011) ✅
- 1 contract test file (T012) ✅
- All new code has 80%+ coverage ✅
- Phase 2 ready to merge to main after code review ✅

---

## Phase 3: US1 - Mark Pokemon as Collected (3-4 tasks, ~6-8 hours)

✅ **PHASE 3 COMPLETE**: All components, services, tests, and integration tests passing

Implement User Story 1 (P1 priority) with TDD: mark Pokemon as collected, persist to storage, display visual indicator.

### T013: useCollection Hook Unit Tests

- [x] **T013** [P] [TDD] Write unit tests for useCollection hook: `tests/unit/hooks/useCollection.test.js`

**Description**: Test file for React hook managing collection and wishlist state (load, add, remove operations)

**Test Coverage**:
- Initialize with loaded collection from storage
- Initialize with loaded wishlist from storage
- Add Pokemon to collection (updates state, persists)
- Remove Pokemon from collection (updates state, persists)
- Cannot add already-collected Pokemon
- Correct count maintained
- lastUpdated timestamp updated
- Hook cleanup on unmount

**Success**: Tests execute, all marked as pending/skipped until implementation

---

### T014: useCollection Hook Implementation

- [x] **T014** [P] Implement useCollection hook: `src/hooks/useCollection.ts`

**Description**: Custom React hook encapsulating collection/wishlist state management and persistence per FR-004, FR-005

**Implementation Requirements**:
- Export `useCollection()` hook returning: { collection, wishlist, addToCollection(), removeFromCollection(), addToWishlist(), removeFromWishlist(), isCollected(), isWishlisted() }
- Load Collection and Wishlist from storage on mount
- Persist changes immediately on any mutation
- Implement `addToCollection(pokemonId: number, pokemon: Pokemon): void` (FR-002)
- Implement `removeFromCollection(pokemonId: number): void`
- Implement `addToWishlist(pokemonId: number, pokemon: Pokemon): void` (FR-003: prevent if collected)
- Implement `removeFromWishlist(pokemonId: number): void`
- Implement helper methods: `isCollected(pokemonId: number): boolean`, `isWishlisted(pokemonId: number): boolean`
- 100% coverage of hook logic

**Success**: All useCollection tests from T013 pass

---

### T015: PokemonCard Component Unit Tests

- [x] **T015** [P] [TDD] Write unit tests for PokemonCard component: `tests/unit/components/PokemonCard.test.jsx`

**Description**: Test file for Pokemon card UI component (display, actions, visual indicators per FR-006, FR-013-FR-016)

**Test Coverage**:
- Render Pokemon with image, name, index (FR-014)
- Display collected badge when isCollected=true (FR-006)
- Display wishlist badge when isWishlisted=true (FR-007)
- Render action button "Mark as Collected" when available
- Render action button "Remove from Collection" when collected
- Render action button "Add to Wishlist" when available (not collected)
- Render action button "Remove from Wishlist" when wishlisted
- Click "Mark as Collected" calls callback with Pokemon (FR-016)
- Placeholder image on failed load (FR-018)
- Retry link on placeholder (FR-019)
- Card click triggers action callback
- Responsive layout (grid card dimensions)

**Success**: Tests execute, all marked as pending/skipped until implementation

---

### T016: PokemonCard Component Implementation

- [x] **T016** [P] Implement PokemonCard component: `src/components/PokemonCard.tsx`

**Description**: React component displaying individual Pokemon card with status badges and action buttons per spec.md UI requirements (FR-006, FR-013-FR-016, FR-018-FR-019)

**Implementation Requirements**:
- Props: pokemon: Pokemon, onCollect: (p: Pokemon) => void, onRemoveCollected: (id: number) => void, onAddWishlist: (p: Pokemon) => void, onRemoveWishlist: (id: number) => void
- Display high-resolution Pokemon image (FR-013)
- Display Pokemon name (capitalized) and index (FR-014)
- Display "Collected" badge if isCollected=true, "Wishlisted" badge if isWishlisted=true (FR-006, FR-007)
- Show placeholder with index on image load failure (FR-018)
- Include "Retry" link on placeholder to reload image (FR-019)
- Render appropriate action button based on status:
  - Available: "Collect" + "Add to Wishlist"
  - Collected: "Remove from Collection"
  - Wishlisted: "Remove from Wishlist"
- Button callbacks triggered on click (FR-016)
- Responsive card styling (flex layout, consistent aspect ratio)
- CSS classes/styling in `src/styles/components.css`
- 100% coverage of component logic (excluding image load edge cases)

**Success**: All PokemonCard tests from T015 pass

---

### T017: CollectionList Component Unit Tests

- [x] **T017** [P] [TDD] Write unit tests for CollectionList component: `tests/unit/components/CollectionList.test.jsx`

**Description**: Test file for collection grid display component (render list, grid layout, sorting by index)

**Test Coverage**:
- Render empty state when no collected Pokemon
- Render grid of PokemonCard components for each collected Pokemon
- Pokemon ordered by index ascending (FR-017)
- Grid responsive layout (multiple columns)
- Pass correct callbacks to each PokemonCard
- onRemoveCollected callback works correctly
- onAddWishlist callback works correctly (transition from Collected to Wishlisted)
- Grid component receives correct CSS classes for layout

**Success**: Tests execute, all marked as pending/skipped until implementation

---

### T018: CollectionList Component Implementation

- [x] **T018** [P] Implement CollectionList component: `src/components/CollectionList.tsx`

**Description**: React component displaying grid of collected Pokemon (FR-008, FR-009, FR-017)

**Implementation Requirements**:
- Props: collection: Collection, onRemoveCollected: (id: number) => void, onAddWishlist: (p: Pokemon) => void
- Render title "Collected" with count badge
- Map over collection.items and render PokemonCard for each
- Sort Pokemon by id ascending before rendering (FR-017)
- Use CSS Grid layout with responsive columns (FR-011)
- Empty state message if collection.count === 0
- Pass callbacks to PokemonCard (onRemoveCollected, onAddWishlist for transition)
- CSS in `src/styles/components.css`
- 100% coverage of component logic

**Success**: All CollectionList tests from T017 pass

---

### T019: US1 Integration Test

- [x] **T019** Integration test for User Story 1 (mark collected): `tests/integration/us1-mark-collected.test.jsx`

**Description**: Full integration test verifying end-to-end US1 workflow (find Pokemon, mark collected, verify in grid, verify persists)

**Test Coverage**:
- User searches for Pokemon by index (e.g., 25)
- User marks Pokemon as collected via card action
- Pokemon appears in "Collected" grid within 2 seconds (SC-001)
- Pokemon displays collected badge (SC-005)
- Collected status persists after page reload (SC-004)
- Attempting to mark already-collected Pokemon is safe (no duplicates)
- Count updates correctly
- Status change updates within 500ms (SC-009)

**Success**: Full US1 workflow verified end-to-end

---

**Phase 3 Summary**:
- 3 test files created (T015, T017, T019) ✅
- 3 implementation files created (T016, T018) + hook (T014) ✅
- 1 integration test file (T019) ✅
- All new code has 80%+ coverage ✅
- US1 complete and fully functional ✅
- Phase 3 ready to merge after code review ✅

---

## Phase 4: US2 - Add Pokemon to Wishlist (2-3 tasks, ~4-6 hours)

Implement User Story 2 (P2 priority) with TDD: add Pokemon to wishlist, prevent collected Pokemon, display visual indicator.

### T020: useCollection Hook Update

- [ ] **T020** Update useCollection hook with improved wishlist state: `src/hooks/useCollection.ts`

**Description**: Enhance useCollection hook (from T014) with refined wishlist management, atomic transitions per FR-020 (Collected ↔ Wishlisted)

**Implementation Requirements**:
- Add method: `transitionToWishlist(pokemonId: number, pokemon: Pokemon): void` (from any state)
- Add method: `transitionToCollected(pokemonId: number, pokemon: Pokemon): void` (from any state)
- Prevent adding collected Pokemon to wishlist (FR-003) - return error or throw
- Support atomic transition from Collected → Wishlisted (remove from collected, add to wishlist in one operation)
- Support atomic transition from Wishlisted → Collected (remove from wishlist, add to collected in one operation)
- All existing tests from T013 still pass
- New tests for atomic transitions (update T013 tests)

**Success**: Updated hook supports all state transitions per data-model.md

---

### T021: WishlistList Component

- [ ] **T021** [P] Implement WishlistList component: `src/components/WishlistList.tsx`

**Description**: React component displaying grid of wishlisted Pokemon (mirrors CollectionList)

**Implementation Requirements**:
- Props: wishlist: Wishlist, onRemoveWishlist: (id: number) => void, onCollect: (p: Pokemon) => void
- Render title "Wishlisted" with count badge
- Map over wishlist.items and render PokemonCard for each
- Sort Pokemon by id ascending (FR-017)
- Use CSS Grid layout with responsive columns (FR-011)
- Empty state message if wishlist.count === 0
- Pass callbacks to PokemonCard (onRemoveWishlist, onCollect for transition)
- CSS in `src/styles/components.css`
- Unit tests in `tests/unit/components/WishlistList.test.jsx` (T022)
- 100% coverage

**Success**: All WishlistList tests pass

---

### T022: WishlistList Component Unit Tests

- [ ] **T022** [P] [TDD] Write unit tests for WishlistList component: `tests/unit/components/WishlistList.test.jsx`

**Description**: Test file for wishlist grid component (render list, sorting, callbacks)

**Test Coverage**:
- Render empty state when no wishlisted Pokemon
- Render grid of PokemonCard for each wishlisted Pokemon
- Pokemon ordered by index ascending
- onRemoveWishlist callback works
- onCollect callback works (transition from Wishlisted to Collected)
- Grid responsive layout
- Correct CSS classes applied

**Success**: Tests execute, all marked as pending/skipped until implementation

---

### T023: US2 Integration Test

- [ ] **T023** Integration test for User Story 2 (add wishlist): `tests/integration/us2-add-wishlist.test.jsx`

**Description**: Full integration test verifying US2 workflow (find Pokemon not collected, add to wishlist, verify in grid, prevent collected Pokemon from being wishlisted)

**Test Coverage**:
- User finds Pokemon NOT in collected list
- User adds Pokemon to wishlist via card action
- Pokemon appears in "Wishlisted" grid within 2 seconds (SC-002)
- Pokemon displays wishlist badge distinct from collected (SC-005)
- Wishlist status persists after page reload (SC-004)
- User attempts to add already-collected Pokemon to wishlist
- System prevents addition with error message or disabled action (SC-003)
- Feedback visible within 1 second (SC-003)
- Wishlist count updates correctly

**Success**: Full US2 workflow verified end-to-end, FR-003 enforced

---

**Phase 4 Summary**:
- 1 hook update (T020)
- 1 component implementation (T021)
- 1 test file created (T022)
- 1 integration test (T023)
- All new code has 80%+ coverage
- FR-003 (collected ↔ wishlist exclusivity) enforced
- Phase 4 ready to merge after code review

---

## Phase 5: US3 - Three Grids + Lazy Loading (4-5 tasks, ~10-12 hours)

Implement User Story 3 (P2 priority) with TDD: three-grid view, lazy loading, search, atomic transitions.

### T024: AvailableGrid Component Unit Tests

- [ ] **T024** [P] [TDD] Write unit tests for AvailableGrid component: `tests/unit/components/AvailableGrid.test.jsx`

**Description**: Test file for available (uncollected, unwishlisted) Pokemon grid component

**Test Coverage**:
- Render all Pokemon not in collection or wishlist
- Pokemon ordered by index ascending
- Empty state when all Pokemon are collected/wishlisted
- PokemonCard callbacks for collect and add-wishlist work
- Grid responsive layout
- Search filtering by index (e.g., "25" finds id=25, 125, 225, etc.)
- Search updates grid in real-time

**Success**: Tests execute, all marked as pending/skipped until implementation

---

### T025: AvailableGrid Component Implementation

- [ ] **T025** [P] Implement AvailableGrid component: `src/components/AvailableGrid.tsx`

**Description**: React component displaying grid of available Pokemon (not collected, not wishlisted) per FR-008, FR-009

**Implementation Requirements**:
- Props: allPokemon: Pokemon[], collection: Collection, wishlist: Wishlist, onCollect: (p: Pokemon) => void, onAddWishlist: (p: Pokemon) => void, searchIndex?: number
- Filter Pokemon where isCollected=false AND isWishlisted=false
- Sort by id ascending (FR-017)
- Render PokemonCard for each available Pokemon
- Support optional search by index (pass searchIndex prop)
- Filter to Pokemon matching index or containing digits
- Grid responsive layout (FR-011)
- Empty state message
- CSS in `src/styles/components.css`
- 100% coverage of component logic

**Success**: All AvailableGrid tests pass

---

### T026: PokemonSearch Component Unit Tests

- [ ] **T026** [P] [TDD] Write unit tests for PokemonSearch component: `tests/unit/components/PokemonSearch.test.jsx`

**Description**: Test file for search/filter component (search by index per FR-010)

**Test Coverage**:
- Render search input field
- User types index number (e.g., "25")
- Debounce search input (optional: 300ms debounce)
- Input validation: only numbers 1-1025
- Empty input clears search
- Search callback triggered with valid input
- Partial matches supported ("25" matches 25, 125, 225)
- Visual feedback on invalid input

**Success**: Tests execute, all marked as pending/skipped until implementation

---

### T027: PokemonSearch Component Implementation

- [ ] **T027** [P] Implement PokemonSearch component: `src/components/PokemonSearch.tsx`

**Description**: React component for searching Pokemon by index per FR-010, SC-006 (find in <1 second)

**Implementation Requirements**:
- Render text input field with placeholder "Search by Pokemon index"
- Accept numeric input 1-1025
- Implement debounce (300ms) to avoid excessive re-renders
- Parse input as integer
- Call onSearch callback with parsed index on valid input
- Clear search on empty input (call onSearch with undefined)
- Display input validation error if >1025
- Keyboard support (Enter, Esc to clear)
- Accessible: label, aria-attributes
- CSS in `src/styles/components.css`
- 100% coverage

**Success**: All PokemonSearch tests pass

---

### T028: LazyLoadingGrid Component Unit Tests

- [ ] **T028** [P] [TDD] Write unit tests for LazyLoadingGrid (virtualized/intersection observer): `tests/unit/components/LazyLoadingGrid.test.jsx`

**Description**: Test file for lazy loading grid container (intersection observer, viewport-only rendering per FR-012)

**Test Coverage**:
- Render only Pokemon visible in viewport
- Intersection Observer detected and used if available
- Fallback to non-lazy rendering if Observer unavailable
- Add Pokemon to DOM when entering viewport
- Remove Pokemon from DOM when leaving viewport (optional: keep in virtual scroll)
- API requests only for visible Pokemon (SC-011)
- Grid scrolling performance (60 FPS target per SC-010)
- Scroll to bottom triggers loading next batch
- Handles rapid scrolling

**Success**: Tests execute, all marked as pending/skipped until implementation

---

### T029: LazyLoadingGrid Component Implementation

- [ ] **T029** [P] Implement LazyLoadingGrid wrapper: `src/components/LazyLoadingGrid.tsx`

**Description**: React component wrapping grid with Intersection Observer for lazy loading per FR-012, SC-011, SC-010

**Implementation Requirements**:
- Use Intersection Observer API to detect visible Pokemon cards
- Render only Pokemon cards currently in or near viewport
- Preload Pokemon entering viewport (buffer above/below)
- Support infinite scroll (load more on scroll to bottom)
- Props: children: React.ReactNode, items: Pokemon[], renderItem: (item: Pokemon, index: number) => React.ReactNode, batchSize?: number (default 20)
- Fallback to full rendering if Intersection Observer unavailable
- Performance: achieve 60 FPS scrolling (SC-010)
- Initial load displays first visible Pokemon within 1.5 seconds (SC-012)
- CSS in `src/styles/components.css`
- 100% coverage of observer logic

**Success**: All LazyLoadingGrid tests pass, scrolling smooth and performant

---

### T030: App Component Update (Three-Grid Layout)

- [ ] **T030** Update App component with three-grid layout: `src/components/App.tsx`

**Description**: Integrate three grids (Collected, Wishlisted, Available) into main App component layout per FR-008

**Implementation Requirements**:
- Import CollectionList, WishlistList, AvailableGrid components
- Wrap with LazyLoadingGrid for available Pokemon
- Include PokemonSearch component
- State: searchIndex (from PokemonSearch)
- Pass collection, wishlist to grids
- Pass callbacks for status changes to each grid
- Layout: responsive three-column grid (stack on mobile)
- Title/header with app name and stats (total Pokemon: X/1025 collected)
- CSS in `src/styles/App.css` and `src/styles/components.css`
- 100% coverage of App logic

**Success**: Three grids visible and functional

---

### T031: US3 Integration Test (Full Three-Grid Workflow)

- [ ] **T031** Integration test for User Story 3 (three grids + lazy loading): `tests/integration/us3-three-grids.test.jsx`

**Description**: Full integration test verifying US3 workflow (view three grids, lazy loading, search, status transitions across grids)

**Test Coverage**:
- Open application and see three grids labeled correctly (SC-008)
- Collected Pokemon appear only in Collected grid
- Wishlisted Pokemon appear only in Wishlisted grid
- Available Pokemon appear only in Available grid
- Scroll through Available grid, lazy loading triggered (SC-011)
- Scroll performance smooth 60 FPS (SC-010)
- Initial load within 1.5 seconds (SC-012)
- Search by index (e.g., "25") finds Pokemon across all grids (SC-006)
- Click "Collect" on available Pokemon moves to Collected grid within 500ms (SC-009)
- Click "Add to Wishlist" on available Pokemon moves to Wishlisted grid within 500ms (SC-009)
- Click "Remove from Collection" removes from Collected and Pokemon appears in Available (or Wishlisted if moved)
- Card buttons easily clickable, high success rate (SC-015)
- Grid responsive on mobile/tablet/desktop (SC-013)
- Pokemon images display properly with consistent aspect ratio (SC-014)

**Success**: Full US3 workflow verified, all acceptance scenarios working

---

### T032: Lazy Loading Edge Case Tests

- [ ] **T032** Edge case tests for lazy loading and performance: `tests/integration/lazy-loading-edge-cases.test.jsx`

**Description**: Edge case testing for rapid scrolling, connection loss, 1000+ Pokemon rendering

**Test Coverage**:
- Rapid scrolling (scrolling 10x speed) handles gracefully
- Many Pokemon in single grid (1000+) renders efficiently
- Scroll to bottom repeatedly doesn't break
- Window resize while scrolling maintains correct visible Pokemon
- Pokemon card transitions while scrolling (move to different grid)
- Large images load without blocking scroll
- Memory usage doesn't grow unbounded on repeated scroll
- Network latency simulated (Pokemon image load delay)

**Success**: Edge cases handled, no crashes, memory stable, 60 FPS maintained

---

**Phase 5 Summary**:
- 4 component test files created (T024, T026, T028, T031)
- 4 component implementations created (T025, T027, T029)
- 1 App component update (T030)
- 2 integration test files created (T031, T032)
- All new code has 80%+ coverage
- US3 complete with three-grid view and lazy loading
- Performance targets met (60 FPS, <1.5s initial load)
- Phase 5 ready to merge after code review

---

## Phase 6: Polish (3 tasks, ~4-6 hours)

Styling, accessibility, optimization, refinements. No new core features or tests in this phase.

### T033: Styling & Layout Polish

- [ ] **T033** [P] Polish styling and responsive layout: `src/styles/App.css`, `src/styles/components.css`, `src/styles/index.css`

**Description**: Enhance visual design, ensure responsive across mobile/tablet/desktop, improve visual hierarchy

**Implementation Requirements**:
- App layout: responsive three-column grid (flex on mobile, CSS Grid on desktop)
- Pokemon card styling: consistent sizing, shadow/hover effects, smooth transitions
- Badge styling: collected (e.g., green), wishlisted (e.g., orange) visual distinction
- Button styling: clear, accessible, with hover/focus states
- Search component: prominent input, clear placeholder
- Empty states: friendly messaging with icons
- Responsive breakpoints: 320px (mobile), 768px (tablet), 1024px (desktop)
- Color scheme: cohesive Pokemon-themed palette
- Typography: clear hierarchy, readable font sizes
- Spacing: consistent padding/margin (8px grid)
- No horizontal scrolling on any screen size (SC-013)
- High-resolution images scale perfectly (SC-014)
- Accessibility: sufficient color contrast (WCAG AA), touch targets >44px (SC-015)

**Success**: App visually polished, responsive across all screen sizes, accessible

---

### T034: Accessibility & Keyboard Navigation

- [ ] **T034** [P] Implement accessibility features: semantic HTML, ARIA, keyboard nav

**Description**: Ensure WCAG 2.1 AA compliance, full keyboard navigation, screen reader support

**Implementation Requirements**:
- Semantic HTML: use <button>, <input>, <nav>, <main> appropriately
- ARIA labels: aria-label, aria-describedby, role attributes where needed
- Keyboard navigation: Tab through all interactive elements, Enter/Space activate buttons
- Focus indicators: visible focus outline on all buttons and inputs
- Skip links: optional skip-to-main-content link
- Color contrast: minimum WCAG AA (4.5:1 for text, 3:1 for graphics)
- Form inputs: proper labels, error messages accessible
- Images: alt text where needed (Pokemon name + index)
- Status updates: aria-live regions for grid updates
- Search component: proper label and input association
- Test with screen reader (optional: VoiceOver, NVDA simulation)
- Verify 100% keyboard navigable without mouse

**Success**: App passes accessibility audit, full keyboard navigation works, color contrast compliant

---

### T035: Performance Optimization & Cleanup

- [ ] **T035** [P] Performance optimization, bundle size, memory cleanup

**Description**: Optimize bundle size, reduce memory footprint, clean up unused code

**Implementation Requirements**:
- Code splitting: lazy load components if needed (optional)
- Tree shaking: remove unused imports, ensure minimal bundle size
- Image optimization: verify Pokemon images are optimized (lazy load images in cards)
- Debounce search input to reduce re-renders
- Memoize components that receive callbacks (React.memo where beneficial)
- Remove console.log statements
- Remove unused CSS rules (PurgeCSS or manual review)
- Verify no memory leaks: cleanup event listeners, observers in useEffect
- Bundle analysis: check final bundle size is reasonable (<2MB)
- Remove unused dependencies from package.json
- Document performance targets achieved (SC-001 through SC-015)
- Create performance report/checklist

**Success**: Bundle optimized, no memory leaks, all SC targets documented as achieved

---

**Phase 6 Summary**:
- 3 polish tasks (T033, T034, T035)
- Visual design complete and polished
- Full accessibility (WCAG 2.1 AA)
- Performance optimized
- Ready for production

---

## Summary Table

| Phase | Tasks | Duration | Key Deliverables |
|-------|-------|----------|------------------|
| 1 | T001-T003 | 3-4h | TypeScript + Testing setup | ✅ Complete |
| 2 | T004-T012 | 8-10h | Pokemon/Collection models, Storage, API service (TDD) | ✅ Complete |
| 3 | T013-T019 | 6-8h | US1 complete: Mark Collected (TDD + integration) | Ready |
| 4 | T020-T023 | 4-6h | US2 complete: Add Wishlist (TDD + integration) | Pending |
| 5 | T024-T032 | 10-12h | US3 complete: Three Grids + Lazy Loading (TDD + integration) | Pending |
| 6 | T033-T035 | 4-6h | Polish, Accessibility, Performance | Pending |
| **Total** | **35 tasks** | **35-46h** | **Complete Feature** | **14/35 done** |

---

## Success Criteria (Feature Complete)

✅ All 35 tasks completed and merged  
✅ All unit tests pass (80%+ coverage)  
✅ All integration tests pass  
✅ Contract tests validate PokeAPI integration  
✅ All user stories implemented (P1 and P2)  
✅ All functional requirements (FR-001 through FR-021) met  
✅ All success criteria (SC-001 through SC-015) achieved  
✅ App responsive on mobile/tablet/desktop  
✅ WCAG 2.1 AA accessibility compliant  
✅ Performance targets met (60 FPS, <1.5s load)  
✅ Code review completed  
✅ Feature branch merged to main  

---

## Notes & Conventions

- **Parallelization**: Tasks marked with `[P]` in the same phase can be worked in parallel
- **TDD**: All Phase 2+ tasks marked with `[TDD]` write tests BEFORE implementation
- **File Paths**: All paths are relative to workspace root or absolute (e.g., `src/models/Pokemon.ts`)
- **Test Framework**: All tests use Vitest + React Testing Library
- **Commit Strategy**: Each task should be a single, atomic commit with clear message
- **Code Review**: Each task should be reviewed before proceeding to next phase
- **Coverage**: Target 80%+ code coverage; utilities and types may be lower

---

**Document Status**: Ready for Implementation  
**Last Updated**: 2025-11-29  
**Next Step**: Begin Phase 1 with T001-T003
- [x] T012 [P] Create Pokemon.test.ts (tests/unit/models/Pokemon.test.ts) - tests MUST FAIL initially (TDD red phase)
- [x] T013 [P] Create Collection model (src/models/Collection.ts) with id, pokemon array, timestamps
- [x] T014 [P] Create Collection.test.ts (tests/unit/models/Collection.test.ts) - TDD red phase
- [x] T015 Implement Pokemon model to pass T012 tests (TDD green phase)
- [x] T016 Implement Collection model to pass T014 tests (TDD green phase)
- [x] T017 [P] Create collectionStorage.ts service (src/services/collectionStorage.ts) with localStorage interface
- [x] T018 [P] Create collectionStorage.test.ts (tests/unit/services/collectionStorage.test.ts) with CRUD operations tests - TDD red
- [x] T019 Implement collectionStorage to pass T018 tests (TDD green phase)
- [x] T020 [P] Create pokemonApi.ts service (src/services/pokemonApi.ts) with PokeAPI fetch and caching
- [x] T021 [P] Create pokemonApi.test.ts (tests/contract/pokemonApi.test.ts) with API contract validation - TDD red
- [x] T022 Implement pokemonApi to pass T021 tests (TDD green phase)
- [x] T023 [P] Create constants.ts (src/utils/constants.ts) with API URLs, storage keys, Pokemon index range
- [x] T024 [P] Create useCollection hook (src/hooks/useCollection.ts) for collection state management
- [x] T025 [P] Create useCollection.test.ts (tests/unit/hooks/useCollection.test.ts) with state tests - TDD red
- [x] T026 Implement useCollection hook to pass T025 tests (TDD green phase)

**Checkpoint**: Foundation ready - all models, services, and hooks functional. User story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Mark Pokemon as Collected (Priority: P1) 🎯 MVP

**Goal**: Core collection tracking - users can mark any Pokemon as collected and see it in their collection with a visual badge

**Independent Test**: Can be fully tested by: 1) Search Pokemon by index 2) Mark as collected 3) Verify in collection list with badge 4) Verify duplicate protection works

### Tests for User Story 1 (TDD - Write FIRST, ensure FAIL before implementation)

- [x] T027 [P] [US1] Create pokemonService.test.ts (tests/unit/services/pokemonService.test.ts) with collectPokemon tests - TDD red
- [x] T028 [P] [US1] Create PokemonCard.test.tsx (tests/unit/components/PokemonCard.test.tsx) with render and collect button tests - TDD red
- [x] T029 [P] [US1] Create CollectionList.test.tsx (tests/unit/components/CollectionList.test.tsx) with collected Pokemon display tests - TDD red
- [x] T030 [P] [US1] Create PokemonSearch.test.tsx (tests/unit/components/PokemonSearch.test.tsx) with search input tests - TDD red
- [x] T031 [P] [US1] Create App.test.tsx (tests/unit/components/App.test.tsx) - US1 basic render test - TDD red
- [x] T032 [P] [US1] Create integration test (tests/integration/collection.us1.test.tsx) - search → collect → verify in list - TDD red

### Implementation for User Story 1

- [x] T033 [US1] Implement pokemonService.ts (src/services/pokemonService.ts) with collectPokemon(index) - pass T027
- [x] T034 [P] [US1] Create PokemonCard.tsx component (src/components/PokemonCard.tsx) with Pokemon display and Collect button - pass T028
- [x] T035 [P] [US1] Create CollectionList.tsx component (src/components/CollectionList.tsx) displaying collected Pokemon with badge - pass T029
- [x] T036 [P] [US1] Create PokemonSearch.tsx component (src/components/PokemonSearch.tsx) with index input and search handler - pass T030
- [x] T037 [US1] Create App.tsx main component (src/components/App.tsx) with US1 layout: search + card + collection list - pass T031
- [x] T038 [US1] Create App.css (src/styles/App.css) with basic layout styling (minimal approach)
- [x] T039 [US1] Create components.css (src/styles/components.css) with card and badge styling
- [x] T040 [US1] Run T032 integration test and verify pass (search → collect → list) - pass T032
- [x] T041 [US1] Add logging for collection operations (console.log in pokemonService)
- [x] T042 [US1] Manual testing: Verify F5 page reload preserves collected Pokemon (localStorage persistence)

**Checkpoint**: User Story 1 complete and independently functional. Users can search by index, mark collected, see collection with badges, data persists across page reloads.

---

## Phase 4: User Story 2 - Add Pokemon to Wishlist (Priority: P2)

**Goal**: Wishlist management - users can add uncollected Pokemon to wishlist with validation preventing collected Pokemon from being added

**Independent Test**: Can be fully tested by: 1) Search uncollected Pokemon 2) Add to wishlist 3) Verify in wishlist 4) Try adding collected (should fail) 5) Verify UI prevents action

✅ **PHASE 4 COMPLETE**: WishlistList component, integration tests, and validation all passing

### Tests for User Story 2 (TDD - Write FIRST, ensure FAIL before implementation)

- [x] T044 [P] [US2] Create WishlistList.test.jsx (tests/unit/components/WishlistList.test.jsx) - TDD red phase
- [x] T053 [P] [US2] Create integration test (tests/integration/wishlist.us2.test.jsx) - search uncollected → add to wishlist - TDD red

### Implementation for User Story 2

- [x] T048 [US2] Implement addToWishlist(pokemonId) in pokemonService.ts with validation (FR-003) - already implemented
- [x] T050 [US2] Create WishlistList.tsx component (src/components/WishlistList.tsx) displaying wishlist Pokemon with badge - pass T044
- [x] T049 [US2] Update PokemonCard.tsx with "Add to Wishlist" button (disabled if collected) - already implemented
- [x] T051 [US2] Update App.tsx to include WishlistList and add/remove wishlist handlers - pass integration tests
- [x] T052 [US2] Add wishlist styling to components.css (badge distinct from collected)
- [x] Add removeFromWishlist(pokemonId) function to pokemonService.ts
- [x] T053 [US2] Run integration test - wishlist add flow - pass
- [x] T054 [US2] All tests passing, wishlist validation verified

**Checkpoint**: User Stories 1 AND 2 both work independently. Users can collect and wishlist, with proper validation and visual separation.

---

## Phase 5: User Story 3 - View and Filter Collection (Priority: P3)

**Goal**: Navigation and filtering - users can view full collection and wishlist separately, with search by Pokemon index

**Independent Test**: Can be fully tested by: 1) View My Collection tab 2) View My Wishlist tab 3) Search by index 4) Verify filtering accuracy

### Tests for User Story 3 (TDD - Write FIRST, ensure FAIL before implementation)

- [ ] T057 [P] [US3] Create navigation tests in App.test.tsx (collection vs wishlist tabs) - TDD red
- [ ] T058 [P] [US3] Create filter tests in PokemonSearch.test.tsx (search/filter functionality) - TDD red
- [ ] T059 [P] [US3] Create integration test (tests/integration/navigation.us3.test.tsx) - tab switching and display - TDD red
- [ ] T060 [P] [US3] Create integration test (tests/integration/search.us3.test.tsx) - search by index returns correct Pokemon - TDD red

### Implementation for User Story 3

- [ ] T061 [US3] Update App.tsx with tab navigation (My Collection, My Wishlist, Search) - pass T057
- [ ] T062 [US3] Implement filter logic in useCollection hook or App state for Pokemon index search - pass T058
- [ ] T063 [US3] Update PokemonSearch.tsx with actual search/filter functionality - pass filtering tests
- [ ] T064 [US3] Add tab styling to App.css (active/inactive states, clear visual separation)
- [ ] T065 [US3] Run T059 integration test - tab navigation works - pass
- [ ] T066 [US3] Run T060 integration test - search by index filters correctly - pass
- [ ] T067 [US3] Manual testing: Switch between tabs rapidly, verify correct list displays
- [ ] T068 [US3] Manual testing: Search "25" (Pikachu), should show only if in collection/wishlist
- [ ] T069 [US3] Performance testing: Collection of 100+ Pokemon, search should return in <1s

**Checkpoint**: All user stories complete and independently functional. Application is ready for polish phase.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements, testing, documentation, and deployment readiness

- [ ] T070 [P] Add error handling to pokemonApi.ts for network failures and rate limiting
- [ ] T071 [P] Add user-facing error messages (toast/alert for failed actions)
- [x] T072 [P] Run full test suite: `pnpm test` - all tests must pass
- [ ] T073 [P] Generate coverage report: `pnpm run test:coverage` - target 80%+ coverage
- [ ] T074 [P] Run ESLint: `pnpm run lint` - fix all warnings and errors
- [ ] T075 [P] Performance audit: Lighthouse score, bundle size analysis
- [ ] T076 [P] Create README.md in repository root with installation and running instructions
- [ ] T077 [P] Create DEVELOPMENT.md with TDD workflow and contribution guidelines
- [ ] T078 Update quickstart.md with any discovered gotchas or clarifications
- [ ] T079 Create TESTING.md documenting test structure and how to run specific test suites
- [ ] T080 [P] Build for production: `pnpm run build` - verify dist/ output
- [ ] T081 Manual cross-browser testing (Chrome, Firefox, Safari) - P1 user story flows
- [ ] T082 Mobile responsiveness check - collection/wishlist views on mobile screen sizes
- [ ] T083 Offline mode testing - localStorage persistence without API access
- [ ] T084 PokeAPI rate limit testing - verify behavior when hitting 429 errors
- [ ] T085 Data export feature (optional) - JSON export of collection/wishlist
- [ ] T086 Code cleanup and refactoring - simplify complex functions, extract reusable utilities
- [ ] T087 Add JSDoc comments to all public functions and React components
- [ ] T088 Verify quickstart.md setup process on clean environment
- [ ] T089 Create git hooks for pre-commit linting (husky + lint-staged)
- [ ] T090 Final security review - no sensitive data exposed, localStorage best practices

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately ✅
- **Foundational (Phase 2)**: Depends on Setup completion - **BLOCKS all user stories** ⚠️
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - **US1 (P1)**: Can start after Foundational - No dependencies on other stories
  - **US2 (P2)**: Can start after Foundational - May integrate with US1 but independently testable
  - **US3 (P3)**: Can start after Foundational - May integrate with US1/US2 but independently testable
  - All three user stories can proceed in **parallel** if team capacity allows
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories ✓
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No hard dependencies on US1, but validation logic shared (FR-003) ✓
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Requires US1 or US2 to have data to display ✓

### Within Each User Story

1. **Tests FIRST** (all tests must FAIL before implementation - RED phase)
2. **Implement** to make tests pass (GREEN phase)
3. **Refactor** (REFACTOR phase)
4. **Integration tests** (verify full flow)
5. **Manual testing** (user experience validation)

### Parallel Opportunities

**Phase 1 Setup** (All marked [P]):
- All setup tasks can run in parallel: T002-T010
- Estimated: 1-2 hours combined (not sequential)

**Phase 2 Foundational** (Multiple [P]):
- Model creation: T011, T013 in parallel
- Model tests: T012, T014 in parallel
- Storage service: T017, T018 in parallel
- API service: T020, T021 in parallel
- Hook: T024, T025 in parallel
- After model implementation (T015, T016): can implement T019, T022, T026 in parallel

**Phase 3 US1** (After Foundational):
- All tests (T027-T032) can be written in parallel
- After tests written: T034, T035, T036 can be implemented in parallel
- Sequential dependency: T033 (pokemonService) should complete before T032 integration test

**Phase 3-5 User Stories** (After Foundational):
- **If 3+ developers**: US1, US2, US3 can each have dedicated developer after Foundational
- Each story can be independently tested and merged without waiting for others
- Sequential if <3 developers: US1 → US2 → US3 (priority order)

**Phase 6 Polish** (All marked [P]):
- Most tasks are independent: T070-T087 can run in parallel
- Exclude blocking tasks (T088 sequential after T081)

### Parallel Example: US1 Test Writing

```
Write all tests in parallel:
- T027: pokemonService.test.ts (service layer)
- T028: PokemonCard.test.tsx (component layer)
- T029: CollectionList.test.tsx (component layer)
- T030: PokemonSearch.test.tsx (component layer)
- T031: App.test.tsx (integration)
- T032: collection.flow.test.tsx (full integration)

All 6 tests should FAIL (RED phase)

Then implement in parallel (where no dependencies):
- T034, T035, T036 (components) in parallel
- T033 (service) sequential after tests written
```

---

## Parallel Example: Full Team Strategy (3+ developers)

**With 3+ developers on Phase 2+**:

```
Developer A: Phase 1 (Setup) - 2 hours
  ↓
Developer A + B + C: Phase 2 (Foundational) - 4-6 hours total
  ↓
After Foundational (T026 complete):
  Developer A → US1 (Phase 3) - 8-10 hours
  Developer B → US2 (Phase 4) - 6-8 hours
  Developer C → US3 (Phase 5) - 4-6 hours
  ↓
  All parallel, PR review + merge when ready
  ↓
After all stories: Team → Phase 6 (Polish) - 4-6 hours total
```

**Estimated Total**: ~20-30 hours for complete feature (P1+P2+P3)
**MVP (P1 Only)**: ~6-8 hours to Phase 3 completion

---

## Implementation Strategy

### MVP First (User Story 1 Only) - RECOMMENDED START

1. ✅ Complete Phase 1: Setup (T001-T010) - 2 hours
2. ✅ Complete Phase 2: Foundational (T011-T026) - 5 hours
3. ✅ Complete Phase 3: User Story 1 (T027-T042) - 5 hours
4. 🎉 **STOP and VALIDATE**: Users can search, collect, view collection independently
5. ✅ Deploy P1 MVP if ready, celebrate with stakeholders
6. Then proceed: US2 (Phase 4) → US3 (Phase 5) → Polish (Phase 6)

**Checkpoint After Each Phase**: Test independently before moving forward

### Incremental Delivery Strategy

```
Increment 1: Setup + Foundational
  ↓ (GATE: can't proceed without this)
Increment 2: User Story 1 (MVP) - RELEASABLE
  ↓ (validate with users)
Increment 3: User Story 2 - Add Wishlist
  ↓ (full feature value)
Increment 4: User Story 3 - Better UX
  ↓ (polish for production)
Increment 5: Polish & Optimize - PRODUCTION READY
```

Each increment is independently testable and valuable.

---

## Notes

- **[P] tasks**: Different files, no dependencies - truly parallelizable
- **[Story] labels**: Maps task to user story (US1, US2, US3)
- **TDD Red-Green-Refactor**: Write failing tests FIRST (red), implement (green), optimize (refactor)
- **Acceptance Criteria**: Each task explicitly tied to spec requirements or acceptance scenarios
- **No blocking cross-story dependencies**: US2 doesn't require US1, US3 doesn't require US2/US1 (independent)
- **Commit after each task**: Small, atomic commits with test passing guarantees
- **Run full test suite before merge**: `pnpm test` must pass all tests
- **Constitution compliance**: All tasks enforce TDD (Testing Standards), code quality (linting), and velocity (minimal overhead)

---

## Task Checklist Status

**Total Tasks**: 90  
**Setup Phase (T001-T010)**: 10 tasks  
**Foundational Phase (T011-T026)**: 16 tasks (BLOCKS all stories)  
**User Story 1 (T027-T042)**: 16 tasks (MVP)  
**User Story 2 (T043-T056)**: 14 tasks  
**User Story 3 (T057-T069)**: 13 tasks  
**Polish (T070-T090)**: 21 tasks  

**MVP Path (P1 Only)**: 42 tasks (T001-T042)  
**Full Feature (P1+P2+P3)**: 69 tasks (T001-T069)  
**Production Ready (All)**: 90 tasks (T001-T090)  

**Suggested Start**: T001 ✓ Execute Phase 1, then Phase 2, then choose MVP (stop at T042) or continue to full feature.
