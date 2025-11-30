# Tasks: Sticky Search Bar Feature (002)

**Feature**: `002-sticky-search-bar`  
**Branch**: `002-sticky-search-bar`  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)  
**Status**: Phase 2 - Ready for Implementation (TDD)

---

## Overview

This document breaks down the sticky search bar feature into executable tasks organized by user story and implementation phase. Each task follows strict checklist format for clarity and progress tracking.

**Total Tasks**: 31 tasks across 3 phases  
**Estimated Duration**: 3-4 development days (TDD approach: tests first, then implementation)  
**Dependencies**: Feature 001 (Pokemon Collector base app) must be complete

---

## Implementation Phases

| Phase | Focus | Duration | Tasks |
|-------|-------|----------|-------|
| **RED** | Write tests (TDD) | 1 day | T001-T010 (26 test cases) |
| **GREEN** | Implementation | 1-2 days | T011-T027 (components, hooks, refactoring) |
| **REFACTOR** | Optimization & Polish | 0.5-1 day | T028-T031 (performance, a11y, docs) |

---

## Phase RED: Write Tests (TDD)

### Unit Test Tasks

- [x] T001 [P] Create unit tests for useDebounce hook in `tests/unit/hooks/useDebounce.test.js`
  - Acceptance: 7 test cases covering debounce timing, state, cleanup
  - Details: debounces value after delay, resets timer on changes, cleans up on unmount, isDebouncing state correct

- [x] T002 [P] Create unit tests for StickySearchBar component in `tests/unit/components/StickySearchBar.test.jsx`
  - Acceptance: 6 test cases for rendering, callbacks, clear button, sticky CSS
  - Details: renders with defaults, onChange fires, clear button shows/hides, sticky positioning CSS applied, Escape clears, ARIA labels present

- [x] T003 [P] Update unit tests for App component in `tests/unit/components/App.test.jsx`
  - Acceptance: Add 3 test cases for new search state management
  - Details: search state initialized, search query updates, search results filter grids

### Integration Test Tasks

- [x] T004 [P] Create integration test for search flow in `tests/integration/search.us4.test.jsx` (extend existing)
  - Acceptance: 5 test cases for search triggering, clearing, empty results
  - Details: triggers at 3+ chars, doesn't trigger at 1-2 chars, clear resets grids, zero match handling, rapid queries

- [x] T005 [P] Create integration test for sticky scroll in `tests/integration/sticky-scroll.test.jsx`
  - Acceptance: 4 test cases for sticky positioning behavior
  - Details: stays sticky on scroll down, unsticks on scroll up, maintains gap, no layout shift

### Accessibility Test Tasks

- [x] T006 [P] Create accessibility tests in `tests/integration/a11y-search.test.jsx`
  - Acceptance: 5 test cases for WCAG compliance
  - Details: ARIA labels, Tab navigation, Escape key, focus indicators, screen reader announcements

### Performance Test Tasks

- [x] T007 [P] Create performance tests in `tests/integration/search-performance.test.jsx`
  - Acceptance: 3 test cases for latency and smoothness
  - Details: search <350ms, sticky scroll 60 FPS, no memory leaks

### Test Setup Tasks

- [x] T008 Create test utilities and fixtures in `tests/setup.ts`
  - Acceptance: Mock pokemonService, test data, render helpers available
  - Details: Pokemon fixtures (3 samples), mock search function, RTL render wrapper

- [x] T009 Update test configuration in `vitest.config.js` if needed
  - Acceptance: Config supports all test types (unit, integration, a11y, perf)
  - Details: Verify jsdom environment, React setup, coverage thresholds

- [x] T010 [P] Run test suite to verify all tests fail initially (RED phase)
  - Acceptance: 26+ tests defined, all failing (as expected in TDD)
  - Details: `pnpm test` shows failures, coverage baseline established

---

## Phase GREEN: Implementation

### Hook Implementation Tasks

- [x] T011 Create useDebounce hook in `src/hooks/useDebounce.ts`
  - Acceptance: Hook debounces value, handles cleanup, passes all 7 unit tests
  - Details: useState for debounced value, useEffect for timer, cleanup on unmount, configurable delay (300ms default)

### Component Implementation Tasks

- [x] T012 Create StickySearchBar component in `src/components/StickySearchBar.tsx`
  - Acceptance: Component renders input, handles events, applies sticky CSS, passes all 6 unit tests
  - Details: controlled component (value prop), onChange/onClear callbacks, placeholder/minChars props, CSS sticky positioning, clear button (×), ARIA labels

- [x] T013 [P] Update App.tsx component in `src/components/App.tsx` - Part 1: Add state
  - Acceptance: searchQuery and searchResults state added to App
  - Details: useState for searchQuery, searchResults, isSearchActive; integrate useDebounce hook

