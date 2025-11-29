# Research: Pokemon Collection Organizer

**Date**: 2025-11-29 | **Status**: Complete | **All Clarifications Resolved**: ✅ YES

## Overview

All technical clarifications from the feature spec have been resolved. This research document consolidates best practices and rationale for the chosen technical approach.

---

## Research Topic 1: PokéAPI Integration & Rate Limiting

**Decision**: Use PokéAPI (pokeapi.co) for fetching Pokemon data with fixed 1025 Pokemon maximum

**Rationale**: 
- PokéAPI is the industry-standard free Pokemon data source
- Official high-resolution artwork images included (sprites.pokemon.com)
- No authentication required for public endpoints
- Comprehensive API covering all required data (index, name, images)

**Implementation Details**:
- **Endpoints Used**: 
  - `/pokemon/{id}` for individual Pokemon details
  - `/pokemon?limit=1025&offset=0` for complete list (optional, for upfront caching)
- **Rate Limiting**: PokéAPI allows unlimited requests from browser clients (client-side rate limits: ~1-2 requests per Pokemon card render)
- **Caching Strategy**: 
  - Client-side in-memory cache for already-fetched Pokemon
  - localStorage persistence for Pokemon metadata (name, image URL)
  - HTTP caching via browser Cache-Control headers (set to ~24 hours)
- **Image URLs**: Use official artwork from `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{id}.png`
- **Error Handling**: Implement exponential backoff (3 retry attempts) for failed requests

**Alternatives Considered**:
- ~~Custom Pokemon database~~ - Rejected: Requires manual maintenance, unnecessary complexity for fixed dataset
- ~~GraphQL endpoint~~ - Rejected: REST API sufficient for simple queries, adds dependency complexity

---

## Research Topic 2: React Lazy Loading Implementation

**Decision**: Implement Intersection Observer API for lazy loading Pokemon cards

**Rationale**:
- Native browser API (no external dependencies)
- Excellent performance (0 requests for off-screen Pokemon)
- Efficient memory usage (unrender cards outside viewport)
- Supports infinite scroll patterns naturally

**Implementation Details**:
- **Viewport Buffer**: Load Pokemon 1-2 screens ahead of visible area (PreviewSize)
- **Custom Hook**: `useIntersectionObserver()` to track card visibility
- **Virtual Scrolling**: Consider windowing library if > 1000 items causes performance issues (unlikely with lazy loading)
- **Scroll Container**: Use CSS `overflow: auto` on grid container, not window
- **Re-render Optimization**: Only update visible cards, memoize `PokemonCard` component
- **Initial Load**: Display first 20-30 visible Pokemon immediately, then load on scroll
- **Performance Target**: 60 FPS scrolling (18ms frame budget), test with 1000+ cards on-screen

**Alternatives Considered**:
- ~~React Window~~ - Rejected: Overkill for this use case, adds bundle size, Intersection Observer sufficient
- ~~Pagination~~ - Rejected: Breaks UX flow, users want continuous scroll

---

## Research Topic 3: localStorage Abstraction for Future Backend Migration

**Decision**: Create abstraction interface (`StorageProvider`) for localStorage persistence

**Rationale**:
- Enables seamless migration to backend database (PostgreSQL, Firebase) without refactoring application logic
- Maintains separation of concerns (persistence logic isolated)
- Allows easy switching between storage implementations
- Supports unit testing (mock implementations)

**Implementation Details**:
- **Interface Contract**: 
  ```typescript
  interface StorageProvider {
    getCollection(): Promise<CollectionData>;
    saveCollection(data: CollectionData): Promise<void>;
    getWishlist(): Promise<string[]>; // Pokemon IDs
    saveWishlist(ids: string[]): Promise<void>;
    clearAll(): Promise<void>;
  }
  ```
- **Implementations**:
  - `LocalStorageProvider` - Browser localStorage (current, synchronous API wrapped in Promise)
  - `FirebaseProvider` - Firebase Realtime Database (future, async ready)
  - `BackendProvider` - Custom backend API endpoint (future)
- **Service Layer**: `CollectionService` uses injected `StorageProvider` dependency
- **Data Format**: JSON serialization with validation schema (Zod or simple type guards)
- **Migrations**: Simple JSON versioning for schema changes (version 1.0 initial)

**Alternatives Considered**:
- ~~Direct localStorage calls throughout app~~ - Rejected: Creates tight coupling, hard to test/migrate
- ~~Redux/Zustand store~~ - Rejected: Overkill for single-user app, adds dependency, storage abstraction handles persistence

---

## Research Topic 4: Responsive Grid Layout (320px-1920px+)

**Decision**: CSS Grid with auto-fit responsive columns

**Rationale**:
- Native browser CSS (no layout library needed)
- Excellent performance (no JavaScript calculations)
- Automatic column wrapping based on available space
- Mobile-first approach

**Implementation Details**:
- **CSS Grid Definition**:
  ```css
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
    padding: 16px;
  }
  ```
- **Breakpoints** (if needed):
  - 320px (mobile): 1-2 columns
  - 768px (tablet): 2-3 columns
  - 1024px (desktop): 3-4 columns
  - 1920px+ (large): 4-5 columns
- **Card Sizing**: Fixed aspect ratio (1:1) for Pokemon images using padding-bottom trick
- **Touch Targets**: Minimum 44px × 44px for action buttons (accessibility)
- **Performance**: CSS Grid renders faster than flexbox for many items

