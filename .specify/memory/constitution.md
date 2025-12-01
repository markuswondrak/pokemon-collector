<!-- 
╔═══════════════════════════════════════════════════════════════════════════╗
║                       SYNC IMPACT REPORT                                  ║
╚═══════════════════════════════════════════════════════════════════════════╝

VERSION CHANGE: 1.0.0 → 1.1.0 (project setup and merged specifications)
RATIONALE: MINOR version bump - added new sections documenting project setup,
  build/development tools, and merged specs from 001-pokemon-collection and
  002-sticky-search-bar. No backward-incompatible governance changes.

SECTIONS ADDED:
  • Project Setup & Architecture (core components, services, data models)
  • Build & Development Tools (tech stack, scripts, dependencies)
  • Baseline Features (consolidated user stories from specs 001 and 002)

SECTIONS UNCHANGED:
  • Core Principles (I-IV remain stable)
  • Development Standards (maintained)
  • Governance (maintained)

TEMPLATES REVIEWED FOR CONSISTENCY:
  ✅ .specify/templates/plan-template.md - Aligned with project setup
  ✅ .specify/templates/spec-template.md - Requirements integrated
  ✅ .specify/templates/tasks-template.md - Tech stack documented
  ✅ .specify/templates/commands/speckit.implement.prompt.md - Tool guidance preserved

KEY ALIGNMENTS:
  • Code Quality → TypeScript strict mode, ESLint enforced
  • Testing Standards → Vitest + React Testing Library in pipeline
  • UX Consistency → Design patterns in components (Pokemon cards, search bar)
  • Development Velocity → Vite for <1s builds, pnpm for fast installs

FOLLOW-UP ITEMS:
  • Configure pre-commit hooks for linting enforcement
  • Set up CI/CD pipeline for automated testing
  • Create component library documentation
  • Establish performance baselines for lazy loading

-->

# Pokemon Collector Constitution

## Core Principles

### I. Code Quality First
Clean, maintainable, and readable code is non-negotiable. Every line committed must meet or exceed established quality standards. Code reviews MUST verify adherence to linting rules, style guides, and complexity thresholds. Technical debt MUST be addressed proactively; no shortcuts for speed. Refactoring is a continuous practice, not a deferred task. Code simplicity is prioritized over clever solutions.

### II. Testing Standards (NON-NEGOTIABLE)
Test-driven development is mandatory. Tests MUST be written before implementation; TDD red-green-refactor cycle strictly enforced. Unit tests MUST cover all critical logic paths (minimum 80% coverage). Integration tests MUST verify component interactions. Automated test suites MUST pass on all commits. Tests MUST be maintainable and document expected behavior. No feature merges without test approval.

### III. User Experience Consistency
Every user-facing feature MUST maintain consistent UX across the application. Design patterns and UI components MUST be reused; new patterns require architecture review. Error messages MUST be clear, actionable, and consistent in tone. API responses and data formats MUST follow established contracts. User workflows MUST be intuitive and documented. Accessibility and usability MUST be verified before release.

### IV. Fast Development Velocity
Development processes MUST be streamlined to maximize speed without sacrificing quality. Automation MUST eliminate repetitive manual tasks (builds, tests, deployments). Tooling MUST be kept current and efficient. Feature flags MUST enable rapid iteration and deployment. Build times MUST remain under 5 minutes. Development environment setup MUST be documented and reproducible. Blocking issues MUST be escalated and resolved within 24 hours.

## Development Standards

- **Linting & Formatting**: All code MUST pass linter checks; auto-formatting is enforced pre-commit
- **Code Review**: All PRs require peer review verifying code quality, testing, and principle compliance
- **Performance**: Critical code paths MUST have performance baselines; regressions trigger investigation
- **Documentation**: Public APIs MUST be documented; complex logic MUST include rationale comments
- **Test Execution**: All test commands MUST use the `--run` flag (e.g., `pnpm test --run`) for one-time execution in automated workflows, CI/CD pipelines, and implementation tasks; watch mode only when explicitly requested by the user

## Governance

This constitution supersedes all other development practices and guidelines. All team members MUST comply with these principles in daily work. Amendments require:
1. Documented justification with measurable impact
2. Team consensus or leadership approval
3. Clear migration plan for existing code
4. Update to this document with rationale

