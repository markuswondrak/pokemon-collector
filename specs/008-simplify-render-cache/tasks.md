# Feature: Simplify Render and Caching Mechanism

---

## Phase 1: Setup

- [X] T001 Create `src/services/imageCacheService.ts` and `src/hooks/useImageCache.ts` files
- [X] T002 [P] Install/verify dependencies: React 19, Chakra UI 3.30, Axios 1.13, Vite 7, Vitest 4.0 in `package.json`
- [X] T003 [P] Add image cache constants to `src/utils/constants.ts`
- [X] T004 [P] Add test stubs for new files in `tests/unit/` and `tests/contract/`

---

## Phase 2: Foundational

- [X] T005 Implement `ImageCacheService` skeleton in `src/services/imageCacheService.ts`
- [X] T006 Implement `useImageCache` hook skeleton in `src/hooks/useImageCache.ts`
- [X] T007 [P] Implement contract test for localStorage schema in `tests/contract/imageCacheSchema.test.ts`
- [X] T008 [P] Implement unit test stubs for `ImageCacheService` in `tests/unit/imageCacheService.test.ts`
- [X] T009 [P] Implement unit test stubs for `useImageCache` in `tests/unit/useImageCache.test.ts`

---

## Phase 3: [US1] View Available Pokémon (P1)

- [X] T010 [US1] Implement `get`, `save`, `delete`, `clear`, `invalidateOnVersionChange` in `src/services/imageCacheService.ts`
- [X] T011 [P] [US1] Implement LRU eviction and version invalidation logic in `src/services/imageCacheService.ts`
- [X] T012 [P] [US1] Implement all unit tests for `ImageCacheService` in `tests/unit/imageCacheService.test.ts`
- [X] T013 [US1] Implement `useImageCache` hook logic in `src/hooks/useImageCache.ts`
- [X] T014 [P] [US1] Implement all unit tests for `useImageCache` in `tests/unit/useImageCache.test.ts`
- [X] T015 [US1] Update `src/components/PokemonCard.tsx` to use `useImageCache` and IntersectionObserver
- [X] T016 [P] [US1] Implement integration test for viewport-based image loading in `tests/integration/viewport-image-loading.test.tsx`
- [X] T017 [P] [US1] Implement integration test for LRU cache eviction in `tests/integration/cache-eviction.test.tsx`

---

## Phase 4: [US2] Maintain Collection and Wishlist Data (P1)

- [X] T018 [US2] Verify `src/services/collectionStorage.ts` and related logic remain unchanged
- [X] T019 [P] [US2] Implement regression test for collection/wishlist persistence in `tests/integration/collection.us1.test.jsx`
- [X] T020 [US2] Validate that cache operations never touch collection/wishlist keys in `src/services/imageCacheService.ts`

---

## Phase 5: [US3] Simple Caching Policy (P1)

- [X] T021 [US3] Remove all lazy-loading logic from `src/components/AvailableGrid.tsx`, `CollectionList.tsx`, `WishlistList.tsx`
- [X] T022 [P] [US3] Delete `src/services/lazyRenderService.ts`, `src/hooks/useLazyRender.ts`, `src/components/LazyLoadingGrid.tsx`
- [X] T023 [US3] Remove all `LAZY_RENDER_*` constants from `src/utils/constants.ts`
- [X] T024 [P] [US3] Remove or update all tests for deleted components in `tests/unit/` and `tests/integration/`

---

## Final Phase: Polish & Cross-Cutting

- [X] T025 Refactor and clean up code for style, lint, and type safety across all touched files
- [X] T026 [P] Add/verify error handling and fallback UI for image loading in `PokemonCard.tsx`
- [ ] T027 [P] Ensure 80%+ test coverage for all new/changed code
- [X] T028 [P] Update documentation in `README.md` and feature docs as needed

---

### Dependencies

- Phase 1 → Phase 2 → [US1, US2, US3] (Phases 3-5 can run in parallel after foundational)
- [US1] must complete before [US3] (removal of old logic)
- [US2] is independent but must be regression-tested after [US1] changes

---

### Parallel Execution Examples

- T002, T003, T004 can run in parallel after T001
- T007, T008, T009 can run in parallel after T006
- T011, T012, T014, T016, T017 can run in parallel after T010/T013
- T019, T020 can run in parallel after T018

---

### Independent Test Criteria (per story)

- **US1**: Images load on-demand, cache, and display instantly on revisit; skeleton shown while loading; error state on failure
- **US2**: Collection/wishlist data persists across reloads and is never lost/evicted by cache
- **US3**: No lazy-loading logic remains; all images load on-demand only; LRU and version invalidation work

---

### MVP Scope

- Complete all tasks for [US1] (T010–T017) for a minimal, testable product increment

---

### Format Validation

All tasks follow strict checklist format:  
- Checkbox  
- Task ID (T001, T002, ...)  
- [P] if parallelizable  
- [USx] for user story phases  
- Description with file path(s)  

---

**Output path:** `specs/008-simplify-render-cache/tasks.md`
**Summary:**  
- **Total tasks:** 28  
- **Per user story:** US1: 8, US2: 3, US3: 4  
- **Parallel opportunities:** 12  
- **Independent test criteria:** Listed above  
- **MVP:** US1 tasks (T010–T017)  
- **Format:** All tasks conform to required checklist format
