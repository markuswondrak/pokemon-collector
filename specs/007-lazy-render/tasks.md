# Implementation Tasks: Lazy Card Rendering

**Feature**: 007-lazy-render | **Branch**: `007-lazy-render`  
**Phase**: 2 (Implementation) | **Date**: 2025-12-04  
**Status**: Ready for development

---

## Overview

This document breaks down the lazy card rendering feature into executable implementation tasks organized by user story and phase. Each task includes:
- Clear acceptance criteria
- File paths affected
- Dependencies on other tasks
- Independent test validation

**Key Outcomes**:
- Initial viewport renders in <1 second (60% faster)
- Smooth 30+ fps scrolling throughout collection
- Memory usage stays <100MB for 1025 cards
- Zero breaking changes to existing components
- 80%+ code coverage with comprehensive tests

**Total Tasks**: 35 tasks across 3 user stories + setup/polish  
**Estimated Duration**: 5-7 days for experienced React developer

---

## Phase 1: Setup & Foundational Infrastructure

### Task Setup & Initialization

- [ ] T001 Create project structure per implementation plan, set up Git branches, verify all dependencies installed
  - Files: No new files, verify `package.json` and `pnpm-lock.yaml`
  - Dependencies: None
  - Acceptance: `pnpm install` succeeds, all tests pass on baseline

- [ ] T002 [P] Create `src/services/lazyRenderService.ts` skeleton with class declaration and constructor
  - Files: `src/services/lazyRenderService.ts`
  - Dependencies: None (T001)
  - Acceptance: File exists, TypeScript compiles, class instantiation works

- [ ] T003 [P] Create `src/hooks/useLazyRender.ts` skeleton with hook declaration
  - Files: `src/hooks/useLazyRender.ts`
  - Dependencies: None (T001)
  - Acceptance: File exists, TypeScript compiles, hook can be imported

- [ ] T004 [P] Create `src/components/SkeletonCard.tsx` with Chakra UI Skeleton placeholder
  - Files: `src/components/SkeletonCard.tsx`
  - Dependencies: T001
  - Acceptance: Component renders without error, dimensions are 140px × 180px, no custom CSS

- [ ] T005 Create `tests/unit/services/lazyRenderService.test.ts` test file skeleton
  - Files: `tests/unit/services/lazyRenderService.test.ts`
  - Dependencies: T002
  - Acceptance: Test file created, imports service correctly, test suite runs

- [ ] T006 Create `tests/unit/hooks/useLazyRender.test.ts` test file skeleton
  - Files: `tests/unit/hooks/useLazyRender.test.ts`
  - Dependencies: T003
  - Acceptance: Test file created, imports hook correctly, test suite runs

- [ ] T007 Create `tests/integration/lazy-loading-grid.test.jsx` integration test file skeleton
  - Files: `tests/integration/lazy-loading-grid.test.jsx`
  - Dependencies: T004
  - Acceptance: Test file created, can import components, test suite runs

---

## Phase 2: User Story 1 - Fast Initial Page Load (P1)

**User Story Goal**: When a user first visits the Pokemon collection site, they should see the initial viewport of Pokemon cards appear quickly without waiting for all 1025+ cards to render.

**Independent Test Criteria**:
- Initial viewport (20-30 cards) renders in <1 second
- Interactive elements (buttons) respond immediately
- Memory footprint for initial render <20MB
- No console errors or warnings on page load

**User Story 1 - Service Layer Implementation**

- [ ] T008 [US1] Implement `LazyRenderService.initialize()` method to detect IntersectionObserver support and create observer instance
  - Files: `src/services/lazyRenderService.ts`
  - Dependencies: T002
  - Acceptance: 
    - Feature detection works correctly
    - Observer created with correct config (rootMargin: '200px', threshold: 0)
    - Initial viewport cards identified
    - No IntersectionObserver errors on instantiation