All PRs MUST include a constitution compliance checklist. Code reviews MUST explicitly verify principle adherence. Violations MUST be resolved before merge. Metrics MUST be tracked quarterly to ensure principles are sustained.

**Version**: 1.1.0 | **Ratified**: 2025-11-29 | **Last Amended**: 2025-12-01

## Project Setup & Architecture

### Core Technology Stack

- **Language**: TypeScript 5.9+ (strict mode enabled)
- **UI Framework**: React 19 with React DOM 19
- **Build Tool**: Vite 7+ (source maps enabled, terser minification)
- **Runtime Environment**: Node.js 18+ with pnpm package manager (v8+)
- **Data Source**: PokéAPI (pokeapi.co) with official artwork images
- **State Persistence**: Browser localStorage (abstraction interface supports future cloud migration)

### Core Components

#### UI Components
- **App.tsx**: Main orchestrator component managing search, display, and collection state
- **StickySearchBar.tsx**: Sticky/fixed search input with 3+ character minimum, 300ms debounce
- **CollectionList.tsx**: Grid display of collected Pokemon with status badges
- **WishlistList.tsx**: Grid display of wishlisted Pokemon with visual indicators
- **AvailableGrid.tsx**: Grid display of remaining uncollected/unwishlisted Pokemon
- **PokemonCard.tsx**: Individual Pokemon card with image, name, index, and action buttons
- **LazyLoadingGrid.tsx**: Lazy-loading container for efficient rendering of large datasets

#### Custom Hooks
- **useDebounce**: Debouncing utility for search queries (300ms default)
- **useCollection**: State management hook for collection operations

#### Data Models
- **Pokemon**: Interface with index, name, image, collected, wishlist flags
- **Collection**: Persistent storage interface for collected and wishlisted Pokemon

#### Services & API Integration
- **pokemonApi.ts**: PokéAPI client for batch fetching Pokemon data
- **pokemonService.ts**: Business logic for Pokemon searching and filtering
- **collectionStorage.ts**: Abstraction for localStorage persistence with cloud migration path

### Layout & Styling

The application uses a single-column vertical layout:
- **Header** → **Sticky Search Bar** → **Three Grids** (Collected, Wishlisted, Available)
- **Responsive Design**: Full-width on mobile (320px+) with centered containers on desktop
- **CSS Grid**: Auto-fit/auto-fill for responsive column counts without hardcoded breakpoints
- **Accessibility**: WCAG 2.1 AA compliance with 4.5:1 color contrast, 44px minimum touch targets
- **Design Aesthetic**: Minimalist, Google-like search interface with clean borders and subtle shadows

### Pokemon Dataset

- **Maximum Pokemon**: 1,025 (current official generation limit)
- **Ordering**: By index number in ascending order (1-1025)
- **Image Format**: Official high-resolution artwork from PokéAPI
- **Fallback**: Generic Pokemon silhouette placeholder if image fails to load
- **Search**: Case-insensitive, partial name matching (e.g., "char" finds "Charmander")

## Build & Development Tools

### Development Workflow

```bash
# Local development with hot module reload (HMR)
pnpm dev          # Runs Vite dev server on http://localhost:5173

# Production build
pnpm build        # Bundles to dist/ with source maps and terser minification

# Build preview
pnpm preview      # Serves production build locally for testing

# Code quality
pnpm lint         # Runs ESLint on all files
pnpm test         # Runs Vitest with automatic browser polling
pnpm test --run   # One-time test execution (used in CI/CD and automation)
pnpm test:coverage # Generates code coverage reports
```

### Build Configuration

#### Vite (`vite.config.js`)
- **Dev Server**: Port 5173, auto-open, strict port enforcement disabled
- **Build Output**: `dist/` directory
- **Minification**: Terser for optimized production bundles
- **Source Maps**: Enabled for production debugging

#### Testing (`vitest.config.js`)
- **Test Runner**: Vitest with jsdom environment
- **Coverage Tool**: Integrated coverage reporting
- **Component Testing**: React Testing Library for component behavior validation

#### Linting (`eslint.config.js`)
- **Rules**: ESLint + TypeScript ESLint + React Hooks rules
- **Scope**: All JavaScript/TypeScript files
- **Auto-fix**: Available via `pnpm lint:fix` (to be configured)

### Dependencies Management

