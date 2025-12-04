# Tasks: Modern Card Actions

**Feature**: Modern Card Actions
**Status**: Completed

## Phase 1: Setup
- [x] T001 Install `react-icons` dependency in `package.json`

## Phase 2: Foundational
- [x] T002 [P] Verify `react-icons` installation by checking `node_modules` or `package.json`

## Phase 3: User Story 1 - Quick Collect Action (P1)
**Goal**: Replace text buttons with icon buttons for the primary "Collect" action.
**Independent Test**: Click the Pokeball icon on an available card; verify it moves to collection.

- [x] T003 [US1] Import `TbPokeball` from `react-icons/tb` in `src/components/PokemonCard.tsx`
- [x] T004 [US1] Create action bar container (HStack) at bottom of card in `src/components/PokemonCard.tsx`
- [x] T005 [US1] Implement "Collect" `IconButton` with `TbPokeball` and `Tooltip` in `src/components/PokemonCard.tsx`

## Phase 4: User Story 2 - Wishlist Toggle (P2)
**Goal**: Implement heart icon toggle for wishlist.
**Independent Test**: Click heart icon; verify toggle between outline and filled states.

- [x] T006 [US2] Import `FaHeart` and `FaRegHeart` from `react-icons/fa` in `src/components/PokemonCard.tsx`
- [x] T007 [US2] Implement "Wishlist" `IconButton` with conditional icon rendering in `src/components/PokemonCard.tsx`
- [x] T008 [US2] Implement disabled state logic for Wishlist button when `collected` is true in `src/components/PokemonCard.tsx`

## Phase 5: User Story 3 - Remove from Collection (P3)
**Goal**: Provide a way to remove items using a distinct icon state.
**Independent Test**: On a collected card, click the "Remove" icon; verify item is removed.

- [x] T009 [US3] Import `TbPokeballOff` (or `FaTrash` as fallback) in `src/components/PokemonCard.tsx`
- [x] T010 [US3] Implement "Remove" state logic replacing the "Collect" button when `collected` is true in `src/components/PokemonCard.tsx`

## Phase 6: Polish & Cross-Cutting Concerns
- [x] T011 Verify touch target sizes (min 44px) and adjust padding/margins in `src/components/PokemonCard.tsx`
- [x] T012 Verify `aria-label` attributes and keyboard focus rings for all buttons in `src/components/PokemonCard.tsx`
- [x] T013 Ensure consistent icon sizing and alignment across all states in `src/components/PokemonCard.tsx`

## Phase 7: Visual Adjustments (New Requirements)
**Goal**: Ensure visual consistency (black icons on white) and fix tooltip positioning.
**Independent Test**: Hover over icons to verify no layout shift; check all icons are black on white.

- [x] T014 Update all action buttons to use `variant="ghost"` or `variant="outline"` with black icons and white background in `src/components/PokemonCard.tsx`
- [x] T015 Verify and fix tooltip positioning to ensure no layout shift occurs on hover in `src/components/PokemonCard.tsx`

## Dependencies
1. T001 (Setup) -> All other tasks
2. T004 (Container) -> T005, T007
3. T005 (Collect) -> T010 (Remove state depends on Collect button existence)
4. T014, T015 -> Depend on all previous UI implementation tasks

## Parallel Execution Examples
- T006 (Import Heart Icons) can be done alongside T003 (Import Pokeball Icons)
- T007 (Wishlist UI) can be implemented while T005 (Collect UI) is being tested

## Implementation Strategy
We will first install the necessary library. Then, we will modify the `PokemonCard` component incrementally, starting with the layout container, then the primary Collect action, followed by the Wishlist action, and finally the Remove state. We will verify accessibility and responsiveness at the end. Finally, we will apply the visual adjustments and tooltip fixes required by the updated specification.
