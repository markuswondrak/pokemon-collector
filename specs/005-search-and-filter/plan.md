# Implementation Plan: Search & Filter

**Branch**: `005-search-and-filter` | **Date**: 2025-12-07 | **Spec**: [specs/005-search-and-filter/spec.md](spec.md)
**Input**: Feature specification from `specs/005-search-and-filter/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a sticky search bar and filter tabs (All, Caught, Wishlist) to allow users to filter the Pokemon list by name/ID and status. Filtering must be client-side, reactive, and debounced (300ms).

## Technical Context

**Language/Version**: TypeScript 5.9+
**Primary Dependencies**: React 19, Chakra UI v3.30+, react-virtuoso
**Storage**: Browser localStorage (for filter state persistence if needed, though not explicitly requested, spec implies session state)
**Testing**: Vitest (Unit & Integration), React Testing Library
**Target Platform**: Web (Browser)
**Project Type**: Web application (Single Page App)
**Performance Goals**: Search results update < 100ms
**Constraints**: Local filtering, Sticky UI, No external API calls for search
**Scale/Scope**: ~1025 Pokemon items

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Code Quality**: Will adhere to linting and formatting rules.
- [x] **Testing**: TDD will be used. Unit tests for filter logic and hooks. Integration tests for search interactions.
- [x] **UX Consistency**: Will use Chakra UI components. Sticky header pattern.
- [x] **Performance**: Client-side filtering of 1000 items is well within performance limits of modern JS engines. `react-virtuoso` will handle rendering performance.
- [x] **Styling**: Chakra UI for all components.

## Project Structure

### Documentation (this feature)

```text
specs/005-search-and-filter/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── SearchBar.tsx       # New component
│   ├── FilterTabs.tsx      # New component
│   └── PokemonList.tsx     # Update to support filtering props or context
├── hooks/
│   ├── usePokemonSearch.ts # New hook for search/filter logic
│   └── useDebounce.ts      # New utility hook
└── types/
    └── index.ts            # Update with FilterState types
```

**Structure Decision**: Adding new components for Search and Filter, and a dedicated hook to manage the filtering logic to keep `PokemonList` clean.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

N/A

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
