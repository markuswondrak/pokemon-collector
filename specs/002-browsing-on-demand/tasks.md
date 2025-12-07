# Tasks: Browsing & On-Demand Loading

**Feature**: `002-browsing-on-demand`
**Status**: In Progress

## Phase 1: Setup
*Project initialization and dependency management.*

- [x] T001 Install `react-virtuoso` and `vite-plugin-pwa`

## Phase 2: Foundational
*Blocking prerequisites for user stories.*

- [x] T002 Configure `vite-plugin-pwa` in `vite.config.ts` for Cache-First image strategy
- [x] T003 Create `src/components/LazyImage.tsx` with loading skeleton and error handling
- [x] T004 Create basic `src/components/PokemonCard.tsx` (Name and ID only)

## Phase 3: User Story 1 - Infinite Scrolling Grid
*As a user, I want to scroll through the entire grid of Pokemon without clicking "next page" buttons.*

**Goal**: Render the full list of Pokemon in a performant, virtualized grid.
**Independent Test**: Scroll down the grid and verify new items appear seamlessly without DOM bloat.

- [x] T005 [US1] Create `src/components/LazyLoadingGrid.tsx` using `VirtuosoGrid`
- [x] T006 [US1] Integrate `LazyLoadingGrid` into `src/App.tsx` to display `pokemonList`

## Phase 4: User Story 2 - Lazy Loading Images
*As a user, I want images to load only when I see them.*

**Goal**: Images are requested only when entering the viewport.
**Independent Test**: Open network tab, scroll, verify images load on demand.

- [x] T007 [US2] Update `src/components/PokemonCard.tsx` to use `LazyImage` for Pokemon sprites

## Phase 5: User Story 3 - Offline Image Access
*As a user, I want images I've seen before to load even when I have no internet connection.*

**Goal**: Cached images display offline; unseen images show a graceful fallback.
**Independent Test**: Go offline, reload/scroll, verify cached images appear.

- [x] T008 [US3] Implement offline/error fallback UI in `src/components/LazyImage.tsx`

## Phase 6: User Story 4 & 5 - Caching Strategy
*Cache-First strategy and persistent storage.*

**Goal**: Prioritize local cache and ensure persistence.
**Independent Test**: Verify `ServiceWorker` source in Network tab for repeated image loads.

- [x] T009 [US4] Verify and tune Workbox runtime caching configuration (if needed beyond T002)

## Phase 7: Polish & Cross-Cutting Concerns
*Final adjustments and cleanup.*

- [x] T010 Ensure responsive grid layout (columns) in `LazyLoadingGrid.tsx`
- [x] T011 Verify loading spinner/skeleton appearance matches design system

## Dependencies

- **US1** depends on **Foundational** (PokemonCard)
- **US2** depends on **Foundational** (LazyImage) and **US1** (Grid to hold cards)
- **US3** depends on **Foundational** (PWA Config) and **US2** (Image component)
- **US4/5** depends on **Foundational** (PWA Config)

## Implementation Strategy

1.  **Setup**: Get the tools installed.
2.  **Foundation**: Set up the PWA caching early so it's active from the start. Build the building blocks (`LazyImage`, `PokemonCard`).
3.  **Grid (US1)**: Get the main UI working with text-only cards first to prove virtualization.
4.  **Images (US2)**: Add the heavy assets (images) with lazy loading.
5.  **Offline (US3)**: Refine the experience for offline/error states.
