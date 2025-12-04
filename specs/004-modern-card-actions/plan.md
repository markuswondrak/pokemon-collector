# Implementation Plan: Modern Card Actions

**Branch**: `004-modern-card-actions` | **Date**: 2025-12-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-modern-card-actions/spec.md`

## Summary

Replace text-based action buttons on `PokemonCard` with modern, icon-based buttons (Collect, Wishlist, Remove). Ensure consistent visual style (black icons on white background) and non-intrusive tooltips.

## Technical Context

**Language/Version**: TypeScript 5.9+
**Primary Dependencies**: React 19, Chakra UI v3+, react-icons
**Storage**: Browser localStorage
**Testing**: Vitest, React Testing Library
**Target Platform**: Web (Browser)
**Project Type**: Web application
**Performance Goals**: < 5 min build time, < 350ms search response
**Constraints**: 140px card width, WCAG 2.1 AA accessibility
**Scale/Scope**: 1025 Pokemon

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Code Quality**: Linting and formatting enforced.
- **Testing**: TDD with 80% coverage. Tests must use `--run`.
- **UX Consistency**: Using Chakra UI components.
- **Styling**: Using Chakra UI `theme.ts` and components (no custom CSS).

## Project Structure

### Documentation (this feature)

```text
specs/004-modern-card-actions/
├── plan.md              # This file
├── research.md          # Icon selection and tooltip strategy
├── data-model.md        # Component state definition
├── quickstart.md        # Usage guide
├── contracts/           # Component props contract
└── tasks.md             # Implementation tasks
```

### Source Code (repository root)

```text
src/
├── components/
│   └── PokemonCard.tsx  # Updated component
```

**Structure Decision**: Single project structure.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

## Phases

### Phase 0: Outline & Research

1. **Extract unknowns**:
   - Icon library selection (`react-icons`).
   - Tooltip positioning in Chakra UI v3 (`Tooltip.Positioner`).
   - Visual consistency requirements (Ghost variant).

2. **Consolidate findings** in `research.md`.

**Output**: research.md

### Phase 1: Design & Contracts

1. **Extract entities** → `data-model.md`:
   - `PokemonCard` props and state.

2. **Generate API contracts**:
   - `PokemonCard` props (no changes to interface, only visual).

**Output**: data-model.md, /contracts/*, quickstart.md

### Phase 2: Implementation (Core)

1. **Setup**: Install `react-icons`.
2. **User Story 1 (Collect)**: Implement `TbPokeball` icon button.
3. **User Story 2 (Wishlist)**: Implement `FaHeart` icon button.
4. **User Story 3 (Remove)**: Implement `TbPokeballOff` icon button.

### Phase 3: Visual Adjustments (The Difference)

1. **Visual Consistency**:
   - Update all buttons to `variant="ghost"` with `color="black"`.
   - Remove solid color schemes.
   - Ensure hover states are consistent (`bg="gray.100"`).

2. **Tooltip Fixes**:
   - Wrap tooltips in `Tooltip.Positioner` to prevent layout shifts.
   - Verify positioning above UI.

**Output**: Updated `PokemonCard.tsx` and `tasks.md`.
