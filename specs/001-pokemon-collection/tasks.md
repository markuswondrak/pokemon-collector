---
description: "Task list for Pokemon Collection Organizer feature implementation"
---

# Tasks: Pokemon Collection Organizer

**Input**: Design documents from `/specs/001-pokemon-collection/`
**Prerequisites**: spec.md (required), plan.md (required), data-model.md, contracts/

**Tests**: Tests are INCLUDED and REQUIRED - TDD mandatory per Constitution

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below reflect the React + Vite structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Initialize React + Vite project with pnpm at repository root
- [ ] T002 [P] Install core dependencies: React 18, Vite, axios, react-dom
- [ ] T003 [P] Install dev dependencies: Vitest, @testing-library/react, @testing-library/jest-dom, ESLint
- [ ] T004 [P] Configure Vite (vite.config.js) with React plugin and dev/build settings
- [ ] T005 [P] Configure ESLint (.eslintrc.json) with React and JavaScript rules
- [ ] T006 [P] Configure Vitest (vitest.config.js) for React component testing
- [ ] T007 [P] Create .gitignore with node_modules, dist, .env, pnpm-lock.yaml exclusions
- [ ] T008 [P] Create index.html entry point with React root div
- [ ] T009 [P] Create src/main.jsx Vite entry point rendering React App
- [ ] T010 [P] Create directory structure: src/{components,services,hooks,models,styles,utils}, tests/{unit,integration,contract}

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core models and services that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T011 [P] Create Pokemon model (src/models/Pokemon.js) with index, name, image, collected, wishlist properties and validation
- [ ] T012 [P] Create Pokemon.test.js (tests/unit/models/Pokemon.test.js) - tests MUST FAIL initially (TDD red phase)
- [ ] T013 [P] Create Collection model (src/models/Collection.js) with id, pokemon array, timestamps
- [ ] T014 [P] Create Collection.test.js (tests/unit/models/Collection.test.js) - TDD red phase
- [ ] T015 Implement Pokemon model to pass T012 tests (TDD green phase)
- [ ] T016 Implement Collection model to pass T014 tests (TDD green phase)
- [ ] T017 [P] Create collectionStorage.js service (src/services/collectionStorage.js) with localStorage interface
- [ ] T018 [P] Create collectionStorage.test.js (tests/unit/services/collectionStorage.test.js) with CRUD operations tests - TDD red
- [ ] T019 Implement collectionStorage to pass T018 tests (TDD green phase)
- [ ] T020 [P] Create pokemonApi.js service (src/services/pokemonApi.js) with PokeAPI fetch and caching
- [ ] T021 [P] Create pokemonApi.test.js (tests/contract/pokemonApi.test.js) with API contract validation - TDD red
- [ ] T022 Implement pokemonApi to pass T021 tests (TDD green phase)
- [ ] T023 [P] Create constants.js (src/utils/constants.js) with API URLs, storage keys, Pokemon index range
- [ ] T024 [P] Create useCollection hook (src/hooks/useCollection.js) for collection state management
- [ ] T025 [P] Create useCollection.test.js (tests/unit/hooks/useCollection.test.js) with state tests - TDD red
- [ ] T026 Implement useCollection hook to pass T025 tests (TDD green phase)

**Checkpoint**: Foundation ready - all models, services, and hooks functional. User story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Mark Pokemon as Collected (Priority: P1) 🎯 MVP

**Goal**: Core collection tracking - users can mark any Pokemon as collected and see it in their collection with a visual badge

**Independent Test**: Can be fully tested by: 1) Search Pokemon by index 2) Mark as collected 3) Verify in collection list with badge 4) Verify duplicate protection works

### Tests for User Story 1 (TDD - Write FIRST, ensure FAIL before implementation)

- [ ] T027 [P] [US1] Create pokemonService.test.js (tests/unit/services/pokemonService.test.js) with collectPokemon tests - TDD red
- [ ] T028 [P] [US1] Create PokemonCard.test.jsx (tests/unit/components/PokemonCard.test.jsx) with render and collect button tests - TDD red
- [ ] T029 [P] [US1] Create CollectionList.test.jsx (tests/unit/components/CollectionList.test.jsx) with collected Pokemon display tests - TDD red
- [ ] T030 [P] [US1] Create PokemonSearch.test.jsx (tests/unit/components/PokemonSearch.test.jsx) with search input tests - TDD red
- [ ] T031 [P] [US1] Create App.test.jsx (tests/unit/components/App.test.jsx) - US1 basic render test - TDD red
- [ ] T032 [P] [US1] Create integration test (tests/integration/collection.us1.test.jsx) - search → collect → verify in list - TDD red

### Implementation for User Story 1

- [ ] T033 [US1] Implement pokemonService.js (src/services/pokemonService.js) with collectPokemon(index) - pass T027
- [ ] T034 [P] [US1] Create PokemonCard.jsx component (src/components/PokemonCard.jsx) with Pokemon display and Collect button - pass T028
- [ ] T035 [P] [US1] Create CollectionList.jsx component (src/components/CollectionList.jsx) displaying collected Pokemon with badge - pass T029
- [ ] T036 [P] [US1] Create PokemonSearch.jsx component (src/components/PokemonSearch.jsx) with index input and search handler - pass T030
- [ ] T037 [US1] Create App.jsx main component (src/components/App.jsx) with US1 layout: search + card + collection list - pass T031
- [ ] T038 [US1] Create App.css (src/styles/App.css) with basic layout styling (minimal approach)
- [ ] T039 [US1] Create components.css (src/styles/components.css) with card and badge styling
- [ ] T040 [US1] Run T032 integration test and verify pass (search → collect → list) - pass T032
- [ ] T041 [US1] Add logging for collection operations (console.log in pokemonService)
- [ ] T042 [US1] Manual testing: Verify F5 page reload preserves collected Pokemon (localStorage persistence)