- [ ] T009 [P] [US1] Implement `LazyRenderService.getVisibleIndices()` method to return Set of currently visible card indices
  - Files: `src/services/lazyRenderService.ts`
  - Dependencies: T008
  - Acceptance:
    - Returns Set<number> (not array)
    - O(1) lookup performance
    - Returns empty Set before initialization
    - Returns correct indices after initialization

- [ ] T010 [P] [US1] Implement IntersectionObserver callback with debounce logic (100ms) to batch intersection events
  - Files: `src/services/lazyRenderService.ts`
  - Dependencies: T008
  - Acceptance:
    - Multiple rapid intersection events batched into single update
    - Debounce delay is exactly 100ms
    - Visible indices set updated only once per batch
    - Event listeners properly attached to card elements

- [ ] T011 [P] [US1] Implement `CardRenderQueue` class to prioritize cards by viewport distance (immediate → upcoming → deferred)
  - Files: `src/services/lazyRenderService.ts`
  - Dependencies: T010
  - Acceptance:
    - Three priority buckets implemented (immediate, upcoming, deferred)
    - Viewport cards prioritized above buffer zone
    - Distance-based sorting functional
    - No duplicates across buckets

- [ ] T012 [US1] Implement `LazyRenderService.destroy()` cleanup method to disconnect observer and clear references
  - Files: `src/services/lazyRenderService.ts`
  - Dependencies: T008, T010
  - Acceptance:
    - Observer disconnected on destroy
    - All Sets cleared
    - Event listeners removed
    - Can be called multiple times safely (idempotent)

- [ ] T013 [US1] Implement event emitter pattern in LazyRenderService with `on()` and `off()` methods for 'visibleChanged' event
  - Files: `src/services/lazyRenderService.ts`
  - Dependencies: T012
  - Acceptance:
    - Event can be subscribed to with callback
    - Callback fired when visible indices change
    - Unsubscribe function returned from `on()`
    - Multiple subscribers supported

- [ ] T014 [US1] Write unit tests for LazyRenderService initialization, observer creation, and feature detection
  - Files: `tests/unit/services/lazyRenderService.test.ts`
  - Dependencies: T008, T013
  - Acceptance:
    - Test: observer created with correct config
    - Test: feature detection returns boolean
    - Test: graceful fallback when IntersectionObserver unavailable
    - Test: visible indices empty before cards observed
    - Coverage: >80% of initialization logic

**User Story 1 - Hook Layer Implementation**

- [ ] T015 [US1] Implement `useLazyRender` hook with container ref and items parameters, manage service lifecycle
  - Files: `src/hooks/useLazyRender.ts`
  - Dependencies: T003, T008, T013
  - Acceptance:
    - Hook accepts containerRef and items array
    - Service created and initialized on mount
    - Service destroyed on unmount
    - Hook returns visibleIndices Set
    - No memory leaks on unmount

- [ ] T016 [P] [US1] Implement visible indices state management in hook with Set data structure
  - Files: `src/hooks/useLazyRender.ts`
  - Dependencies: T015
  - Acceptance:
    - useState hook manages visible card indices
    - State updates when service emits 'visibleChanged' event
    - Initial state is empty Set
    - Re-renders only when visible set changes

- [ ] T017 [P] [US1] Implement lazy rendering threshold logic: <50 items render all, ≥50 items enable lazy rendering
  - Files: `src/hooks/useLazyRender.ts`
  - Dependencies: T016
  - Acceptance:
    - Threshold check on items.length change
    - If items.length < 50: all rendered immediately
    - If items.length ≥ 50: lazy rendering enabled
    - Threshold can be customized via options

- [ ] T018 [US1] Implement options parameter with defaults (bufferPx: 200, debounceMs: 100, lazyThreshold: 50)
  - Files: `src/hooks/useLazyRender.ts`
  - Dependencies: T017
  - Acceptance:
    - Options object optional (all defaults provided)
    - Partial options override defaults correctly
    - Config passed to LazyRenderService
    - TypeScript strict mode satisfied

