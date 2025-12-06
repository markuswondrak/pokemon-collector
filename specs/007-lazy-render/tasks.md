# Task Execution Plan: Lazy Card Rendering (007-lazy-render)

**Feature**: Lazy Card Rendering | **Branch**: `007-lazy-render`  
**Phase**: 2 (Implementation) | **Date**: 2025-12-05  
**Status**: Ready for development

Checklist format: `- [ ] T### [P?] [US?] Description with file path`

---

## Phase 1: Setup (Shared Infrastructure)

- [x] T001 Verify baseline tooling (`pnpm install`, `pnpm lint`) and confirm vitest environment in repository root
- [x] T002 [P] Capture shared constants (buffer size 200px, batch sizes 20-30, IntersectionObserver threshold) in `src/utils/constants.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

- [x] T003 Implement in-memory API response cache singleton in `src/services/pokemonApi.ts` with session-scoped lifecycle
- [x] T004 [P] Add request deduplication to in-flight API calls in `src/services/pokemonApi.ts` to prevent duplicate fetches
- [x] T005 [P] Implement version-aware names cache loader in `src/services/nameRegistry.ts` with invalidation on app version change
- [x] T006 [P] Create lazy render service with IntersectionObserver orchestration in `src/services/lazyRenderService.ts`
- [x] T007 Wire version-aware cache invalidation through constants consumed by services in `src/utils/constants.ts`

---

## Phase 3: User Story 1 - Fast Initial Page Load (Priority: P1)

**Goal**: Initial viewport renders in <1 second; each external API endpoint called once per session; names cache reused immediately when valid.

**Independent Test**: Cold-load the page; each endpoint is requested once; search becomes interactive within 0.5s when names cache is valid; initial viewport cards render before other content.

### User Story 1 Implementation Tasks

- [x] T008 [P] [US1] Implement `useLazyRender` hook in `src/hooks/useLazyRender.ts` with IntersectionObserver initialization and visible card index tracking
- [x] T009 [P] [US1] Create viewport calculation service in `src/services/lazyRenderService.ts` to determine visible card indices based on scroll position
- [x] T010 [P] [US1] Route Pokemon list/detail fetches through API response cache in `src/services/pokemonService.ts` to enable single-call-per-endpoint
- [x] T011 [US1] Integrate `useLazyRender` hook into `src/components/LazyLoadingGrid.tsx` to conditionally render cards based on visibility
- [x] T012 [P] [US1] Ensure `src/components/AvailableGrid.tsx` uses LazyLoadingGrid with cached data; skip fetch for cached list/detail
- [x] T013 [P] [US1] Reuse names cache and apply version-aware refresh in `src/services/pokemonService.ts` for search initialization
- [x] T014 [US1] Create SkeletonCard placeholder in `src/components/SkeletonCard.tsx` using Chakra UI Skeleton with fixed card dimensions
- [x] T015 [P] [US1] Render skeleton placeholders for non-visible cards in `src/components/LazyLoadingGrid.tsx` to reserve layout space
- [x] T016 [US1] Implement initial render time measurement in `src/hooks/useLazyRender.ts` and expose via hook return (target: <1s)
- [x] T017 [P] [US1] Cover API cache initialization and single-call logic in `tests/unit/services/pokemonApi.test.ts`
- [x] T018 [P] [US1] Cover LazyRenderService viewport calculations in `tests/unit/services/lazyRenderService.test.ts`
- [x] T019 [US1] Cover useLazyRender hook with initial load scenario in `tests/unit/hooks/useLazyRender.test.tsx`
- [x] T020 [US1] Verify single API call per endpoint and initial viewport render <1s in `tests/integration/lazy-loading-grid.test.jsx`

---

## Phase 4: User Story 2 - Smooth Scrolling Experience (Priority: P2)

**Goal**: Scrolling stays smooth (≥30fps); cards appear 200px before viewport; revisited cards reuse cache without refetch.

**Independent Test**: Scroll down then up; no additional API requests for revisited Pokemon; frame rate maintained ≥30fps; no visible loading gaps.

### User Story 2 Implementation Tasks

- [ ] T021 [P] [US2] Implement intersection event batching in `src/hooks/useLazyRender.ts` to group multiple events before state update (debounce 100ms)
- [ ] T022 [P] [US2] Add buffer zone pre-rendering (200px) in `src/services/lazyRenderService.ts` to prevent visible loading gaps on scroll
- [ ] T023 [P] [US2] Implement render queue prioritization in `src/services/lazyRenderService.ts` to prioritize viewport over buffer zone cards
- [ ] T024 [US2] Prevent duplicate fetch triggers for re-entry cards in `src/services/pokemonService.ts` by checking cache before fetch
- [ ] T025 [P] [US2] Add scroll performance monitoring to `src/hooks/useLazyRender.ts` to measure and expose frame rate
- [ ] T026 [P] [US2] Cover intersection batching and buffer zone logic in `tests/unit/services/lazyRenderService.test.ts`
- [ ] T027 [US2] Cover cache hit behavior for revisited cards in `tests/unit/services/pokemonService.test.ts`
- [ ] T028 [P] [US2] Validate revisit-no-refetch and ≥30fps scroll in `tests/integration/lazy-loading-grid.test.jsx`

---

## Phase 5: User Story 3 - Memory-Efficient Long Sessions (Priority: P3)

**Goal**: Long sessions remain stable; caches stay fresh per version; memory grows linearly not exponentially.

**Independent Test**: Browse 500+ Pokemon; memory increases linearly; names cache refreshes exactly once on version change; no stale data.

### User Story 3 Implementation Tasks

- [ ] T029 [P] [US3] Implement cache invalidation on app version change in `src/services/pokemonApi.ts` (check constant and clear if version mismatch)
- [ ] T030 [P] [US3] Implement cache invalidation on app version change in `src/services/nameRegistry.ts` (single refresh, then reuse)
- [ ] T031 [US3] Implement cleanup on component unmount in `src/hooks/useLazyRender.ts` (disconnect observer, clear visible indices)
- [ ] T032 [P] [US3] Ensure DOM elements stay mounted (never unmount) in `src/components/LazyLoadingGrid.tsx` to preserve scroll position
- [ ] T033 [US3] Verify no memory leaks from observer in `src/services/lazyRenderService.ts` (disconnect on cleanup)
- [ ] T034 [P] [US3] Add long-session memory monitoring in `tests/integration/lazy-loading-grid.test.jsx` (500+ cards, linear growth)
- [ ] T035 [P] [US3] Cover cache invalidation on version change in `tests/unit/services/pokemonApi.test.ts` and `tests/unit/services/nameRegistry.test.ts`

---

## Final Phase: Polish & Cross-Cutting Concerns

- [ ] T036 Run regression checks: `pnpm test --run tests/integration/lazy-loading-grid.test.jsx tests/integration/search-performance.test.jsx`
- [ ] T037 [P] Verify accessibility: screen reader announces updates, keyboard Tab works, focus stable in `tests/integration/a11y-search.test.jsx`
- [ ] T038 [P] Performance profiling: validate <1s initial load, ≥30fps scroll, <100MB memory via DevTools (measurements in research.md)
- [ ] T039 Code review & linting: ensure all code passes `pnpm lint`, `tsc --noEmit`, no warnings in implementation files
- [ ] T040 [P] Update `specs/007-lazy-render/quickstart.md` with caching behavior, version rules, and examples for future maintainers
- [ ] T041 [P] Update `specs/007-lazy-render/research.md` with final cache strategy, risks, and performance findings
- [ ] T042 Mark feature complete: update `PHASE4_COMPLETION.md` with final status, test results, and deployment notes

---

## Task Dependency Graph

```
T001 (Setup: tooling)
  ↓