**Checkpoint**: User Story 1 complete and independently functional. Users can search by index, mark collected, see collection with badges, data persists across page reloads.

---

## Phase 4: User Story 2 - Add Pokemon to Wishlist (Priority: P2)

**Goal**: Wishlist management - users can add uncollected Pokemon to wishlist with validation preventing collected Pokemon from being added

**Independent Test**: Can be fully tested by: 1) Search uncollected Pokemon 2) Add to wishlist 3) Verify in wishlist 4) Try adding collected (should fail) 5) Verify UI prevents action

### Tests for User Story 2 (TDD - Write FIRST, ensure FAIL before implementation)

- [ ] T043 [P] [US2] Create addToWishlist tests in pokemonService.test.js - TDD red
- [ ] T044 [P] [US2] Create WishlistList.test.jsx (tests/unit/components/WishlistList.test.jsx) with display tests - TDD red
- [ ] T045 [P] [US2] Create PokemonCard update tests for wishlist button (in T028, add wishlist scenarios) - TDD red
- [ ] T046 [P] [US2] Create integration test (tests/integration/wishlist.us2.test.jsx) - search uncollected → add to wishlist - TDD red
- [ ] T047 [P] [US2] Create validation test (tests/integration/validation.us2.test.jsx) - cannot add collected to wishlist - TDD red

### Implementation for User Story 2

- [ ] T048 [US2] Implement addToWishlist(index) in pokemonService.js with validation (FR-003) - pass T043
- [ ] T049 [US2] Update PokemonCard.jsx with "Add to Wishlist" button (disabled if collected) - pass T045
- [ ] T050 [P] [US2] Create WishlistList.jsx component (src/components/WishlistList.jsx) displaying wishlist Pokemon with badge - pass T044
- [ ] T051 [US2] Update App.jsx to include WishlistList and add/remove wishlist handlers - pass integration test
- [ ] T052 [US2] Add wishlist styling to components.css (badge distinct from collected)
- [ ] T053 [US2] Run T046 integration test - wishlist add flow - pass
- [ ] T054 [US2] Run T047 validation test - collected prevention - pass
- [ ] T055 [US2] Manual testing: Add to wishlist → F5 reload → verify persistence
- [ ] T056 [US2] Manual testing: Click "Add to Wishlist" on collected Pokemon → verify button disabled or error shown

**Checkpoint**: User Stories 1 AND 2 both work independently. Users can collect and wishlist, with proper validation and visual separation.

---

## Phase 5: User Story 3 - View and Filter Collection (Priority: P3)

**Goal**: Navigation and filtering - users can view full collection and wishlist separately, with search by Pokemon index

**Independent Test**: Can be fully tested by: 1) View My Collection tab 2) View My Wishlist tab 3) Search by index 4) Verify filtering accuracy

### Tests for User Story 3 (TDD - Write FIRST, ensure FAIL before implementation)

- [ ] T057 [P] [US3] Create navigation tests in App.test.jsx (collection vs wishlist tabs) - TDD red
- [ ] T058 [P] [US3] Create filter tests in PokemonSearch.test.jsx (search/filter functionality) - TDD red
- [ ] T059 [P] [US3] Create integration test (tests/integration/navigation.us3.test.jsx) - tab switching and display - TDD red
- [ ] T060 [P] [US3] Create integration test (tests/integration/search.us3.test.jsx) - search by index returns correct Pokemon - TDD red

### Implementation for User Story 3

- [ ] T061 [US3] Update App.jsx with tab navigation (My Collection, My Wishlist, Search) - pass T057
- [ ] T062 [US3] Implement filter logic in useCollection hook or App state for Pokemon index search - pass T058
- [ ] T063 [US3] Update PokemonSearch.jsx with actual search/filter functionality - pass filtering tests
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

- [ ] T070 [P] Add error handling to pokemonApi.js for network failures and rate limiting
- [ ] T071 [P] Add user-facing error messages (toast/alert for failed actions)
- [ ] T072 [P] Run full test suite: `pnpm test` - all tests must pass
- [ ] T073 [P] Generate coverage report: `pnpm test:coverage` - target 80%+ coverage
- [ ] T074 [P] Run ESLint: `pnpm lint` - fix all warnings and errors
- [ ] T075 [P] Performance audit: Lighthouse score, bundle size analysis
- [ ] T076 [P] Create README.md in repository root with installation and running instructions
- [ ] T077 [P] Create DEVELOPMENT.md with TDD workflow and contribution guidelines
- [ ] T078 Update quickstart.md with any discovered gotchas or clarifications
- [ ] T079 Create TESTING.md documenting test structure and how to run specific test suites
- [ ] T080 [P] Build for production: `pnpm build` - verify dist/ output
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
- T027: pokemonService.test.js (service layer)
- T028: PokemonCard.test.jsx (component layer)
- T029: CollectionList.test.jsx (component layer)
- T030: PokemonSearch.test.jsx (component layer)
- T031: App.test.jsx (integration)
- T032: collection.flow.test.jsx (full integration)

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