- [ ] T019 [US1] Write unit tests for useLazyRender hook initialization, state management, and options
  - Files: `tests/unit/hooks/useLazyRender.test.ts`
  - Dependencies: T015, T018
  - Acceptance:
    - Test: hook initializes with items and ref
    - Test: service lifecycle managed correctly
    - Test: visible indices state updates on service event
    - Test: threshold logic works for <50 and ≥50 items
    - Test: options override defaults
    - Coverage: >80% of hook logic

**User Story 1 - Component Integration**

- [ ] T020 [US1] Enhance `LazyLoadingGrid` component to use `useLazyRender` hook instead of previous scroll detection
  - Files: `src/components/LazyLoadingGrid.tsx`
  - Dependencies: T015, T004
  - Acceptance:
    - Hook integrated into component
    - Previous scroll listeners removed
    - Children render function receives isVisible parameter
    - Skeleton shown for non-visible cards
    - Component accepts lazy prop to enable/disable

- [ ] T021 [P] [US1] Update `AvailableGrid` to use `LazyLoadingGrid` wrapper with lazy rendering enabled
  - Files: `src/components/AvailableGrid.tsx`
  - Dependencies: T020
  - Acceptance:
    - Component wraps grid children with LazyLoadingGrid
    - Passes props correctly to wrapper
    - No changes to PokemonCard usage
    - Responsive columns maintained

- [ ] T022 [P] [US1] Update `CollectionList` to use `LazyLoadingGrid` wrapper with lazy rendering enabled
  - Files: `src/components/CollectionList.tsx`
  - Dependencies: T020
  - Acceptance:
    - Component wraps grid children with LazyLoadingGrid
    - Passes props correctly to wrapper
    - No changes to PokemonCard usage
    - Status badges maintained

- [ ] T023 [P] [US1] Update `WishlistList` to use `LazyLoadingGrid` wrapper with lazy rendering enabled
  - Files: `src/components/WishlistList.tsx`
  - Dependencies: T020
  - Acceptance:
    - Component wraps grid children with LazyLoadingGrid
    - Passes props correctly to wrapper
    - No changes to PokemonCard usage
    - Visual indicators maintained

- [ ] T024 [US1] Write integration tests for initial page load performance and viewport rendering
  - Files: `tests/integration/lazy-loading-grid.test.jsx`
  - Dependencies: T020, T021, T022, T023
  - Acceptance:
    - Test: initial viewport renders in <1 second
    - Test: 20-30 cards visible on initial load
    - Test: interactive elements respond immediately
    - Test: skeleton cards shown for off-screen items
    - Performance profiling captures metrics

---

## Phase 2: User Story 2 - Smooth Scrolling Experience (P2)

**User Story Goal**: As a user scrolls through the Pokemon collection, cards should appear seamlessly just before they enter the viewport, creating a smooth browsing experience without visible loading gaps.

**Independent Test Criteria**:
- Cards render 200px before entering viewport (no visible gap)
- Scroll frame rate maintains ≥30 fps
- No stuttering or jank during continuous scrolling
- Focus remains stable on currently focused element

**User Story 2 - Scroll Performance Optimization**

- [ ] T025 [US2] Implement scroll event debouncing with 200ms buffer in resize handler to recalculate visible cards on window resize
  - Files: `src/services/lazyRenderService.ts`
  - Dependencies: T013
  - Acceptance:
    - Window resize events listened to
    - Resize handling debounced exactly 200ms
    - Visible card set recalculated after resize
    - No thrashing of DOM on rapid resizes

- [ ] T026 [P] [US2] Implement prioritized render queue processing to render viewport cards before buffer zone cards
  - Files: `src/services/lazyRenderService.ts`
  - Dependencies: T011, T025
  - Acceptance:
    - Immediate priority bucket rendered first
    - Upcoming priority bucket rendered second
    - Deferred bucket rendered last (non-blocking)
    - No render calls skipped
    - Maintains 30+ fps frame rate