- [x] T014 [P] Update App.tsx component in `src/components/App.tsx` - Part 2: Add search logic
  - Acceptance: Search filtering logic implemented, calls pokemonService.searchPokemonByName()
  - Details: Handle onChange/onClear, filter logic when 3+ chars, reset when cleared

- [x] T015 [P] Update App.tsx component in `src/components/App.tsx` - Part 3: Refactor layout
  - Acceptance: Layout changed from 2-col grid to 1-col flex, search section positioned sticky
  - Details: Remove 2-column grid, add flex column, position search section with sticky, ensure 8px gap

- [x] T016 Integrate StickySearchBar into App.tsx in `src/components/App.tsx`
  - Acceptance: StickySearchBar rendered, receives props, callback handlers connected
  - Details: Import component, render in new search section, pass value/onChange/onClear

### CSS Refactoring Tasks

- [x] T017 [P] Refactor App layout CSS in `src/styles/App.css`
  - Acceptance: Layout converted from grid to flex column, sticky positioning applied
  - Details: Update .app class (grid→flex), add .search-section (sticky), add .grids-section, remove old 2-col styles

- [x] T018 [P] Add StickySearchBar component styles in `src/styles/components.css`
  - Acceptance: Component styled like Google search, responsive, accessible
  - Details: Input field (centered, min 44px height), clear button, hover/focus states, mobile responsive (320px+)

### Grid Component Updates

- [ ] T019 [P] Update CollectionList component in `src/components/CollectionList.tsx` to accept filtered results
  - Acceptance: Grid displays filtered Pokemon when search active, all Pokemon when search inactive
  - Details: New prop for filtering results, conditional rendering

- [ ] T020 [P] Update WishlistList component in `src/components/WishlistList.tsx` to accept filtered results
  - Acceptance: Grid displays filtered Pokemon when search active
  - Details: New prop for filtering results

- [ ] T021 [P] Update AvailableGrid component in `src/components/AvailableGrid.tsx` to accept filtered results
  - Acceptance: Grid displays filtered Pokemon when search active
  - Details: New prop for filtering results, lazy loading continues to work

### Deprecation Tasks

- [ ] T022 Deprecate PokemonSearch component in `src/components/PokemonSearch.tsx`
  - Acceptance: Component still exists but marked for removal, no longer used in App
  - Details: Add deprecation warning comment, update storybook if exists

- [ ] T023 Run full test suite (GREEN phase)
  - Acceptance: All 26+ tests passing, integration tests show feature working end-to-end
  - Details: `pnpm test` shows green, coverage ≥85%

---

## Phase REFACTOR: Optimization & Polish

### Performance Optimization Tasks

- [ ] T024 [P] Optimize search filtering with useMemo if needed in `src/components/App.tsx`
  - Acceptance: Search performance stable (still <350ms), no unnecessary recalculations
  - Details: Profile with DevTools, add useMemo for grid filtering if re-renders excessive

- [ ] T025 Verify sticky positioning performance in `src/styles/App.css`
  - Acceptance: Scroll at 60 FPS with no jank (verified via performance test)
  - Details: Check GPU acceleration, remove any blocking JavaScript during scroll

### Accessibility Polish Tasks

- [ ] T026 Add focus indicator styles in `src/styles/components.css`
  - Acceptance: Focus ring visible with 3:1 contrast, keyboard-only navigation fully accessible
  - Details: :focus-visible pseudo-class, outline/ring styling, test with keyboard-only navigation

### Documentation & Cleanup Tasks

- [ ] T027 Update README.md with sticky search feature documentation
  - Acceptance: Feature documented in main README, link to spec
  - Details: Add feature overview, usage examples, architecture notes

- [ ] T028 Update App.tsx comments and JSDoc in `src/components/App.tsx`
  - Acceptance: Code clearly documented, state structure explained
  - Details: Comment on new search state, explain debounce integration

- [ ] T029 Clean up deprecated code and run linter
  - Acceptance: ESLint passes, no unused imports, code style consistent
  - Details: `pnpm lint`, fix warnings, ensure TypeScript strict mode compliance

- [ ] T030 Final code review against spec and contracts
  - Acceptance: Implementation matches spec.md requirements, API contracts honored
  - Details: Verify all 4 user stories covered, test scenarios passing

- [ ] T031 [P] Run full test suite one final time and verify production build
  - Acceptance: All tests passing (85%+ coverage), production build successful
  - Details: `pnpm test`, `pnpm build`, verify bundle size reasonable

---

## Implementation Strategy

### Parallelization Opportunities

**Can be done in parallel** (different files, no dependencies):

**Batch 1 (Tests)**: T001, T002, T003, T004, T005, T006, T007 (all tests at once)

**Batch 2 (Core Implementation)**:
- T008 (test setup) → unblocks all tests
- T011 (useDebounce hook) → feeds into T013
- T012 (StickySearchBar) → feeds into T016

