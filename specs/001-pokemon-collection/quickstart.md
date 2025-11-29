# Quick Start: Pokemon Collection Organizer

**Date**: 2025-11-29 | **Phase**: 1 | **Duration**: <5 minutes setup + 2-3 minutes first run

**Design Artifacts**: See `data-model.md` for entity definitions, `contracts/api-contracts.yaml` for API contracts, `research.md` for technical decisions

## Prerequisites

- Node.js 18+ (check with `node --version`)
- pnpm 8+ (install with `npm install -g pnpm`)
- Git
- TypeScript 5.9+ (included in dev dependencies)

## Setup Steps

### 1. Initialize React + Vite + TypeScript Project

```bash
# Navigate to repository root
cd /home/markus/workspace/pokemon-collector

# Create React + Vite project (if not already existing)
# This will be done as part of implementation task T001

# Install dependencies
pnpm install

# Verify Vite is working
pnpm dev  # Should start dev server on http://localhost:5173
```

### 2. Install Required Dependencies

```bash
# Core dependencies (already in package.json)
pnpm install  # React 19, Vite, axios, TypeScript

# Dev dependencies for testing (already in package.json)
pnpm add -D vitest @testing-library/react @testing-library/jest-dom
```

### 3. Verify Project Structure

```bash
# Check that the following directory exists:
ls -la src/
ls -la tests/
```

Expected structure:
```
src/
├── components/
├── services/
├── hooks/
├── models/
├── styles/
├── utils/
└── main.tsx

tests/
├── unit/
├── integration/
└── contract/

tsconfig.json          # TypeScript configuration with strict mode
eslint.config.js       # ESLint with TypeScript strict checking
```

### 4. Run Development Server

```bash
pnpm dev
```

Browser opens to `http://localhost:5173` with hot-reload enabled.

### 5. Run Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### 6. Build for Production

```bash
pnpm build
```

Output files in `dist/` directory ready for deployment.

### 7. Type Checking

```bash
# Run TypeScript compiler to check for type errors
pnpm tsc --noEmit
```

## Development Workflow

### Code Quality Checks

```bash
# Run linting (includes TypeScript strict checks)
pnpm lint

# Auto-fix linting issues
pnpm lint:fix

# Format code
pnpm format
```

### Feature Development (TDD)

1. **Write test first** (test fails - RED)
   ```bash
   # Edit tests/unit/services/pokemonService.test.ts
   pnpm test:watch
   ```

2. **Implement feature** (test passes - GREEN)
   ```bash
   # Edit src/services/pokemonService.ts
   # Watch tests automatically re-run
   ```

3. **Refactor** (maintain passing tests - REFACTOR)
   ```bash
   # Improve code quality without breaking tests
   pnpm test:watch  # Ensure tests still pass
   ```

## Key Files & Responsibilities

| File | Purpose | Design Ref |
|------|---------|-----------|
| `src/components/App.tsx` | Main app component, three grids (Collected, Wishlisted, Available) | FR-008, FR-009 |
| `src/components/PokemonCard.tsx` | Reusable card with image, name, action buttons | FR-013, FR-014, FR-015 |
| `src/components/CollectionList.tsx` | Grid container with lazy loading | FR-012 |
| `src/services/pokemonApi.ts` | PokeAPI integration with caching & retry logic | research.md #1, api-contracts.yaml |
| `src/services/collectionStorage.ts` | localStorage abstraction (migration-ready) | research.md #3, api-contracts.yaml |
| `src/services/pokemonService.ts` | Business logic: mark collected, add wishlist, state validation | api-contracts.yaml |
| `src/hooks/useCollection.ts` | React hook managing collection/wishlist state | research.md #6 |
| `src/models/Pokemon.ts` | Pokemon entity with validation | data-model.md |
| `src/models/Collection.ts` | Collection entity | data-model.md |
| `tests/` | All test files (unit, integration, contract) | Constitution II (TDD mandatory) |

## Common Tasks

### Search for a Pokemon
```bash
# In browser: Input Pokemon index (1-1025)
# App calls pokemonApi.getPokemonByIndex(index)
# Returns: { index, name, image, ... }
```

### Mark as Collected
```bash
# Click "Collect" button on Pokemon card
# Calls pokemonService.collectPokemon(pokemonIndex)
# Saves to localStorage via collectionStorage
# Updates UI via useCollection hook
```

### View Collection
```bash
# Click "My Collection" tab
# Displays all Pokemon with collected badge
# Retrieved from localStorage via collectionStorage.getCollected()
```

### Add to Wishlist
```bash
# Click "Add to Wishlist" button (only available if NOT collected)
# Calls pokemonService.addToWishlist(pokemonIndex)
# Saves to localStorage via collectionStorage
# Updates UI automatically
```

## Troubleshooting

### Dev server not starting
```bash
# Clear pnpm cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm dev
```

### Tests failing after changes
```bash
# Ensure all dependencies are installed
pnpm install

# Run tests in watch mode to see detailed errors
pnpm test:watch
```

### Port 5173 already in use
```bash
# Use different port
pnpm dev -- --port 3000
```

## Next Steps

- **Phase 1 Complete**: Design (data-model.md, contracts/, research.md) ✅
- **Phase 2 (tasks.md)**: Implementation with TDD
  - T001: Pokemon & Collection models (tests first)
  - T002: Storage & API services
  - T003: React components & hooks
  - T004: Integration & E2E tests
- **Phase 3**: Deployment

**Implementation approach**: See `tasks.md` for task breakdown and acceptance criteria. Follow TDD red-green-refactor cycle per Constitution II.