- [ ] T027 [P] [US2] Implement React.memo on PokemonCard to prevent unnecessary re-renders (if not already applied)
  - Files: `src/components/PokemonCard.tsx`
  - Dependencies: None
  - Acceptance:
    - Verify existing React.memo wrapper
    - If missing: apply memo with custom comparison function
    - Props comparison logic correct
    - Re-renders only when pokemon data changes

- [ ] T028 [US2] Implement CSS containment on grid containers to isolate card layout calculations
  - Files: `src/components/LazyLoadingGrid.tsx`, `src/components/SkeletonCard.tsx`
  - Dependencies: T020, T004
  - Acceptance:
    - Box containers have `css={{ contain: 'layout paint' }}`
    - No custom CSS used (Chakra UI only)
    - Layout recalculation isolated to card container
    - Performance improvement measurable

- [ ] T029 [US2] Write integration tests for scroll performance, buffer zone rendering, and frame rate stability
  - Files: `tests/integration/lazy-loading-grid.test.jsx`
  - Dependencies: T025, T026
  - Acceptance:
    - Test: cards render before entering viewport (200px buffer)
    - Test: continuous scroll maintains ≥30 fps
    - Test: no visible loading gaps during scroll
    - Test: rapid scroll doesn't cause jank
    - Performance metrics logged for validation

---

## Phase 2: User Story 3 - Memory-Efficient Long Sessions (P3)

**User Story Goal**: Users who browse through large portions of the collection should experience consistent performance throughout their session without memory bloat or performance degradation.

**Independent Test Criteria**:
- Memory usage grows linearly, not exponentially
- Scroll performance doesn't degrade after scrolling 100+ cards
- No memory leaks on component unmount
- DOM element count stays reasonable

**User Story 3 - Memory Management**

- [ ] T030 [US3] Implement WeakMap tracking for card DOM elements to prevent memory leaks
  - Files: `src/services/lazyRenderService.ts`
  - Dependencies: T012
  - Acceptance:
    - WeakMap used for element → index mapping
    - Elements can be garbage collected
    - No strong references preventing cleanup
    - Memory usage stays stable during long sessions

- [ ] T031 [P] [US3] Implement performance monitoring with `performance.mark()` and `performance.measure()` for initial render time tracking
  - Files: `src/hooks/useLazyRender.ts`
  - Dependencies: T019
  - Acceptance:
    - Initial render time marked and measured
    - Metric available via `getStats()` method
    - Can be logged to console or analytics
    - No performance overhead from monitoring

- [ ] T032 [P] [US3] Implement memory usage estimation and tracking via `performance.memory` API
  - Files: `src/services/lazyRenderService.ts`
  - Dependencies: T031
  - Acceptance:
    - Memory estimate calculated from rendered card count
    - Estimate accuracy verified during testing
    - Stays <100MB for 1025 cards
    - Delta tracked between initial and after scrolling

- [ ] T033 [US3] Write integration tests for memory efficiency and long-session performance stability
  - Files: `tests/integration/lazy-loading-grid.test.jsx`
  - Dependencies: T030, T031, T032
  - Acceptance:
    - Test: memory grows linearly with cards rendered
    - Test: scroll performance consistent after 100+ cards
    - Test: no memory leaks on component unmount
    - Test: DOM element count reasonable (<1500)
    - Memory profiling captures baseline and delta

---

## Phase 3: Search Filter Integration & Edge Cases

- [ ] T034 [P] Integrate lazy rendering with search filter logic to reset visible set when search query changes
  - Files: `src/hooks/useLazyRender.ts`, `src/components/AvailableGrid.tsx` (if needed)
  - Dependencies: T017
  - Acceptance:
    - Search query change triggers reset
    - New result count evaluated against threshold
    - Visible set cleared for new search
    - Lazy rendering re-enables for ≥50 results
    - Test: search for "char" (22 results) renders all immediately
    - Test: search for "" (1025 results) enables lazy rendering