T002 (Setup: constants)
  ↓
T003-T007 (Foundational: APIs, cache, service)
  ↓
T008-T020 (US1: Fast Load) → Independent test ✓
  ↓
T021-T028 (US2: Smooth Scroll) → Independent test ✓
  ↓
T029-T035 (US3: Memory Efficient) → Independent test ✓
  ↓
T036-T042 (Polish & Validation) → MVP + Enhancements complete
```

---

## Parallel Execution Examples

### Phase 2 (Foundational)
- **Batch 1**: T003, T004, T005 can run in parallel (different services, no dependencies)
- **Batch 2**: T006, T007 run after Batch 1 (T006 depends on constants from T002, T007 wires the invalidation)

### Phase 3 (US1)
- **Batch 1**: T008, T009 run in parallel (hook and service, no dependencies yet)
- **Batch 2**: T010, T012, T013 run in parallel (pokemonService methods, all depend on foundational cache from T003-T004)
- **Batch 3**: T014, T015 run in parallel (SkeletonCard component and LazyLoadingGrid integration)
- **Batch 4**: T016 (measurement) runs after T008 hook is done
- **Batch 5**: T017, T018, T019 run in parallel (unit tests for each service/hook)
- **Batch 6**: T020 (integration test) runs after T017-T019 pass

### Phase 4 (US2)
- **Batch 1**: T021, T022, T023 run in parallel (all in lazyRenderService)
- **Batch 2**: T024 (pokemonService) can start once T010 done
- **Batch 3**: T025, T026, T027 run in parallel (monitoring and tests)
- **Batch 4**: T028 (integration) runs after T025-T027 pass

### Phase 3 & 4 Testing in Parallel
- Unit tests (T017-T019, T026-T027) can run while Phase 4 implementation proceeds
- Integration tests (T020, T028) depend on respective implementation phases

---

## Implementation Strategy

**MVP Scope (US1 - Fast Initial Page Load)**:
1. Setup (T001-T002) establishes baseline and constants
2. Foundational (T003-T007) implements API caching and service layer
3. US1 (T008-T020) implements lazy rendering, cache reuse, and initial load optimization
4. **MVP Test Gate**: T020 integration test must pass single-endpoint-per-session and <1s initial viewport

**Incremental Delivery**:
1. **US1 Complete** → Users see fast initial page load and single API calls per endpoint
2. **US2 Addition** → Users experience smooth scrolling with pre-rendered buffer zone and no refetches on revisit
3. **US3 Addition** → Users enjoy stable performance in long sessions with version-aware cache invalidation
4. **Polish Phase** → Accessibility validated, performance verified, documentation complete

**Testing Strategy**:
- Unit tests (T017-T019, T026-T027, T035) validate individual service behavior in isolation
- Integration tests (T020, T028, T034) validate end-to-end flows and performance metrics
- Accessibility tests (T037) validate WCAG 2.1 AA compliance and keyboard navigation
- Performance profiling (T038) captures real-world metrics (DevTools measurements)

---

## Success Criteria Summary

| Criterion | Target | Validation Task |
|-----------|--------|-----------------|
| Initial viewport render | <1s | T016, T020 |
| Scroll frame rate | ≥30fps | T025, T028 |
| Single API call per endpoint | 1 call/session | T017, T020 |
| Names cache reuse | <0.5s search with cache | T020 |
| Memory growth | Linear (500+ cards) | T034 |
| Cache invalidation | 1 refresh per version change | T035 |
| Accessibility | WCAG 2.1 AA, Tab navigation | T037 |
| Linting & TypeScript | Zero errors, strict mode | T039 |

---

## File Changes Summary

### New Files
- `src/services/lazyRenderService.ts` — Intersection orchestration & viewport calculations
- `src/hooks/useLazyRender.ts` — Core hook for lazy rendering management
- `src/components/SkeletonCard.tsx` — Animated placeholder for unloaded cards
- Tests under `tests/unit/` and `tests/integration/` for new services and hooks

### Modified Files
- `src/services/pokemonApi.ts` — Add API cache singleton and deduplication
- `src/services/pokemonService.ts` — Route fetches through cache, wire version invalidation
- `src/services/nameRegistry.ts` — Version-aware cache with single refresh on version change
- `src/components/LazyLoadingGrid.tsx` — Integrate useLazyRender hook, render skeletons
- `src/components/AvailableGrid.tsx` — Use cached data, skip redundant fetches
- `src/utils/constants.ts` — Add shared constants for buffer size, batch sizes, thresholds
- `specs/007-lazy-render/quickstart.md` — Add caching behavior and version rules
- `specs/007-lazy-render/research.md` — Document final cache strategy and findings

### No Changes
- `src/components/PokemonCard.tsx` — Render behavior unchanged
- `src/components/CollectionList.tsx`, `src/components/WishlistList.tsx` — Can use same LazyLoadingGrid pattern
- `src/styles/theme.ts` — No theme changes needed

---

## Notes for Implementers

1. **API Caching**: Session-scoped caches are in-memory only. They clear on page reload (expected). No localStorage involvement beyond feature 005's names cache.

2. **Version Invalidation**: Check `import { APP_VERSION } from 'src/utils/constants'` on mount and on periodic checks (if needed). When version changes, clear API caches and refresh names cache exactly once.

3. **IntersectionObserver Fallback**: If browser doesn't support IntersectionObserver, `useLazyRender` should return all items as visible (graceful degradation).

4. **Skeleton Sizing**: SkeletonCard must match PokemonCard dimensions exactly to prevent layout shift.

5. **Memory Monitoring**: Use Chrome DevTools Memory Profiler during development to validate linear growth. Run tests/integration/lazy-loading-grid.test.jsx with memory monitoring.

6. **Accessibility**: Ensure aria-live regions announce card count changes. Keyboard Tab must skip skeleton cards and only focus rendered cards.

---

## Estimated Effort

| Phase | Task Count | Estimated Hours |
|-------|-----------|-----------------|
| Setup | 2 | 0.5 |
| Foundational | 5 | 4 |
| US1 | 13 | 8 |
| US2 | 8 | 6 |
| US3 | 7 | 4 |
| Polish | 7 | 3 |
| **Total** | **42** | **25.5** |

**MVP (US1)**: 12.5 hours (Setup + Foundational + US1 with tests)

---

## References

- **Spec**: `/specs/007-lazy-render/spec.md` (user stories, requirements, success criteria)
- **Plan**: `/specs/007-lazy-render/plan.md` (tech stack, project structure, constitution check)
- **Data Model**: `/specs/007-lazy-render/data-model.md` (entities: Viewport, BufferZone, CardRenderQueue, VisibleCardSet)
- **Research**: `/specs/007-lazy-render/research.md` (IntersectionObserver rationale, rendering batching, memory strategy)
- **Contracts**: `/specs/007-lazy-render/contracts/hook-service-component.md` (API signatures for hook, services, components)
- **Quickstart**: `/specs/007-lazy-render/quickstart.md` (test scenarios, setup guide)
