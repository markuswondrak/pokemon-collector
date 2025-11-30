# Implementation Plan: Pokemon Collection Organizer

**Branch**: `001-pokemon-collection` | **Date**: 2025-11-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-pokemon-collection/spec.md`

**Note**: This plan is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a web application to organize Pokemon collection with three grids (Collected, Wishlisted, Available), lazy-loaded from PokéAPI, persisted in browser localStorage, with search and atomic status transitions between any states. Technology: React 19 + TypeScript + Vite + Vitest. All constitutional principles satisfied: Code Quality First (strict TypeScript), Testing Standards (TDD via Vitest+RTL), UX Consistency (three-grid pattern), Fast Velocity (simple entities + components). No violations after Phase 1 design.

## Technical Context

**Language/Version**: TypeScript 5.9+ (strict mode enabled)  
**Primary Dependencies**: React 19, Vite 7+, Axios (HTTP client), Vitest + React Testing Library  
**Storage**: Browser localStorage (abstracted interface for future cloud migration)  
**Testing**: Vitest + React Testing Library with ESLint strict type checking  
**Target Platform**: Web browser (modern browsers supporting ES2020+, CSS Grid)  
**Project Type**: Single web application (React SPA)  
**Performance Goals**: 60 FPS grid scrolling, <500ms status change reflection, <1.5s initial load, <1s search results  
**Constraints**: Responsive design (320px-1920px+), offline-capable with localStorage, 1025 Pokemon max dataset  
**Scale/Scope**: Single-page app, 3 primary grids, 1025 Pokemon items, search + lazy loading + status management

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Principle I - Code Quality First**: ✅ COMPLIANT
- Strict TypeScript mode enforced
- ESLint with strict type checking configured
- Existing codebase has established patterns and structure
- No shortcuts planned

**Principle II - Testing Standards (NON-NEGOTIABLE)**: ✅ COMPLIANT
- Vitest + React Testing Library already in place
- Unit tests in `/tests/unit/`, integration tests in `/tests/integration/`, contract tests in `/tests/contract/`
- TDD approach will be enforced in implementation phase
- Coverage baseline: 80% minimum for critical paths

**Principle III - User Experience Consistency**: ✅ COMPLIANT
- Three-grid UI pattern is consistent and well-defined
- Action buttons have clear behavior (mark collected, add to wishlist, remove)
- Error messages and empty states defined in spec
- Loading states and transitions specified
- Responsive design with no hardcoded breakpoints respects mobile-to-desktop consistency

**Principle IV - Fast Development Velocity**: ✅ COMPLIANT
- Vite build tool: <5 minute builds expected
- React Testing Library enables fast iteration and refactoring
- localStorage persistence avoids backend complexity during MVP
- Feature scope is bounded (1025 items, 3 grids, search + lazy loading)
- Clear separation of concerns (services, hooks, components, models)

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/              # React components for UI
│   ├── App.tsx             # Main application container
│   ├── AvailableGrid.tsx    # Grid showing available (non-collected, non-wishlisted) Pokemon
│   ├── CollectionList.tsx   # Grid showing collected Pokemon
│   ├── LazyLoadingGrid.tsx  # Reusable lazy-loading grid wrapper
│   ├── PokemonCard.tsx      # Individual Pokemon card component
│   ├── PokemonSearch.tsx    # Search panel with input and lens button
│   └── WishlistList.tsx     # Grid showing wishlisted Pokemon
├── hooks/
│   └── useCollection.ts     # Custom hook managing Pokemon collection/wishlist state
├── models/
│   ├── Collection.ts        # Collection entity (domain model)
│   └── Pokemon.ts           # Pokemon entity (domain model)
├── services/
│   ├── collectionStorage.ts # localStorage persistence layer (abstraction interface)
│   ├── pokemonApi.ts        # PokéAPI integration (HTTP client)
│   └── pokemonService.ts    # Business logic for Pokemon operations
├── utils/
│   └── constants.ts         # Application constants (max Pokemon count, etc.)
├── styles/
│   ├── App.css
│   ├── components.css
│   └── index.css
└── main.tsx

tests/
├── contract/
│   └── pokemonApi.test.js   # PokéAPI contract verification
├── integration/
│   ├── collection.us1.test.jsx      # US1: Mark as collected
│   ├── lazy-loading-edge-cases.test.jsx  # US3 lazy loading edge cases
│   ├── us3-three-grids.test.jsx     # US3: Three grids visualization
│   └── wishlist.us2.test.jsx        # US2: Add to wishlist
└── unit/
    ├── components/          # Component unit tests
    ├── hooks/               # Hook unit tests
    ├── models/              # Entity unit tests
    └── services/            # Service unit tests
```

**Structure Decision**: Selected Option 1 (Single project) - this is a web application (React SPA) with frontend-only scope. No backend service needed during MVP; persistence via localStorage. Test structure already supports unit, integration, and contract testing. Existing directory structure is well-organized and follows best practices.

## Complexity Tracking

> **Status**: No Constitution violations. All four principles (Code Quality, Testing, UX Consistency, Development Velocity) are satisfied by the current architecture and planned approach.

