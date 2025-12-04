# Implementation Plan: Preload All Pokemon Names

**Branch**: `005-preload-all-names` | **Date**: 2025-12-04 | **Spec**: `/home/markus/workspace/pokemon-collector/specs/005-preload-all-names/spec.md`
**Input**: Feature specification from `/specs/005-preload-all-names/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

- Primary requirement: On app initialization, fetch the complete list of Pokemon names and IDs (single bulk request), cache it in localStorage keyed by app version, and use it for global search and placeholder names. Search is disabled with a "Loading names..." state until the list is ready; after 3 failed retries (with backoff), show a blocking error message.
- Technical approach: Add a names preload flow in the API/service layer to fetch `GET https://pokeapi.co/api/v2/pokemon?limit=MAX`, extract IDs from resource URLs, validate completeness against `MAX_POKEMON_INDEX`, persist the mapping in localStorage with versioned key, and expose a `NameRegistry` for components and hooks. Implement retry with exponential backoff and jitter; provide readiness state to UI (enable search when ready).

## Technical Context

**Language/Version**: TypeScript 5.9 (strict)  
**Primary Dependencies**: React 19, Axios, Chakra UI 2.8, Vite 7  
**Storage**: Browser `localStorage` (versioned cache key)  
**Testing**: Vitest + React Testing Library (threads ≤ 4 per constitution)  
**Target Platform**: Web (modern browsers via Vite dev/build)  
**Project Type**: Single web app (src/ + tests/)  
**Performance Goals**: Initial names fetch < 2s on typical 4G; search updates within 350ms (300ms debounce + ≤50ms filter/render)  
**Constraints**: Non-blocking UI; search disabled until registry ready; treat partial list as failure; auto-retry 3x with backoff; no custom CSS (Chakra UI only)  
**Scale/Scope**: ~1,025 Pokemon entries (IDs 1..MAX_POKEMON_INDEX)

Unknowns resolved in research.md:
- App version source for cache invalidation → package.json `version`  
- Exact completeness validation → length and gaps check for IDs 1..MAX  
- Backoff policy → exponential (500ms, 1000ms, 2000ms) + jitter  
- Limit value to avoid pagination → request with very high limit (e.g., 20000) but validate IDs set == 1..MAX

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Testing standards (TDD, 80% coverage, `--run`, ≤4 threads): PASS — plan includes unit tests for registry, retry/backoff, caching; integration tests for search readiness and placeholder names.  
- Styling via Chakra UI only; no custom CSS: PASS — feature changes are services/state; UI uses existing Chakra components and disabled state messaging.  
- UX consistency and accessibility: PASS — clear disabled state label ("Loading names..."), blocking error with actionable retry guidance.  
- Performance baselines: PASS — single bulk request + localStorage cache; no UI blocking; names lookup O(1).

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
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: Single-project web app. Feature touches `src/services/pokemonApi.ts`, `src/services/pokemonService.ts`, and UI readiness in `src/components/StickySearchBar.tsx`. Specs live under `/home/markus/workspace/pokemon-collector/specs/005-preload-all-names/`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
