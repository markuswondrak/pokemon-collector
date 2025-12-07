# Tasks: Manage Collection

**Feature Branch**: `004-manage-collection`
**Status**: Draft

## Phase 1: Setup
*Project initialization and configuration*

- [x] T001 Update `src/types/index.ts` with `UserCollection` interface and `PokemonState` enum
- [x] T002 Update `src/services/storage/localStorage.ts` to include `pokemon-collector:collection` key

## Phase 2: Foundational
*Blocking prerequisites for all user stories*

- [x] T003 Create `src/hooks/useCollection.ts` with basic state management and persistence logic
- [x] T004 Create unit tests for `useCollection` hook in `tests/unit/hooks/useCollection.test.ts`
- [x] T005 [P] Update `src/components/PokemonCard.tsx` to accept `isCaught`, `isWishlisted`, and toggle handlers props
- [x] T006 [P] Create unit tests for updated `PokemonCard` props in `tests/unit/components/PokemonCard.test.tsx`

## Phase 3: User Story 1 - Mark as Caught (P1)
*As a collector, I want to mark Pokemon I have caught so I can track my progress.*

- [x] T007 [US1] Implement "Catch" toggle logic in `src/hooks/useCollection.ts` (add/remove from caught list)
- [x] T008 [US1] Add "Catch" button (Pokeball icon) to `src/components/PokemonCard.tsx`
- [x] T009 [US1] Integrate `useCollection` in `src/App.tsx` and pass caught state to grid
- [x] T010 [US1] Verify persistence of caught state in `tests/unit/hooks/useCollection.test.ts`

## Phase 4: User Story 2 - Manage Wishlist (P2)
*As a collector, I want to mark Pokemon I want to find so I can focus my efforts.*

- [x] T011 [US2] Implement "Wishlist" toggle logic in `src/hooks/useCollection.ts` (add/remove from wishlist)
- [x] T012 [US2] Implement mutual exclusivity logic (Caught vs Wishlist) in `src/hooks/useCollection.ts`
- [x] T013 [US2] Add "Wishlist" button (Heart icon) to `src/components/PokemonCard.tsx`
- [x] T014 [US2] Disable "Wishlist" button when Pokemon is caught in `src/components/PokemonCard.tsx`
- [x] T015 [US2] Verify mutual exclusivity rules in `tests/unit/hooks/useCollection.test.ts`

## Phase 5: User Story 3 - View Collection Grids (P2)
*As a user, I want to see my caught Pokemon and wishlist in separate groups.*

- [x] T016 [US3] Implement filtering logic (Available, Caught, Wishlist) in `src/App.tsx`
- [x] T017 [US3] Replace single grid with Chakra UI `Tabs` in `src/App.tsx` for the 3 views
- [x] T018 [US3] Implement Toast notification with "Undo" action in `src/App.tsx` when items move between lists
- [x] T019 [US3] Update `src/components/LazyLoadingGrid.tsx` to handle empty states gracefully (optional polish)

## Phase 6: Polish & Cross-Cutting Concerns
*Final cleanup and edge case handling*

- [x] T020 Add error handling for LocalStorage quota exceeded in `src/hooks/useCollection.ts`
- [x] T021 Ensure responsive layout for Tabs and new Card buttons in `src/App.tsx` and `src/components/PokemonCard.tsx`
- [x] T022 Run full test suite to ensure no regressions

## Dependencies

- **Phase 1 & 2** must be completed before **Phase 3, 4, 5**.
- **Phase 3 (Catch)** and **Phase 4 (Wishlist)** can be developed in parallel after Phase 2, but Phase 4 depends on Phase 3 logic for mutual exclusivity.
- **Phase 5 (Grids)** depends on the state logic from Phase 3 & 4.

## Parallel Execution Examples

- **Developer A**: Works on T003, T004 (Hook logic)
- **Developer B**: Works on T005, T006 (UI Components)

## Implementation Strategy

1.  **MVP (Story 1)**: Get the "Catch" functionality working first. This proves the storage and state logic.
2.  **Enhancement (Story 2)**: Add Wishlist and the complex interaction rules (mutual exclusivity).
3.  **UX (Story 3)**: Finally, split the view into tabs to organize the now-manageable collection.
