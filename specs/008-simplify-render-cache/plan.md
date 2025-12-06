# Implementation Plan: Simplify Render and Caching Mechanism

**Branch**: `008-simplify-render-cache` | **Date**: 2025-12-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-simplify-render-cache/spec.md`

## Summary

**Primary Requirement**: Simplify the rendering and caching mechanism by removing complex lazy-loading logic (IntersectionObserver, LazyRenderService, useLazyRender hook) and replacing it with a straightforward on-demand image loading system. Images are fetched when cards scroll into viewport, encoded as Base64 Data URLs, and stored in localStorage for instant retrieval on subsequent views.

**Technical Approach**: 
1. Remove LazyRenderService and useLazyRender hook entirely
2. Implement IntersectionObserver directly in card components for viewport detection
3. Create ImageCacheService for localStorage management (save/load/evict Data URLs)
4. Use LRU eviction policy when localStorage approaches capacity
5. Invalidate cached images on app version change
6. Preserve existing collection/wishlist storage independently
7. Display skeleton cards during image loading

## Technical Context

**Language/Version**: TypeScript 5.9+ (strict mode enabled)  
**Primary Dependencies**: React 19, Chakra UI 3.30, Axios 1.13, Vite 7  
**Storage**: Browser localStorage (Base64-encoded Data URLs for images, JSON for collection/wishlist)  
**Testing**: Vitest 4.0 with React Testing Library, jsdom environment  
**Target Platform**: Modern web browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)  
**Project Type**: Single web application (React SPA)  
**Performance Goals**: Images load within 2s on first view, instant retrieval from cache (<50ms), support 1000+ cached images  
**Constraints**: localStorage quota (~5-10MB per origin), LRU eviction when approaching limits, maintain 60fps UI responsiveness  
**Scale/Scope**: 1025 Pokémon total, ~50KB average per cached image, single-user local application

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles Evaluation

**I. Code Quality First** ✅ PASS
- Feature removes complex lazy-loading logic, reducing technical debt
- Simplifies codebase by eliminating LazyRenderService and useLazyRender hook
- Maintains clean separation: image caching vs collection/wishlist storage
- No shortcuts taken; proper error handling and fallback states included

**II. Testing Standards** ✅ PASS
- TDD approach required: tests written before implementation
- Unit tests for image cache service (load, save, evict, invalidate)
- Integration tests for viewport-triggered loading and cache retrieval
- Contract tests for localStorage schema and API compatibility
- Minimum 80% coverage target for new code

**III. User Experience Consistency** ✅ PASS
- Maintains existing collection/wishlist workflows unchanged
- Skeleton placeholders provide consistent loading feedback
- Error states handled with fallback messaging
- No breaking changes to user-facing interactions
- Improves UX by simplifying rendering (more predictable behavior)

**IV. Fast Development Velocity** ✅ PASS
- Removes complexity → faster future feature development
- Eliminates IntersectionObserver debugging overhead
- Clear migration path: delete old services, add new cache service
- Build times remain under 5 minutes (no new heavy dependencies)

### Development Standards Compliance

**Linting & Formatting** ✅ PASS
- All new code passes ESLint checks
- Auto-formatting enforced pre-commit

**Styling** ✅ PASS
- Skeleton cards use Chakra UI components only
- No custom CSS for loading states
- Reuses existing Card and Image components

**Test Execution** ✅ PASS
- Tests run with `--run` flag in automation
- Unit tests (cache service) run in parallel
- Integration tests (viewport loading) run sequentially per constitution

**Test Worker Configuration** ✅ PASS
- Vitest configured with `--maxThreads=4` during implementation
- Prevents resource contention during image loading tests

**Test Suite Separation** ✅ PASS
- Unit tests: Image cache operations (parallel execution)
- Contract tests: localStorage schema validation (parallel execution)
- Integration tests: Viewport-based loading, API integration (sequential execution)

### Gates Summary

**RESULT: ✅ ALL GATES PASS**

No constitution violations. Feature actively improves code quality by removing unnecessary complexity while maintaining all existing user workflows and testing standards.

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
│   ├── PokemonCard.tsx         # MODIFIED: Add IntersectionObserver for viewport detection
│   ├── AvailableGrid.tsx       # MODIFIED: Remove LazyLoadingGrid wrapper
│   ├── CollectionList.tsx      # MODIFIED: Remove LazyLoadingGrid wrapper
│   ├── WishlistList.tsx        # MODIFIED: Remove LazyLoadingGrid wrapper
│   ├── LazyLoadingGrid.tsx     # DELETED: No longer needed
│   └── SkeletonCard.tsx        # EXISTING: Used during image loading
├── services/
│   ├── imageCacheService.ts    # NEW: localStorage cache for Base64 Data URLs
│   ├── lazyRenderService.ts    # DELETED: Complex lazy-loading removed
│   ├── collectionStorage.ts    # EXISTING: Unchanged (collection/wishlist persistence)
│   └── pokemonApi.ts           # MODIFIED: Add image-to-DataURL conversion
├── hooks/
│   ├── useLazyRender.ts        # DELETED: No longer needed
│   └── useImageCache.ts        # NEW: Hook for image cache operations
└── utils/
    └── constants.ts            # MODIFIED: Add cache keys, remove lazy render constants

tests/
├── unit/
│   ├── imageCacheService.test.ts      # NEW: Cache operations tests
│   └── useImageCache.test.ts          # NEW: Hook tests
├── contract/
│   └── imageCacheSchema.test.ts       # NEW: localStorage schema validation
└── integration/
    ├── viewport-image-loading.test.tsx # NEW: IntersectionObserver integration
    └── cache-eviction.test.tsx         # NEW: LRU eviction behavior
```

**Structure Decision**: Single React web application. Feature modifies existing components to remove lazy-loading complexity and adds new image caching service. Core architecture remains unchanged (React + localStorage + PokeAPI).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations detected.** This feature actively reduces complexity by removing ~500 lines of complex lazy-loading logic while maintaining all functional requirements.