| Principle | Status | Notes |
|-----------|--------|-------|
| Code Quality First | ✅ SATISFIED | Strict TypeScript, ESLint enforcement, clean component/service separation |
| Testing Standards | ✅ SATISFIED | TDD mandatory via Vitest + RTL, 80% coverage baseline, test structure in place |
| UX Consistency | ✅ SATISFIED | Three-grid pattern, consistent UI patterns, error/loading states defined |
| Development Velocity | ✅ SATISFIED | Vite <5min builds, clear scope (1025 items, 3 grids, search+lazy load), localStorage avoids backend |

## Post-Design Constitution Re-check

*GATE RE-EVALUATION: After Phase 1 Design Completion*

### Design Artifacts Summary

- **data-model.md**: Complete entity definitions (Pokemon, Collection, Wishlist) with validation, state transitions, and invariants
- **contracts/api-contracts.yaml**: OpenAPI 3.0 specification for PokéAPI integration and internal service contracts
- **research.md**: All clarifications resolved; no open questions remain
- **quickstart.md**: Developer setup guide and architecture overview

### Principle I - Code Quality First: ✅ STILL COMPLIANT

**Design Verification**:
- Entity models have strict TypeScript interfaces with non-null assertions (data-model.md)
- Validation rules explicitly defined for each entity (Pokemon: id ∈ [1,1025], imageUrl HTTPS, XOR status states)
- Invariants documented: Collection/Wishlist mutual exclusion (FR-003, FR-004)
- Service layer abstraction for persistence (collectionStorage.ts) enables clean testing and implementation
- Component hierarchy follows React best practices (LazyLoadingGrid reusable, PokemonCard composable)

**Quality Impact**: ✅ ENHANCED - Design adds formal contracts and validation rules that strengthen code clarity

### Principle II - Testing Standards (NON-NEGOTIABLE): ✅ STILL COMPLIANT

**Design Verification**:
- Test structure in place: unit/ (models, services, components, hooks), integration/ (US1-4), contract/ (PokéAPI)
- Entity validation rules are testable: each validation rule → at least one test case
- State transitions fully specified (6 transitions × 2 directions = 12 test scenarios minimum)
- Integration tests map directly to user stories: collection.us1.test.jsx, wishlist.us2.test.jsx, us3-three-grids.test.jsx, lazy-loading-edge-cases.test.jsx
- TDD enforced: design-time validation rules → red-green-refactor cycle in implementation phase

**Testing Coverage Projections**:
- Models (Pokemon, Collection, Wishlist): 100% coverage (simple data structures + invariants)
- Services (collectionStorage, pokemonService, pokemonApi): 85%+ (includes error paths, PokéAPI failures)
- Components (grids, card, search): 80%+ (UI interactions, loading states)
- Hooks (useCollection): 90%+ (state management, transitions)

**Quality Impact**: ✅ MAINTAINED - Design enables comprehensive TDD with clear test scenarios

### Principle III - User Experience Consistency: ✅ STILL COMPLIANT

**Design Verification**:
- Three-grid UI pattern is internally consistent: same card component (PokemonCard.tsx), same lazy-loading wrapper (LazyLoadingGrid.tsx)
- State transitions preserve UX consistency: direct transitions (Collected ↔ Wishlisted) without artificial intermediate states
- Error handling consistent: FR-022 (placeholder + retry link) for all image failures across all grids
- Loading states consistent: FR-019a (spinner/skeleton on card, buttons disabled) during any status transition
- Search experience consistent: FR-010c (centered "No Pokemon found matching '{query}'" message when zero results)
- Responsive design uses CSS Grid auto-fit (no hardcoded breakpoints): adapts 320px-1920px+ fluidly

**Quality Impact**: ✅ REINFORCED - Design formally specifies consistency patterns and error states

### Principle IV - Fast Development Velocity: ✅ STILL COMPLIANT

**Design Verification**:
- Data model entities are simple DTOs (no complex inheritance or patterns): implement ~50 lines of code per entity
- State transitions are atomic operations: no multi-step or async-heavy state management required
- Services abstract PokéAPI and localStorage: implementation is straightforward HTTP + localStorage APIs
- Components are compositional: LazyLoadingGrid reused for all 3 grids (DRY principle), PokemonCard handles single item UI
- API contracts (contracts/api-contracts.yaml) are well-defined: no ambiguity during implementation
- Testing is straightforward: Vitest + RTL are fast and simple; no flaky async patterns needed

**Build & Deploy Estimates**:
- Initial implementation: ~3-4 days (4 entities + 7 components + 3 services + 8 integration tests)
- Vite build: <1 minute (no dependencies beyond React + Axios)
- Hot Module Replacement (HMR): <500ms refresh cycles during development

**Quality Impact**: ✅ OPTIMIZED - Design simplicity and clarity accelerate development velocity

### Conclusion

✅ **ALL GATES PASS POST-DESIGN**

All four constitutional principles remain **FULLY SATISFIED** after Phase 1 design. Design artifacts are concrete, testable, and implementation-ready. No violations or trade-offs introduced. Ready to proceed to Phase 2: Implementation.