**Alternatives Considered**:
- ~~Tailwind Grid~~ - Rejected: CSS Grid simpler and sufficient
- ~~Bootstrap Grid~~ - Rejected: Adds unnecessary CSS framework dependency

---

## Research Topic 5: Image Failure Handling UI

**Decision**: Display Pokemon silhouette placeholder with index and manual retry link

**Rationale**:
- User understands what happened (image failed, not missing data)
- Manual retry empowers users to recover from transient network issues
- Placeholder maintains grid layout (no layout shift)
- Silhouette SVG is lightweight and recognizable

**Implementation Details**:
- **Placeholder SVG**: Reusable `<PokemonPlaceholder>` component with Pokemon silhouette
- **Display Info**: Index number prominently (e.g., "#025")
- **Error States**:
  1. Loading: Spinner or skeleton
  2. Error (failed after retries): Placeholder + "Retry" button
  3. Success: Actual image
- **Retry Mechanism**: Single Pokemon retry (don't reload entire grid)
- **Retry Logic**: Exponential backoff (3 attempts, 2s → 4s → 8s delays)
- **User Feedback**: Toast notification on retry success/failure
- **Performance**: SVG placeholder cached, no additional network cost

**Alternatives Considered**:
- ~~Generic error message~~ - Rejected: Breaks UX, confusing for users
- ~~Automatic infinite retry~~ - Rejected: Could spam PokéAPI, poor UX
- ~~Disable card interaction until loaded~~ - Rejected: Users can still manage status even with image error

---

## Research Topic 6: State Management & Form of Data Flow

**Decision**: React hooks (useState, useContext) for state management; no Redux needed

**Rationale**:
- Single-user application with limited state (collected/wishlist arrays)
- Direct component prop passing sufficient for two-level nesting
- Simplifies testing and reduces dependencies
- `useCollection` custom hook encapsulates collection logic
- `useContext` for theme/settings if added later

**Implementation Details**:
- **Hooks Used**:
  - `useCollection()` - Central hook managing collection/wishlist state + storage sync
  - `useEffect()` - Persistence to localStorage on state change
  - `useCallback()` - Memoized action handlers (mark collected, add to wishlist, etc.)
  - `useState()` - UI state (loading, error, search)
- **Data Structure**:
  ```typescript
  interface Collection {
    collected: Map<number, Pokemon>;
    wishlist: Map<number, Pokemon>;
  }
  ```
- **Action Pattern**:
  ```typescript
  const handleMarkCollected = useCallback((pokemonId: number) => {
    // Update state
    // Persist to storage
    // Handle UI feedback
  }, []);
  ```

**Alternatives Considered**:
- ~~Redux~~ - Rejected: Over-engineering for single-user app, adds complexity/bundle size
- ~~Zustand~~ - Rejected: Simpler hooks approach sufficient, no need for external store

---

## Research Topic 7: Testing Strategy per Constitution

**Decision**: TDD with Vitest + React Testing Library

**Rationale**:
- Constitution mandates TDD (tests before implementation)
- 80%+ code coverage minimum
- Unit tests for models, services, hooks
- Integration tests for component interactions
- Contract tests for API integration

**Testing Breakdown**:
- **Unit Tests** (models, services, utils):
  - Pokemon model validation
  - Collection business logic (mark collected, add wishlist)
  - Storage service interactions
  - Utility function validation
- **Integration Tests** (components):
  - PokemonCard rendering and button interactions
  - CollectionList grid and lazy loading
  - PokemonSearch filter functionality
  - Grid state synchronization
- **Contract Tests** (API):
  - PokéAPI response schema validation
  - Error handling (404, timeout, network)
  - Image URL format validation
- **E2E (if added later)**:
  - User workflows (mark collected → view in grid → persist)
  - Edge cases (rapid clicking, offline, image load failure)

**Tooling**:
- Vitest for unit/integration tests
- React Testing Library for component testing
- Mock providers for storage and API
- 80% coverage target enforced in CI

---

## Technical Decisions Summary

| Area | Decision | Key Rationale |
|------|----------|---------------|
| Data Source | PokéAPI REST | Industry standard, free, comprehensive, no auth needed |
| Lazy Loading | Intersection Observer | Native API, efficient, 0 off-screen requests |
| Persistence | localStorage + Abstraction | Simple now, migration-ready for backend |
| Layout | CSS Grid auto-fit | Native, fast, responsive, no dependencies |
| Error UI | Silhouette placeholder + retry | Clear UX, user control, maintains layout |
| State Management | React hooks | Appropriate for app scope, minimal dependencies |
| Testing | Vitest + RTL TDD | Constitution-mandated, best practices |

---

## Open Questions Resolved

✅ **Q: Pokemon data source?** → PokéAPI with 1025 Pokemon fixed maximum  
✅ **Q: Image failures?** → Placeholder + manual retry link  
✅ **Q: Direct transitions?** → Yes, collected ↔ wishlist ↔ available (atomic operations)  
✅ **Q: Persistence?** → localStorage with abstraction interface for backend migration  
✅ **Q: Ordering?** → Index ascending (1-1025) across all grids  
✅ **Q: Lazy loading?** → Intersection Observer, 0 off-screen requests  

---

## Next Steps: Phase 1

Ready to proceed with:
1. **data-model.md** - Entity definitions (Pokemon, Collection, Wishlist)
2. **contracts/api-contracts.yaml** - API endpoint schemas
3. **quickstart.md** - Developer setup guide
4. **Agent context update** - Technology additions to context file

