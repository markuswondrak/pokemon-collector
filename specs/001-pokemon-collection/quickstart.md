# Quick Start: Pokemon Collection Organizer

**Goal**: Get the development environment running in <5 minutes

## Prerequisites

- Node.js 18+ (check with `node --version`)
- npm or yarn (comes with Node.js)
- Git

## Setup Steps

### 1. Initialize React + Vite Project

```bash
# Navigate to repository root
cd /home/markus/workspace/pokemon-collector

# Create React + Vite project (if not already existing)
# This will be done as part of implementation task T001

# Install dependencies
npm install

# Verify Vite is working
npm run dev  # Should start dev server on http://localhost:5173
```

### 2. Install Required Dependencies

```bash
# Core dependencies (already in package.json)
npm install  # React 18, Vite, axios

# Dev dependencies for testing (already in package.json)
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
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
└── main.jsx

tests/
├── unit/
├── integration/
└── contract/
```

### 4. Run Development Server

```bash
npm run dev
```

Browser opens to `http://localhost:5173` with hot-reload enabled.

### 5. Run Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### 6. Build for Production

```bash
npm run build
```

Output files in `dist/` directory ready for deployment.

## Development Workflow

### Code Quality Checks

```bash
# Run linting
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code
npm run format
```

### Feature Development (TDD)

1. **Write test first** (test fails - RED)
   ```bash
   # Edit tests/unit/services/pokemonService.test.js
   npm run test:watch
   ```

2. **Implement feature** (test passes - GREEN)
   ```bash
   # Edit src/services/pokemonService.js
   # Watch tests automatically re-run
   ```

3. **Refactor** (maintain passing tests - REFACTOR)
   ```bash
   # Improve code quality without breaking tests
   npm run test:watch  # Ensure tests still pass
   ```

## Key Files & Responsibilities

| File | Purpose |
|------|---------|
| `src/components/App.jsx` | Main app component & state management |
| `src/services/pokemonApi.js` | PokeAPI calls (search by index, fetch Pokemon data) |
| `src/services/collectionStorage.js` | localStorage persistence (collected, wishlist) |
| `src/hooks/useCollection.js` | React hook managing collection state |
| `src/models/Pokemon.js` | Pokemon entity definition |
| `tests/` | All test files (unit, integration, contract) |

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
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Tests failing after changes
```bash
# Ensure all dependencies are installed
npm install

# Run tests in watch mode to see detailed errors
npm run test:watch
```

### Port 5173 already in use
```bash
# Use different port
npm run dev -- --port 3000
```

## Next Steps

- **Phase 1 Development**: Implement models and services (tests first!)
- **Phase 2 Development**: Build React components
- **Phase 3**: Integration testing & deployment
- **Phase 4**: Polish & optimization

See `tasks.md` for detailed implementation task list.