- [ ] T035 [P] Write edge case tests covering rapid scroll, resize, search, focus preservation
  - Files: `tests/integration/lazy-loading-grid.test.jsx`
  - Dependencies: T033, T034
  - Acceptance:
    - Test: rapid scroll jump doesn't cause jank
    - Test: window resize recalculates correctly
    - Test: search change transitions smoothly
    - Test: keyboard focus preserved during rendering
    - Test: accessibility announcements work (aria-live)
    - All edge cases from spec handled

---

## Phase 4: Validation & Polish

- [ ] T036 Cross-browser testing on Chrome, Firefox, Safari, Edge (verify IntersectionObserver support)
  - Files: None (manual testing)
  - Dependencies: T035
  - Acceptance:
    - Chrome 51+: fully functional
    - Firefox 55+: fully functional
    - Safari 12.1+: fully functional
    - Edge 79+: fully functional
    - IE11: graceful fallback (all cards render)
    - No console errors on any browser

- [ ] T037 Accessibility testing: screen reader compatibility, keyboard navigation, focus management
  - Files: None (manual testing + axe DevTools)
  - Dependencies: T035
  - Acceptance:
    - Screen reader announces card count updates
    - Keyboard Tab navigation works through all cards
    - Focus doesn't jump unexpectedly
    - ARIA attributes correct (aria-live on skeletons)
    - WCAG 2.1 AA contrast maintained
    - Touch targets 44px minimum

- [ ] T038 Performance profiling: validate <1s initial load, ≥30fps scroll, <100MB memory
  - Files: None (measurement via DevTools)
  - Dependencies: T035
  - Acceptance:
    - Initial render time measured: <1 second
    - Scroll frame rate sampled: ≥30 fps sustained
    - Memory delta measured: <50MB for 100+ cards
    - Lighthouse performance score: ≥85
    - No long tasks (>50ms)

- [ ] T039 Code review & linting: ensure all code passes ESLint, TypeScript strict mode, no warnings
  - Files: All implementation files
  - Dependencies: T035
  - Acceptance:
    - `pnpm lint` passes without errors or warnings
    - `tsc --noEmit` passes in strict mode
    - No `any` types used (except unavoidable cases)
    - Code follows constitution standards
    - Test coverage ≥80%

- [ ] T040 Documentation: update component README, add quickstart guide for future maintainers
  - Files: `README.md` (if exists), code comments
  - Dependencies: T039
  - Acceptance:
    - Hook API documented with examples
    - Service API documented with lifecycle
    - Component props documented
    - Edge cases and limitations noted
    - Performance tips included

---

## Task Dependency Graph

```
T001 (Setup)
  ├→ T002, T003, T004 (Skeleton structure) [P]
  │   ├→ T005, T006, T007 (Test files)
  │   │
  │   ├→ T008 (Service.initialize)
  │   │   ├→ T009 (Service.getVisibleIndices) [P]
  │   │   ├→ T010 (Intersection callback + debounce) [P]
  │   │   │   └→ T011 (CardRenderQueue) [P]
  │   │   │       ├→ T026 (Priority render queue) [P]
  │   │   ├→ T012 (Service.destroy)
  │   │   │   └→ T013 (Event emitter)
  │   │   │       └→ T025 (Resize debounce)
  │   │   └→ T014 (Service unit tests)
  │   │       └→ T019 (Hook unit tests)
  │   │
  │   ├→ T015 (useLazyRender hook)
  │   │   ├→ T016 (Visible indices state) [P]
  │   │   │   └→ T017 (Threshold logic) [P]
  │   │   │       └→ T018 (Options param)
  │   │   │           └→ T034 (Search integration) [P]
  │   │   └→ T019 (Hook unit tests)
  │   │
  │   ├→ T020 (LazyLoadingGrid enhancement)
  │   │   ├→ T021 (AvailableGrid) [P]
  │   │   ├→ T022 (CollectionList) [P]
  │   │   ├→ T023 (WishlistList) [P]
  │   │   └→ T024 (Integration tests - initial load)
  │   │       └→ T029 (Integration tests - scroll) [P]
  │   │           └→ T033 (Integration tests - memory) [P]
  │   │               └→ T035 (Edge case tests) [P]
  │   │
  │   ├→ T027 (PokemonCard.memo) [P]
  │   └→ T028 (CSS containment)
  │
  ├→ T030 (WeakMap cleanup) [P]
  ├→ T031 (Performance monitoring) [P]
  ├→ T032 (Memory tracking) [P]
  │
  └→ T036, T037, T038, T039, T040 (Validation & polish)
```