**Batch 3 (Layout & Styles)**:
- T017 (App CSS refactor) → parallel with T013-T015
- T018 (component CSS) → parallel with T012

**Batch 4 (Grid Updates)**: T019, T020, T021 (can all be done in parallel)

**Batch 5 (Polish)**: T024, T025, T026, T027, T028 (all can be done in parallel)

### Recommended Execution Order

**Day 1 (RED - Tests)**:
1. T008: Set up test utilities
2. T001-T007: Write all tests
3. T009: Configure vitest
4. T010: Verify all tests fail

**Day 2 (GREEN - Implementation)**:
1. T011: Implement useDebounce hook
2. T012: Implement StickySearchBar component
3. T013-T015: Update App.tsx (state → logic → layout)
4. T016: Integrate StickySearchBar
5. T017-T018: Update CSS
6. T019-T021: Update grid components
7. T023: Run full test suite (should all pass now)

**Day 3 (REFACTOR - Polish)**:
1. T022: Deprecate old component
2. T024-T025: Performance optimization
3. T026: Accessibility polish
4. T027-T028: Documentation
5. T029: Code cleanup & linting
6. T030: Final review
7. T031: Final test run + production build

---

## Success Criteria (Per Phase)

### RED Phase ✅
- [x] 26+ test cases written
- [x] All tests defined and failing (as expected)
- [x] Test structure matches contract specifications
- [x] Coverage baseline established

### GREEN Phase ✅
- [ ] All 26+ tests passing
- [ ] useDebounce hook implemented and tested
- [ ] StickySearchBar component implemented and tested
- [ ] App.tsx refactored for search state + layout
- [ ] Grid components updated for filtered display
- [ ] CSS refactored for single-column layout + sticky positioning
- [ ] No console errors or warnings
- [ ] Feature works end-to-end (manual testing)

### REFACTOR Phase ✅
- [ ] Performance targets met (350ms search, 60 FPS scroll)
- [ ] Accessibility verified (WCAG 2.1 AA, keyboard navigation)
- [ ] Code review passed (no comments)
- [ ] All tests passing with 85%+ coverage
- [ ] Production build successful (<5min)
- [ ] Documentation updated

---

## Dependency Graph

```
T008 (setup)
├─ T001-T007 (write tests)
│  └─ T010 (verify all fail)

T011 (useDebounce hook)
└─ T013 (App state integration)

T012 (StickySearchBar component)
├─ T016 (integrate into App)
└─ T018 (component CSS)

T013-T015 (App refactoring)
├─ T017 (App CSS)
├─ T019-T021 (grid updates)
└─ T023 (test run - should pass)

T023 (all tests pass)
└─ T024-T031 (refactor & polish)
```

---

## File Checklist

### Tests to Create
- [ ] `tests/unit/hooks/useDebounce.test.js`
- [ ] `tests/unit/components/StickySearchBar.test.jsx`
- [ ] `tests/integration/search.us4.test.jsx` (extend)
- [ ] `tests/integration/sticky-scroll.test.jsx`
- [ ] `tests/integration/a11y-search.test.jsx`
- [ ] `tests/integration/search-performance.test.jsx`

### Source Code to Create/Modify
- [ ] `src/hooks/useDebounce.ts` (NEW)
- [ ] `src/components/StickySearchBar.tsx` (NEW)
- [ ] `src/components/App.tsx` (MODIFY)
- [ ] `src/components/CollectionList.tsx` (MODIFY - optional props for filtering)
- [ ] `src/components/WishlistList.tsx` (MODIFY - optional props for filtering)
- [ ] `src/components/AvailableGrid.tsx` (MODIFY - optional props for filtering)
- [ ] `src/styles/App.css` (MODIFY)
- [ ] `src/styles/components.css` (MODIFY)

### Documentation to Update
- [ ] `README.md` (add feature section)
- [ ] JSDoc comments in modified components

---

## Testing Metrics

### Coverage Target: 85%

| Category | Target | Current |
|----------|--------|---------|
| Statements | 85% | TBD (RED phase) |
| Branches | 82% | TBD |
| Functions | 87% | TBD |
| Lines | 84% | TBD |

### Performance Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Search latency | < 350ms | T007 performance test |
| Sticky scroll | ≥ 55 FPS | T007 performance test |
| Layout shift | 0 (CLS) | T005 integration test |
| Mobile viewport | 320px+ | T019-T021 tests |

---

## Rollback Plan

If critical issues found during Phase 2:

```bash
# Revert feature branch to planning state
git reset --hard <plan-commit-hash>

# Or revert entire branch
git checkout main
git branch -D 002-sticky-search-bar
git branch 002-sticky-search-bar main
```

---

## Next: Ready for Development

Phase 1 (Design & Contracts) complete ✅  
Phase 2 (Implementation) ready to begin 🚀

Start with **T008** (test setup) → **T001-T007** (write tests) → **T010** (verify RED phase)

