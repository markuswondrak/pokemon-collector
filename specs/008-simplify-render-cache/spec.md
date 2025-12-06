# Feature Specification: Simplify Render and Caching Mechanism

**Feature Branch**: `008-simplify-render-cache`  
**Created**: 6. Dezember 2025  
**Status**: Draft  
**Input**: User description: "simplify render and caching mechanism - load all pokemon pictures when viewed and save in local storage, remove other rendering/lazy loading functionality"

## Clarifications

### Session 2025-12-06

- Q: What interaction triggers image loading? → A: When card scrolls into viewport (enters visible area)
- Q: How should images be stored in local storage? → A: Encode images as Data URLs (Base64 strings) in localStorage
- Q: What should happen when local storage is full? → A: Automatically delete oldest cached images (LRU eviction) to make space for new ones
- Q: Should cached images be invalidated when app version changes? → A: Invalidate all cached images when app version changes
- Q: What UI feedback should display during image loading? → A: Display skeleton placeholder card while image is loading

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Available Pokémon (Priority: P1)

Users browse through the complete list of available Pokémon and can view any Pokémon's image whenever they want. When a Pokémon is viewed for the first time, its image is fetched from the API and automatically saved locally. On subsequent views, the locally cached image is displayed immediately without API calls.

**Why this priority**: This is the core feature that replaces the complex lazy loading mechanism with a simple on-demand loading approach. It's essential for the application to function and directly replaces existing functionality.

**Independent Test**: Users can scroll through the Pokémon grid, click/interact with any card, and the image loads. The feature is independently testable without any other functionality and delivers immediate value by simplifying data loading.

**Acceptance Scenarios**:

1. **Given** a Pokémon hasn't been viewed before, **When** the user views it, **Then** the image is fetched from the API and displayed, and stored in local storage for future use
2. **Given** a Pokémon has been previously viewed, **When** the user views it again, **Then** the cached image from local storage is displayed immediately
3. **Given** an API call fails when fetching an image, **When** the user tries to view the Pokémon, **Then** a fallback placeholder or error message is shown
4. **Given** the user performs different interactions with Pokémon cards, **When** the images load on-demand, **Then** all images render consistently regardless of viewport position
5. **Given** an image is being fetched, **When** the card is displayed, **Then** a skeleton placeholder is shown until the image loads completely

---

### User Story 2 - Maintain Collection and Wishlist Data (Priority: P1)

Users' collection and wishlist data persist across sessions, independent of image caching. The system continues to track which Pokémon have been collected and which are on the wishlist in local storage.

**Why this priority**: This is a critical feature that must continue to work alongside the simplified rendering mechanism. It represents existing functionality that must be preserved while removing rendering complexity.

**Independent Test**: Users can collect and wishlist Pokémon, close the browser, and when they return, their collection and wishlist data remain intact. This can be tested independently without new image caching features.

**Acceptance Scenarios**:

1. **Given** a user has collected Pokémon, **When** they return to the app after closing it, **Then** their collection data is restored from local storage
2. **Given** a user has a wishlist, **When** they return to the app, **Then** their wishlist data is restored and accurate
3. **Given** the user modifies their collection, **When** these changes are made, **Then** they are immediately persisted to local storage

---

### User Story 3 - Simple Caching Policy (Priority: P1)

The application uses a straightforward caching strategy: load images on-demand when viewed and store them in local storage indefinitely (or until explicitly cleared). No complex lazy-loading logic, throttling, batching, or viewport-based rendering.

**Why this priority**: This establishes the simplified approach and removes all complexity from the rendering pipeline. It's a P1 because it sets the foundation for removing technical debt.

**Independent Test**: Verify that images are loaded only when accessed, stored in local storage, and retrieved from cache without any lazy-loading framework or IntersectionObserver logic. Can be verified by monitoring network requests and local storage.

**Acceptance Scenarios**:

1. **Given** the app loads, **When** a Pokémon card comes into view, **Then** if not cached, the image is fetched; if cached, the image is retrieved from local storage
2. **Given** multiple Pokémon images are cached, **When** they are accessed, **Then** local storage retrieval is used without hitting the API
3. **Given** the lazy loading/render hook is no longer needed, **When** the app runs, **Then** all Pokémon load predictably without viewport-based rendering optimizations

### Edge Cases

- **Local storage full**: System automatically evicts oldest cached images (LRU policy) to make space for new images
- **Local storage unavailable**: Images load directly from API without caching; app continues to function
- **No internet connection + uncached Pokémon**: Display error state indicating image unavailable, allow retry when connection restored
- **API endpoint unavailable**: Display error state with fallback placeholder image
- **Corrupted cached data**: Detect invalid Data URL format, remove corrupted entry, re-fetch from API
- **App version change**: Clear all cached images on version mismatch to ensure compatibility; collection/wishlist data preserved

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST load Pokémon images on-demand when the card scrolls into the user's viewport (becomes visible in the browser window)
- **FR-002**: System MUST store fetched Pokémon images in local storage as Base64-encoded Data URLs after successful API retrieval
- **FR-003**: System MUST retrieve Pokémon images from local storage if available, bypassing API calls
- **FR-004**: System MUST maintain collection status (collected/not-collected) in local storage independent of image caching
- **FR-005**: System MUST maintain wishlist status for Pokémon in local storage
- **FR-006**: System MUST remove or disable all lazy-loading render logic including IntersectionObserver-based rendering
- **FR-007**: System MUST remove or disable the LazyRenderService and related hooks that optimize viewport-based rendering
- **FR-008**: System MUST remove all debouncing, batching, and performance optimizations related to lazy rendering of cards
- **FR-009**: System MUST provide a fallback or error state when image loading fails (network error or API failure)
- **FR-010**: System MUST display collected and wishlisted Pokémon correctly regardless of caching status
- **FR-011**: System MUST implement LRU (Least Recently Used) eviction policy to automatically remove oldest cached images when local storage approaches capacity limits
- **FR-012**: System MUST validate that collection and wishlist data structures remain consistent in local storage and are never evicted by image cache management
- **FR-013**: System MUST invalidate and clear all cached images when the application version changes to ensure compatibility
- **FR-014**: System MUST display skeleton placeholder cards while images are being fetched to provide loading state feedback

### Key Entities *(include if feature involves data)*

- **Pokémon Card Data**: Contains index, name, image (cached as Data URL), collection status, and wishlist status
- **Cache Entry**: Stored in local storage as `pokemon_image_<index>` key containing Base64-encoded Data URL with timestamp and version info for invalidation
- **Collection Data**: Persistent storage of user's collected and wishlisted Pokémon
- **Image Cache**: Local storage structure mapping Pokémon index to Base64-encoded Data URL strings

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All Pokémon images load and display correctly when viewed (100% of images render without missing or broken images)
- **SC-002**: Cached images retrieve from local storage without API calls (0 API requests for previously loaded images)
- **SC-003**: Users can complete collection workflow in under 5 seconds per Pokémon interaction
- **SC-004**: Collection and wishlist data persist correctly across browser sessions (100% persistence accuracy)
- **SC-005**: Application no longer uses IntersectionObserver or viewport-based lazy rendering logic
- **SC-006**: Code complexity is reduced by removing lazy-loading-related components and services
- **SC-007**: No performance degradation occurs compared to previous implementation when loading 50+ Pokémon (all images load within reasonable timeframe)
- **SC-008**: Local storage utilization is optimized with proper image caching and cache invalidation strategy

## Assumptions

- Images will be cached indefinitely within a single app version; caches are cleared automatically on version updates
- The API will remain the primary source for uncached Pokémon images
- Collection and wishlist functionality remain unchanged in their current implementation
- Search functionality continues to work independently of image caching
- Local storage has sufficient capacity for the expected number of cached Pokémon images (~1000 images at various sizes)
