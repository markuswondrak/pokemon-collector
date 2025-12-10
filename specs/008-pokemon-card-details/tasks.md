---
description: "Task list for Pokemon Card Details feature"
---

# Tasks: Pokemon Card Details

**Input**: Design documents from `/specs/008-pokemon-card-details/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Tests**: Tests are included as per Constitution Check in plan.md ("Test-First", "Integration Testing").

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Verify project structure and dependencies in `package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T002 Update `PokemonRef` interface and add `PokemonType` type in `src/types/index.ts`
- [ ] T003 [P] Create `src/utils/typeColors.ts` with color mappings from research
- [ ] T004 [P] Create `src/utils/wikiUrl.ts` with URL generation logic from research

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Visual Identification of Pokemon Type (Priority: P1) 🎯 MVP

**Goal**: Display colored badges for Pokemon types on the card.

**Independent Test**: Verify badges appear on cards and match the Pokemon's type.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T005 [P] [US1] Create/Update unit test for `pokeApi` type fetching in `tests/unit/services/pokeApi.test.ts`
- [ ] T006 [P] [US1] Create unit test for `PokemonCard` badges in `tests/unit/components/PokemonCard.test.tsx`

### Implementation for User Story 1

- [ ] T007 [US1] Implement `fetchPokemonTypes` (inverted index strategy) in `src/services/api/pokeApi.ts`
- [ ] T008 [US1] Update `fetchPokemonList` to merge types in `src/services/api/pokeApi.ts`
- [ ] T009 [US1] Update `usePokemonIndex.ts` to handle new data structure
- [ ] T010 [US1] Update `PokemonCard.tsx` to display badges using `typeColors` util

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Accessing Detailed Pokemon Information (Priority: P2)

**Goal**: Click on Pokemon image to open Bulbapedia wiki page.

**Independent Test**: Verify clicking the image opens the correct wiki URL in a new tab.

### Tests for User Story 2 ⚠️

- [ ] T011 [P] [US2] Update unit test for `PokemonCard` wiki link in `tests/unit/components/PokemonCard.test.tsx`

### Implementation for User Story 2

- [ ] T012 [US2] Update `PokemonCard.tsx` to wrap image in link using `wikiUrl` util

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T013 Run full test suite `pnpm test` to ensure no regressions
- [ ] T014 Verify implementation against `quickstart.md` scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup
- **User Stories (Phase 3+)**: Depend on Foundational
- **Polish (Final Phase)**: Depends on all stories

### User Story Dependencies

- **User Story 1 (P1)**: Independent after Foundational.
- **User Story 2 (P2)**: Independent after Foundational (and uses `wikiUrl` from Foundational).

### Parallel Opportunities

- T003 (`typeColors.ts`) and T004 (`wikiUrl.ts`) can be done in parallel.
- T005 (`pokeApi` test) and T006 (`PokemonCard` test) can be done in parallel.
- T011 (US2 test) can be done while US1 is being implemented if resources allow.

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Foundational tasks (Types, Utils).
2. Implement Data Fetching (PokeApi changes).
3. Update UI (PokemonCard badges).
4. Verify badges appear.

### Increment (User Story 2)

1. Add Wiki Link logic to `PokemonCard`.
2. Verify link behavior.
