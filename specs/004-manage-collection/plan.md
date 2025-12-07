# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement collection management functionality allowing users to mark Pokemon as "Caught" or "Wishlisted". This involves a new `useCollection` hook for state management persisted to LocalStorage, updating the `PokemonCard` with action buttons, and introducing a Tabbed interface to filter the grid into "Available", "Caught", and "Wishlist" views.

## Technical Context

**Language/Version**: TypeScript 5.9+
**Primary Dependencies**: React 19, Chakra UI v2.8+, Vite 7+
**Storage**: LocalStorage (Key: `pokemon-collector:collection`)
**Testing**: Vitest, React Testing Library
**Target Platform**: Web (PWA)
**Project Type**: Single Page Application
**Performance Goals**: State updates < 50ms, 60fps scrolling
**Constraints**: Offline-capable, LocalStorage limits
**Scale/Scope**: 1025 Pokemon, 3 distinct views

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Code Quality**: Compliant. New hook `useCollection` ensures separation of concerns.
- **Testing**: Compliant. Unit tests required for new hook and components.
- **UX**: Compliant. Uses Chakra UI `Tabs` and `Toast` for consistency.
- **Velocity**: Compliant. Reuses existing `LazyLoadingGrid`.
- **Development Standards**: Compliant. Follows project structure and naming conventions.

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
├── components/
│   ├── LazyLoadingGrid.tsx  # Update to support filtered lists
│   └── PokemonCard.tsx      # Update with action buttons
├── hooks/
│   └── useCollection.ts     # New hook for collection state
├── services/
│   └── storage/
│       └── localStorage.ts  # Update with new keys
└── types/
    └── index.ts             # Update with new types
```

**Structure Decision**: Option 1: Single project (Standard React App structure)

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
