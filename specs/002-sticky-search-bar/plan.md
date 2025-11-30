# Implementation Plan: Sticky Search Bar Redesign

**Branch**: `002-sticky-search-bar` | **Date**: 2025-11-30 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/002-sticky-search-bar/spec.md`

**Status**: Phase 0 Research → Clarifications Resolved → Ready for Design & Contracts

## Summary

This feature redesigns the Pokemon search interface from a complex 2-column layout with index/name mode toggle to a simple, Google-like single-input search bar that:
- Provides **debounced keystroke search** (300ms debounce) with automatic grid filtering on 3+ characters
- **Restructures the app layout** from 2-column sidebar to full-width single-column (Header → Search → Grids)
- **Becomes sticky/fixed at viewport top** on scroll, enabling continuous search access without header
- **Maintains visual separation** from grid content (8px+ gap) and works responsively on mobile (320px+)

Core technical approach: Refactor App.tsx layout structure, add debounced search hook, implement CSS sticky positioning with overflow management, ensure keyboard accessibility (Tab/Enter/Escape).

## Technical Context

**Language/Version**: TypeScript 5.9+ (strict mode), React 19, JavaScript ES2020+  
**Primary Dependencies**: React hooks, existing `pokemonService.searchPokemonByName()`, CSS Grid/Flexbox  
**Storage**: Browser localStorage (unchanged - collection persistence)  
**Testing**: Vitest + React Testing Library (existing test infrastructure)  
**Target Platform**: Browser (Chrome, Firefox, Safari, Edge - modern versions with CSS sticky support)  
**Project Type**: Single-page React application (SPA)  
**Performance Goals**: 
- Search results display within 350ms (300ms debounce + 50ms render)
- Sticky positioning transitions without visual jank (<16ms per frame)
- No layout shift (Cumulative Layout Shift = 0)

**Constraints**:
- Layout restructure is breaking change (requires App.tsx refactoring)
- Mobile must work on 320px width (smallest phones) without horizontal scroll
- Sticky positioning must not overlay grid content (8px+ gap maintained)
- Must reuse existing pokemonService without API changes

**Scale/Scope**: Single feature (high visibility), affects root App component, impacts 3 grids + search component

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Code Quality First ✅
- **Requirement**: Clean, maintainable code; no shortcuts for speed
- **Status**: PASS - Refactoring App.tsx will follow existing patterns (hooks-based, component composition)
- **Action**: Code review checklist will include linting compliance, complexity metrics

### Principle II: Testing Standards (NON-NEGOTIABLE) ✅
- **Requirement**: TDD mandatory; 80%+ coverage; tests before implementation
- **Status**: PASS - Existing test infrastructure (Vitest + RTL) in place
- **Action**: Phase 2 will include unit tests for debounce hook, integration tests for sticky behavior, accessibility tests for keyboard nav

### Principle III: User Experience Consistency ✅
- **Requirement**: Consistent UX across app; clear error messages; accessible workflows
- **Status**: PASS - Search bar maintains existing Pokemon card patterns; error messages reuse app-wide patterns
- **Action**: Design phase will verify component reuse, ensure placeholder text and messages match tone

### Principle IV: Fast Development Velocity ✅
- **Requirement**: Streamlined processes; <5min builds; 24-hour escalation
- **Status**: PASS - Uses existing build (Vite ~1s), no new dependencies needed
- **Action**: Development will proceed in parallel tasks (layout refactor, search hook, sticky CSS)

**Gate Status**: ✅ PASS - Feature aligns with all 4 core principles. Proceed to Phase 0 research.

## Project Structure

### Documentation (this feature)

```text
specs/002-sticky-search-bar/
├── spec.md              # Feature specification (complete, clarifications resolved)
├── plan.md              # This file (Phase 0 → Phase 1 planning)
├── research.md          # Phase 0 output (clarifications documented)
├── data-model.md        # Phase 1 output (entities, state, flows)
├── quickstart.md        # Phase 1 output (dev setup, testing approach)
├── contracts/           # Phase 1 output (API contracts, test scenarios)
│   └── search-bar.yaml  # Component contract (props, events, states)
└── checklists/
    └── requirements.md  # Quality gates checklist