---

## Parallel Execution Opportunities

### Batch 1 (Days 1-2): Setup & Skeletons
**Can run in parallel**:
- T002, T003, T004 (create files)
- T005, T006, T007 (create test files)

### Batch 2 (Days 2-3): Service Layer
**Can run in parallel**:
- T008 (initialize)
- T014 (service tests)
- T015 (hook skeleton)

### Batch 3 (Days 3-4): State Management
**Can run in parallel**:
- T009, T010, T011 (service methods)
- T016, T017, T018 (hook state)
- T012, T013 (cleanup & events)

### Batch 4 (Days 4-5): Components
**Can run in parallel**:
- T020 (LazyLoadingGrid)
- T021, T022, T023 (consumer components)
- T027, T028 (optimizations)

### Batch 5 (Days 5-6): Integration & Testing
**Sequential** (dependent on previous batches):
- T024 (initial load tests)
- T025, T026, T029 (scroll tests)
- T030, T031, T032, T033 (memory tests)
- T034, T035 (edge cases)

### Batch 6 (Day 7): Validation
**Sequential** (after all implementation complete):
- T036 (cross-browser)
- T037 (accessibility)
- T038 (performance)
- T039 (code review)
- T040 (documentation)

---

## Success Metrics

### Phase 2 Completion Checklist
- [ ] All T001-T024 tasks completed
- [ ] Initial page load <1 second (verified)
- [ ] Interactive elements responsive on viewport cards
- [ ] Memory <20MB for initial render
- [ ] No console errors on page load
- [ ] Unit tests pass, 80%+ coverage

### Phase 3 Completion Checklist
- [ ] All T025-T035 tasks completed
- [ ] Scroll frame rate ≥30 fps sustained
- [ ] Buffer zone rendering working (cards appear before viewport)
- [ ] No visible loading gaps
- [ ] Memory grows linearly, <100MB total
- [ ] Search integration working (threshold-based)
- [ ] All edge cases handled
- [ ] Integration tests pass

### Phase 4 Completion Checklist
- [ ] All T036-T040 tasks completed
- [ ] Cross-browser testing passed
- [ ] Accessibility testing passed (WCAG AA)
- [ ] Performance profiling validated all metrics
- [ ] Code passes linting and type checking
- [ ] 80%+ test coverage achieved
- [ ] Documentation complete
- [ ] Ready for merge to main branch

---

## Estimated Timeline

| Phase | Tasks | Duration | Status |
|-------|-------|----------|--------|
| **Setup** | T001-T007 | 1 day | Ready |
| **User Story 1** | T008-T024 | 2 days | Blocked on setup |
| **User Story 2** | T025-T029 | 1 day | Blocked on US1 |
| **User Story 3** | T030-T033 | 1 day | Blocked on US2 |
| **Integration** | T034-T035 | 1 day | Blocked on US3 |
| **Validation** | T036-T040 | 1 day | Blocked on integration |
| **Total** | 40 tasks | **5-7 days** | Ready to start |

---

## Getting Started

1. **Review** the research.md, data-model.md, and quickstart.md files
2. **Start with** T001 (setup) - no dependencies
3. **Work through** tasks in order, respecting dependencies
4. **Use parallel batches** to accelerate when independent
5. **Run tests** after each task to validate correctness
6. **Check progress** against acceptance criteria

---

**Status**: Implementation plan is complete and detailed. Ready to assign tasks to developers and begin Phase 2 development.

**Next Command**: After assigning tasks, run implementation and execute tests as each task completes.