#### Runtime Dependencies
- `react@^19.2.0`: UI component framework
- `react-dom@^19.2.0`: React DOM rendering
- `axios@^1.13.2`: HTTP client for PokéAPI requests

#### Development Dependencies
- `typescript@~5.9.3`: Type checking and transpilation
- `vite@^7.2.4`: Bundler and dev server
- `vitest@^4.0.14`: Test runner (Vitest)
- `@testing-library/react@^16.3.0`: Component testing utilities
- `@testing-library/jest-dom@^6.9.1`: DOM matchers for assertions
- `@testing-library/user-event@^14.6.1`: User interaction simulation
- `jsdom@^27.2.0`: DOM environment for testing
- `eslint@^9.39.1`: Code quality linter
- `typescript-eslint@^8.46.4`: TypeScript + ESLint integration
- `@vitejs/plugin-react@^5.1.1`: Vite React support
- `eslint-plugin-react-hooks@^7.0.1`: React Hooks linting rules
- `eslint-plugin-react-refresh@^0.4.24`: Fast Refresh validation
- `terser@^5.44.1`: JavaScript minifier
- `globals@^16.5.0`: Global variable definitions
- `@types/react@^19.2.5`: React type definitions
- `@types/react-dom@^19.2.3`: React DOM type definitions
- `@types/node@^24.10.1`: Node.js type definitions

## Baseline Features

### 1. Collection Management (Feature 001 - Core Functionality)

**User Story 1: Mark Pokemon as Collected**
- Users can identify Pokemon by index number (1-1025)
- Users can mark individual Pokemon as collected
- Collected Pokemon display with a visual badge/indicator
- System prevents duplicate collected entries
- Collection state persists across sessions via localStorage

**User Story 2: Add Pokemon to Wishlist**
- Users can add Pokemon to a wishlist if not already collected
- Wishlist Pokemon display with a distinct visual indicator
- System prevents adding collected Pokemon to wishlist
- Wishlist state persists across sessions
- Direct transitions between Collected ↔ Wishlisted allowed as atomic operations

**User Story 3: Three-Grid Display with Lazy Loading**
- Collected, Wishlisted, and Available grids display with status-based separation
- Each grid shows only Pokemon matching that status
- Lazy loading on scroll - only visible Pokemon are rendered
- Cards display Pokemon image, name, index, and action buttons
- Responsive CSS Grid layout with auto-fit/auto-fill column adaptation

**User Story 4: Search Pokemon by Name**
- Case-insensitive, partial name matching (e.g., "char" → "Charmander")
- Centrally placed search panel above grids
- Hybrid search: debounced keystroke (300ms) + optional lens icon button
- No results display centered message: "No Pokemon found matching '{query}'"
- Clear/reset functionality to restore all Pokemon

### 2. Sticky Search Bar Redesign (Feature 002 - UX Enhancement)

**User Story 5: Google-like Search Interface**
- Single centered input field with minimalist aesthetic
- Placeholder text: "Search Pokemon by name..."
- Full-width on mobile with responsive padding, centered on desktop
- 3+ character minimum before filtering activates
- No visible button required; keystroke triggers search automatically

**User Story 6: Sticky Search Positioning**
- Search field remains fixed at top of viewport when scrolling past header
- Header disappears on scroll, search bar stays visible
- Search field does NOT overlay or obscure Pokemon cards
- Minimum 8px gap between sticky search and grid content
- Keyboard accessible: Enter to submit, Escape to clear

**User Story 7: Single-Input Focus**
- Eliminates mode toggles and index-based search options
- Concentrates on primary use case: Pokemon name discovery
- Provides clear affordances for search interaction and reset

## Performance & Accessibility Standards

- **Build Time Target**: Under 5 minutes (Vite achieves <1s)
- **Lazy Loading**: Pokemon cards load on viewport visibility
- **Code Coverage Minimum**: 80% unit test coverage for critical paths
- **Keyboard Navigation**: Full support via Tab and arrow keys, Escape to reset
- **Color Contrast**: 4.5:1 ratio (WCAG 2.1 AA minimum)
- **Touch Targets**: 44x44px minimum for buttons and interactive elements
- **Search Performance**: Results update within 350ms (300ms debounce + 50ms render)
- **Responsive Breakpoints**: 320px (mobile) through desktop with fluid scaling

**Version**: 1.1.0 | **Ratified**: 2025-11-29 | **Last Amended**: 2025-12-01
```