```

### Source Code Changes (repository root)

```text
src/
├── components/
│   ├── App.tsx          # REFACTOR: Change layout from 2-col grid to 1-col flex column
│   ├── StickySearchBar.tsx  # NEW: Sticky search component (extracted from PokemonSearch)
│   ├── PokemonSearch.tsx # DEPRECATE: Will be replaced by StickySearchBar
│   ├── CollectionList.tsx   # NO CHANGE (grid display)
│   ├── WishlistList.tsx     # NO CHANGE (grid display)
│   ├── AvailableGrid.tsx    # NO CHANGE (grid display)
│   └── PokemonCard.tsx      # NO CHANGE (card display)
├── hooks/
│   ├── useCollection.ts # NO CHANGE
│   └── useDebounce.ts   # NEW: Debounce hook for search (300ms)
├── services/
│   ├── pokemonService.ts # NO CHANGE (use existing searchPokemonByName)
│   ├── pokemonApi.ts    # NO CHANGE
│   └── collectionStorage.ts # NO CHANGE
└── styles/
    ├── App.css          # REFACTOR: Update grid-template-columns, add sticky positioning
    └── components.css   # REFACTOR: Add StickySearchBar styles (Google-like aesthetic)
```

## Phase 0: Research

### Research Questions Resolved ✅

All clarifications have been resolved during specification phase:

1. ✅ **Search Trigger**: Debounced keystroke (300ms debounce, no button)
2. ✅ **Layout Restructure**: Full single-column (Header → Search → Grids)
3. ✅ **Minimum Query Length**: 3 characters before filtering
4. ✅ **Mobile Width**: Full-width with responsive padding

No additional research needed. Proceeding to Phase 1 design.

---

## Phase 1: Design & Contracts

### Step 1: Data Model

**Entities to create/modify**:

#### SearchState (NEW)
```
{
  query: string           // Current search input
  results: Pokemon[]       // Filtered Pokemon matching query
  isSearching: boolean    // Debounce in progress
  searchStartTime: number // Timestamp for metric tracking
}
```

#### AppState (MODIFY)
Change from:
```
{
  currentPokemon, collection, allPokemon, error, searchIndex, fetchedIndices
}
```

To:
```
{
  // ... existing fields ...
  searchQuery: string         // NEW: Current search input
  searchResults: Pokemon[]    // NEW: Filtered results (or null if no search)
  searchActive: boolean       # NEW: Has user typed 3+ characters
}
```

#### Component Props

**StickySearchBar** (NEW component):
```tsx
interface StickySearchBarProps {
  value: string                          // Current search text
  onChange: (query: string) => void      // Called on keystroke
  onClear: () => void                    // Called on Escape or clear button
  placeholder?: string                   // Default: "Search Pokemon by name..."
  minChars?: number                      // Default: 3
  debounceMs?: number                    // Default: 300
}
```

**App.tsx** (REFACTOR):
```tsx
// Layout change from:
// .app-main { display: grid; grid-template-columns: 1fr 2fr; }

// To:
// .app { display: flex; flex-direction: column; }
// .search-section { position: sticky; top: 0; z-index: 10; ... }
// .three-grids-section { ... }
```

### Step 2: API Contracts

**API Contract: StickySearchBar Component**

```yaml
name: StickySearchBar
type: React Functional Component
inputs:
  - name: value
    type: string
    required: true
    description: Current search input value
  - name: onChange
    type: (query: string) => void
    required: true
    description: Callback when search input changes (after debounce)
  - name: onClear
    type: () => void
    required: true
    description: Callback when search is cleared (Escape or button click)
  - name: placeholder
    type: string
    required: false
    default: "Search Pokemon by name..."
    description: Placeholder text shown in input
  - name: minChars
    type: number
    required: false
    default: 3
    description: Minimum characters before search activates
  - name: debounceMs
    type: number
    required: false
    default: 300
    description: Debounce delay in milliseconds

outputs:
  - name: UI
    description: Single centered input field with clear button (X icon or Escape affordance)
    
behaviors:
  - name: debounced_keystroke_search
    description: Search updates automatically 300ms after last keystroke
    acceptance:
      - "When user types 3rd character, results update within 350ms"
      - "When user types 1st-2nd character, no results yet message shown"
      - "Rapid typing (keystroke < 300ms apart) only triggers search once"
  
  - name: sticky_positioning
    description: Becomes fixed at viewport top when header scrolls out
    acceptance:
      - "On scroll past header, search bar remains at top (position: sticky; top: 0)"
      - "Grids display below search bar with 8px+ gap"
      - "Search bar does not overlay grid content"
  
  - name: keyboard_accessible
    description: Full keyboard support (Tab, Enter, Escape)
    acceptance:
      - "Tab key focuses search input"
      - "Escape key clears input and resets grids to show all Pokemon"
      - "Enter key not required (search on keystroke, not submission)"
  
  - name: mobile_responsive
    description: Works on 320px width without horizontal scroll
    acceptance:
      - "Search field spans full viewport width on mobile"
      - "No horizontal scroll or layout shift"
      - "Centered via responsive padding (not max-width)"
