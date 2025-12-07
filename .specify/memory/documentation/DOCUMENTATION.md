# Project Specification: Pokemon Collector (Greenfield Rewrite)

## 0. Introduction
This document describes the requirements of the pokemon collector application. It's purpose is to collect all requirments in one document. 

With this prompt spec kit will create a list of specs out of this document. 

```
read the document .specify/DOCUMENTATION.md. This document lists the requirements for the application.  Create a list of sensable features to be implemented in a order that leaves a working version of the application after each feature. 

For each feature follow the instructions in speckit.specify.agent.md and use the feature description as input
```

## 1. Project Goal & Vision
The "Pokemon Collector" is a web application for Pokemon fans who want to organize their collection digitally. Users can browse the entire Pokedex, mark caught Pokemon, and maintain a wishlist. The focus is on an extremely fast, reactive user interface that works reliably even with poor internet connections (thanks to caching).

## 2. Tech Stack & Architecture (Laws)
*   **Language/Framework:** React 19 (via Vite), TypeScript.
*   **Styling:** Chakra UI (v3) + Emotion (for CSS-in-JS).
*   **State Management:** React Context or simple Custom Hooks (no Redux/Zustand needed as state is local).
*   **Data Persistence:** Browser LocalStorage (acts as "Database").
*   **Network:** Axios or native `fetch`.
*   **Architecture Pattern:** **Service-Layer Pattern**.
    *   *UI Components* (dumb, presentation only)
    *   *Custom Hooks* (connect UI with logic)
    *   *Services* (pure business logic, API calls, storage access - no React dependencies!)

## 3. Data Model (The Truth)

### 3.1 Entities
*   **PokemonRef** (Lightweight, for lists & search)
    *   `id`: number (1-1025)
    *   `name`: string

*   **PokemonDetails** (Heavyweight, Lazy loaded)
    *   `id`: number
    *   `imageUrl`: string (Base64 Data URL)
    *   `fetchedAt`: timestamp (for cache invalidation)

*   **UserCollection** (Persisted)
    *   `collectedIds`: number[] (List of caught IDs)
    *   `wishlistIds`: number[] (List of wished IDs)

### 3.2 Storage Keys (LocalStorage)
*   `pokemon_registry`: List of all `PokemonRef` (Cache for names).
*   `user_collection`: JSON object with `collectedIds` and `wishlistIds`.
*   `img_cache_<id>`: Individual entries for images (to enable LRU eviction).
*   `app_version`: String (to invalidate outdated caches on updates).

## 4. Features (Scope)

### Feature 1: Global Data Index (Preload)
*   **Story:** On app start, the system loads the index of all available Pokemon (ID + Name) once.
*   **Acceptance Criteria:**
    *   App shows loading indicator on first start.
    *   Names and image URLs are cached in LocalStorage.
    *   On subsequent visits, the app is ready immediately (no API call for name list or image URL).
    *   Error handling: Auto-retry on API error.

### Feature 2: Browsing & On-Demand Loading (Conflict Resolution)
*   **Story:** The user scrolls through a list of all Pokemon. Images are only loaded when they become visible. 
*   **Acceptance Criteria:**
    *   The list *immediately* shows all cards with correct names (from Feature 1) and placeholders.
    *   A loading spinner is shown during the loading of an image
    *   **Logic:** When a card enters the viewport -> Check Cache -> If empty, load image from API -> Save Base64 in Cache.
    *   Use a "Virtual Scrolling" framework to enable infinite scrolling to avoid paging mechanisms.

### Feature 3: Intelligent Image Caching (LRU)
*   **Story:** As a user, I want Pokemon images to be cached locally after loading, so that I can save data usage and view them even with poor connectivity or while offline.
*   **Acceptance Criteria:**
    *   A Service Worker is registered and running in the background of the application.
    *   The Service Worker intercepts all HTTP requests (fetch) targeting the Pokemon image domain.
    *   A "Cache-First" strategy is applied:
        *   Check if the image exists in the cache -> If yes, serve immediately.
        *   If no, fetch from the network, store in the cache, and then serve.
        *   Images are stored via the Cache Storage API as response objects (not as Base64 strings in LocalStorage).
        *   The cache remains persistent even after the browser tab or the browser itself is closed (cross-session).

### Feature 4: Manage Collection
*   **Story:** Pokemon can have the states "Caught", "Wishlisted" or "Available". 
*   **Acceptance Criteria:**
    *   Toggle icon buttons on every card (Pokeball for catching, Heart for wishlisting).
    *   The Transisition "Caught to Wishlisted" is not allowed.
    *   Status is persisted immediately in local storage.
    *   The pokemon are visually shown in one grid for each state.

### Feature 5: Search & Filter
*   **Story:** User can search by name or filter by status.
*   **Acceptance Criteria:**
    *   **Sticky Search Bar:** Search bar remains visible at the top when scrolling.
    *   Search filters the local Pokemon list (no API call needed).
    *   Filter applies at 3 letters min length. 
    *   Only Filter matching Pokemon remain in the grids

## 5. UI/UX Guidelines
*   **Layout:** Responsive Grid (Mobile: 1-2 columns, Desktop: many columns).
*   **Feedback:** Skeleton loader for images that are currently loading.
*   **Navigation:** Sticky Header with search and filters.
*   **Color Scheme:** Based on classic Pokemon colors (Red/White), but modern and clean (use Chakra UI Default Theme).

## 6. Forbidden Practices (Anti-Patterns)
*   **No "Prop Drilling":** Use Context for global data.
