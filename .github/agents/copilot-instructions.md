# pokemon-collector Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-11-30

## Active Technologies
- TypeScript 5.9+ (strict mode), React 19, JavaScript ES2020+ + React hooks, existing `pokemonService.searchPokemonByName()`, CSS Grid/Flexbox (002-sticky-search-bar)
- Browser localStorage (unchanged - collection persistence) (002-sticky-search-bar)
- TypeScript 5.9+, React 19, React DOM 19 + Chakra UI v2.8+, @emotion/react, @emotion/styled, framer-motion (003-component-library)
- Browser localStorage (unchanged; no new storage requirements) (003-component-library)
- TypeScript 5.9+ + React 19, Chakra UI v2.8+, Vite 7+, react-icons (004-modern-card-actions)
- TypeScript 5.9+ + React 19, Chakra UI v3+, react-icons (004-modern-card-actions)
- TypeScript 5.9 (strict) + React 19, Axios, Chakra UI 2.8, Vite 7 (005-preload-all-names)
- Browser `localStorage` (versioned cache key) (005-preload-all-names)
- TypeScript 5.9+, JavaScript ES2020+, Node.js 18+ + Vite 7+ (build), React 19 (runtime), pnpm v8+ (package manager), GitHub Actions (CI/CD platform) (006-github-pages-deploy)
- N/A (static site deployment via GitHub Pages) (006-github-pages-deploy)
- TypeScript 5.9+ (strict mode), React 19, React DOM 19 + IntersectionObserver Web API (native, no installation), existing LazyLoadingGrid component, Chakra UI v2.8+ (007-lazy-render)
- N/A (no persistent storage changes) (007-lazy-render)
- TypeScript 5.9+ (strict mode enabled) + React 19, Chakra UI 3.30, Axios 1.13, Vite 7 (008-simplify-render-cache)
- Browser localStorage (Base64-encoded Data URLs for images, JSON for collection/wishlist) (008-simplify-render-cache)

- TypeScript 5.9+ (strict mode enabled) + React 19, Vite 7+, Axios (HTTP client), Vitest + React Testing Library (001-pokemon-collection)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.9+ (strict mode enabled): Follow standard conventions

## Recent Changes
- 001-global-data-index: Added TypeScript 5.9+, React 19, Chakra UI v2.8+, Vite 7+, Vitest, LocalStorage (Index)
- 008-simplify-render-cache: Added TypeScript 5.9+ (strict mode enabled) + React 19, Chakra UI 3.30, Axios 1.13, Vite 7
- 007-lazy-render: Added TypeScript 5.9+ (strict mode), React 19, React DOM 19 + IntersectionObserver Web API (native, no installation), existing LazyLoadingGrid component, Chakra UI v2.8+


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