```

**API Contract: useDebounce Hook**

```yaml
name: useDebounce
type: React Custom Hook
inputs:
  - name: value
    type: any
    description: Value to debounce (typically string search query)
  - name: delay
    type: number
    default: 300
    description: Debounce delay in milliseconds

outputs:
  - name: debouncedValue
    type: any
    description: Debounced version of input value
  - name: isDebouncing
    type: boolean
    description: True while debounce timer is active

behaviors:
  - name: debounce_timing
    description: Returns updated value after delay since last call
    acceptance:
      - "If input changes, debounce timer resets"
      - "After 300ms without changes, debouncedValue updates"
      - "isDebouncing is true during timer, false when settled"
```

### Step 3: Development Quickstart

**Setup & Testing Approach**:

```markdown
## Testing Strategy for Sticky Search Bar

### Unit Tests
- `useDebounce` hook: timing, state updates, cleanup
- `StickySearchBar` component: render, input handling, clear action
- Search filter logic: 3-char minimum, case-insensitive matching

### Integration Tests
- App.tsx layout restructure: grids position, no layout shift
- Sticky positioning: scroll behavior, no overlay, 8px gap
- End-to-end search: type → debounce → filter grids → clear
- Keyboard navigation: Tab, Escape, focus management

### Accessibility Tests
- WCAG 2.1 AA compliance: color contrast, focus indicators
- Screen reader: aria-live updates for search state
- Keyboard-only navigation: all interactions via keyboard

### Performance Tests
- Debounce timing: <350ms total (300ms debounce + 50ms render)
- Sticky positioning smoothness: no jank during scroll
- Memory: no leaks in debounce hook (cleanup on unmount)

### Browser Compatibility
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers: iOS Safari, Chrome Android
- Test sticky positioning fallback (JavaScript-based if needed)
```

**Build & Run**:

```bash
# Start dev server (Vite, ~1s build)
pnpm dev

# Run tests in watch mode
pnpm test:watch

# Check specific test file
pnpm test src/hooks/useDebounce.test.ts

# Build production bundle
pnpm build
```

---

## Phase 1 Deliverables Checklist

- [x] Specification completed with all clarifications resolved
- [x] data-model.md: Entity definitions, state management, component props
- [x] contracts/search-bar-api.yaml: Component API contract and test scenarios
- [x] quickstart.md: Dev environment, testing approach, build commands
- [x] research.md: Clarification documentation (already created)
- [x] Agent context updated: Technology stack (useDebounce hook, sticky positioning)

---

## Next Steps

1. **Fill data-model.md** with detailed entity definitions and state flow diagrams
2. **Generate contracts/** with component APIs and test acceptance criteria
3. **Create quickstart.md** with testing setup and environment guide
4. **Update agent context** via `update-agent-context.sh copilot`
5. **Proceed to Phase 2** with `/speckit.tasks` to generate task breakdown

---

## Key Decisions & Rationale

| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| **Debounced keystroke** (300ms) | Matches Google search UX, reduces re-renders, better performance than instant search | Explicit button submission (rejected: less intuitive), instant search (rejected: performance hit) |
| **Full layout restructure** | Gives search maximum prominence, improves discoverability, aligns with "centered between header and grids" requirement | Keep sidebar (rejected: contradicts centered requirement) |
| **3-character minimum** | Better performance, fewer false matches, balances discoverability with filtering (rejected: 1-char or 2-char too permissive) | Custom length (rejected: 3 is optimal for Pokemon names) |
| **CSS `position: sticky`** | Native browser support, performant, no JS overhead | JavaScript-based sticky (fallback only), `position: fixed` (rejected: doesn't preserve scroll context) |
| **Full-width mobile** (no max-width) | Responsive, scales naturally to any viewport, no constraints | Max-width container (rejected: wastes screen space on mobile) |
| **Reuse existing pokemonService** | No API changes needed, leverages proven search logic, reduces code changes | Create new search service (rejected: unnecessary duplication) |


<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
