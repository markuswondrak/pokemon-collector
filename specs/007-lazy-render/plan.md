# Implementation Plan: Lazy Card Rendering

**Branch**: `007-lazy-render` | **Date**: 2025-12-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-lazy-render/spec.md`

## Summary

Implement lazy rendering of Pokemon cards using IntersectionObserver with a 200px buffer, preserving rendered DOM nodes to avoid scroll jumps, and extending behavior to reuse cached API responses so each endpoint is called only once per session. Respect the feature-005 names cache: use it immediately when valid, refresh once on app version change, and share cached data across Available, Collection, and Wishlist views to keep scrolling smooth and initial load fast.

## Technical Context

**Language/Version**: TypeScript 5.9+, React 19, React DOM 19  
**Primary Dependencies**: Chakra UI v2.8+, IntersectionObserver (native), existing `LazyLoadingGrid`, `pokemonApi`, `pokemonService`, `nameRegistry`  
**Storage**: Browser localStorage for persisted names cache (feature 005); in-memory shared caches per session for other API responses  
**Testing**: Vitest + React Testing Library; tests run with `--run` and max 4 threads per constitution  
**Target Platform**: Modern browsers (Chrome 51+, Firefox 55+, Safari 12.1+, Edge 79+) with graceful fallback  
**Project Type**: Single-package web application (Vite + React + Chakra UI)  
**Performance Goals**: Initial viewport render <1s; scroll ≥30fps; previously fetched Pokemon render in <300ms when revisited; names cache enables search in <0.5s when valid  
**Constraints**: No virtualization (cards stay mounted once rendered); no custom CSS (Chakra-only styling); each external API endpoint max one call per session; names cache refresh only on version change  
**Scale/Scope**: ~1,025 Pokemon; three grids (Available, Collection, Wishlist); lazy rendering applies at ≥50 results, full render <50

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I: Code Quality First** — PASS: Plan keeps logic isolated (service for observer + shared cache, hook for React lifecycle) and will follow TDD.
- **Principle II: Testing Standards** — PASS: Vitest with 80%+ coverage; tests executed with `--run` and ≤4 threads; single-file runs during dev.
- **Principle III: User Experience Consistency** — PASS: Reuses Chakra components and existing card UX; skeletons remain; names cache preserves search responsiveness.
- **Principle IV: Fast Development Velocity** — PASS: No new dependencies; leverages existing components/services; minimal surface area changes.
- **Development Standards** — PASS: Chakra-only styling, linting required, performance baselines documented; shared caching avoids duplicate calls.

## Project Structure

### Documentation (this feature)

```text
specs/007-lazy-render/
├── plan.md          # Implementation plan (this file)
├── spec.md          # Feature specification
├── research.md      # Phase 0 (existing; update if new findings)
├── data-model.md    # Phase 1 data entities/state
├── quickstart.md    # Phase 1 implementation steps
├── contracts/       # Phase 1 API/component contracts
└── tasks.md         # Phase 2 execution tasks
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── LazyLoadingGrid.tsx      # IntersectionObserver + batching; ensure cache reuse hooks
│   ├── AvailableGrid.tsx        # Consumes LazyLoadingGrid + cached data
│   ├── CollectionList.tsx       # Consumes LazyLoadingGrid + cached data
│   ├── WishlistList.tsx         # Consumes LazyLoadingGrid + cached data
│   ├── PokemonCard.tsx          # Displays card; unchanged layout/UX
│   └── SkeletonCard.tsx         # Placeholders; ensure consistent sizing
├── hooks/
│   └── useLazyRender.ts         # Hook managing observer, buffer, cache reuse
├── services/
│   ├── lazyRenderService.ts     # Observer orchestration & batching
│   ├── pokemonApi.ts            # External API client (single-call per endpoint)
│   ├── pokemonService.ts        # Business logic reusing caches
│   └── nameRegistry.ts          # Names cache (feature 005) with version-aware invalidation
├── utils/
│   └── constants.ts             # Shared constants (e.g., buffer size, thresholds)
└── styles/
    └── theme.ts                 # Chakra theme (no changes expected)

tests/
├── unit/
│   ├── hooks/useLazyRender.test.tsx
│   ├── services/lazyRenderService.test.ts
│   └── services/nameRegistry.test.ts        # Ensure version-aware cache reuse
├── integration/
│   ├── lazy-loading-grid.test.jsx           # Scroll, buffer, cache reuse flows
│   └── search-performance.test.jsx          # Names cache impact on search
└── contract/
    └── component-contracts.test.jsx         # Card/grid contracts unchanged
```

**Structure Decision**: Single-package web application. Feature touches existing components, hook, and services under `src/` with focused test additions under `tests/` (unit and integration).

## Complexity Tracking

No constitution violations; no additional complexity justifications required.
