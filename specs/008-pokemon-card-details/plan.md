# Implementation Plan: Pokemon Card Details

**Branch**: `008-pokemon-card-details` | **Date**: 2025-12-10 | **Spec**: [specs/008-pokemon-card-details/spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-pokemon-card-details/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature adds elemental type badges (e.g., Fire, Water) to Pokemon cards in the collection view and makes the card image clickable, opening the corresponding Bulbapedia wiki page. The implementation involves updating the data model to include Pokemon types, efficiently fetching this data (likely via Type endpoints to avoid N+1 issues), and updating the `PokemonCard` UI component.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.9.3
**Primary Dependencies**: React 19.2.1, Vite 7.2.6, Chakra UI 3.30.0, react-icons 5.5.0
**Storage**: localStorage (via `src/services/storage/localStorage.ts`)
**Testing**: Vitest, React Testing Library
**Target Platform**: Web (Modern Browsers)
**Project Type**: Single project (Web Application)
**Performance Goals**: No >10% increase in page load. Efficient data fetching for 1000+ items.
**Constraints**: PokeAPI REST limitations (list endpoint doesn't provide types).
**Scale/Scope**: ~1300 Pokemon, ~20 Types.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Test-First**: Will write component tests for `PokemonCard` updates.
- **Integration Testing**: Will verify data fetching integration.
- **Simplicity**: Will use efficient fetching strategy (Type-based) instead of complex GraphQL setup if possible to avoid new dependencies, or minimal fetch extensions.
- **UX**: Non-disruptive changes.

## Project Structure

### Documentation (this feature)

```text
specs/008-pokemon-card-details/
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
│   └── PokemonCard.tsx       # Update to show badges and link
├── hooks/
│   └── usePokemonIndex.ts    # Update to fetch/merge type data
├── services/
│   └── api/
│       └── pokeApi.ts        # Update to fetch types
└── types/
    └── index.ts              # Update PokemonRef to include types
```

**Structure Decision**: enhance existing components and hooks. No new modules required.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Fetching Strategy Change | Need Types for list view | Fetching individual details triggers 1000+ requests (rate limit) |
