# Data Model: Sticky Search Bar

**Feature**: `002-sticky-search-bar`  
**Created**: 2025-11-30  
**Status**: Phase 1 Design Output

## Overview

This document defines the entities, state management, and data flows for the sticky search bar feature. Changes are minimal to the existing data model; the refactoring is primarily structural (layout and component composition) rather than data-driven.

---

## Entities

### 1. SearchQuery (NEW)

**Purpose**: Represents the user's current search input and filtering state.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | `string` | Yes | Current search input (e.g., "pika", "char") |
| `minChars` | `number` | No | Minimum characters before filtering (default: 3) |
| `isActive` | `boolean` | No | Whether search has 3+ characters and filtering is active |
| `timestamp` | `number` | No | When search started (for metrics/timing) |

**Validation Rules**:
- `text` must be a string (empty string allowed)
- `text.length >= minChars` before filtering activates
- Case-insensitive matching (search logic handles this)
- Special characters and accents preserved (passed to pokemonService.searchPokemonByName)

**Relationships**:
- Used by: `App.tsx` state
- Processed by: `pokemonService.searchPokemonByName()`
- Affects: Filter state of all three grids (Collected, Wishlisted, Available)

---

### 2. SearchResults (NEW)

**Purpose**: Represents the Pokemon that match the current search query.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `query` | `string` | Yes | The search query that produced these results |
| `matchedPokemon` | `Pokemon[]` | Yes | Array of Pokemon matching the query |
| `count` | `number` | Yes | Number of matches |
| `displayEmpty` | `boolean` | No | Show empty state message if count === 0 |

**Validation Rules**:
- Only populated when `searchQuery.text.length >= 3`
- If `matchedPokemon.length === 0`, display empty state with message: "No Pokemon found matching '[query]'"
- Results must be sorted by Pokemon index (maintained from allPokemon array)

**Relationships**:
- Derived from: `SearchQuery` + `allPokemon` array
- Displayed in: All three grids (Collected, Wishlisted, Available grids filter based on search results)
- Updated by: `pokemonService.searchPokemonByName(query)`

---

### 3. StickySearchState (NEW)

**Purpose**: Tracks the visual state of the sticky search bar during scroll.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `isSticky` | `boolean` | Yes | Whether search bar is in sticky/fixed position |
| `stickyOffset` | `number` | No | Top offset when sticky (usually 0) |
| `showBelowSearch` | `boolean` | No | Grids positioned below search (always true when sticky) |
| `gapSize` | `number` | No | Minimum gap between search bar and grids (8px) |

**Validation Rules**:
- `isSticky` toggles when header scrolls out of view
- `gapSize` must be >= 8px (prevent overlay)
- `stickyOffset` typically 0 (top of viewport)

**Relationships**:
- CSS-driven state (using `position: sticky; top: 0`)
- Affects: Grid rendering (must leave space below search bar)
- Monitored by: Intersection Observer (header visibility) or scroll listener (fallback)

---

## State Management

### App Component State (REFACTORED)

**Current State Structure**:
```typescript
{
  currentPokemon: Pokemon | null
  collection: Pokemon[]
  allPokemon: Pokemon[]
  error: string
  searchIndex: number | undefined
  fetchedIndices: Set<number>
}
```

**New State Structure**:
```typescript
{
  // Existing fields (unchanged)
  currentPokemon: Pokemon | null
  collection: Pokemon[]
  allPokemon: Pokemon[]
  error: string
  fetchedIndices: Set<number>
  
  // NEW: Search-related state
  searchQuery: string                  // Current search input
  searchResults: Pokemon[] | null      // Filtered Pokemon (null = no active search)
  isSearchActive: boolean              // searchQuery.length >= 3
  
  // DEPRECATED: Remove in this feature
  // searchIndex: number | undefined   // (remove - only name search now)
}
```

**State Transitions**:

```
User Flow: Keystroke → Debounce → Filter → Update Grids

1. User types in search field
   ↓
   onChange event triggers
   ↓
   setSearchQuery(newText)
   ↓
   
2. useDebounce hook waits 300ms for more keystrokes
   (If user keeps typing, timer resets)
   ↓
   
3. Debounce settles (no keystroke for 300ms)
   ↓
   if (searchQuery.length >= 3):
     searchResults = pokemonService.searchPokemonByName(searchQuery)
     isSearchActive = true
   else:
     searchResults = null
     isSearchActive = false
   ↓
   
4. Grids re-render with filtered results
   ↓
   
5. User clears search (Escape or clear button)
   ↓
   setSearchQuery("")
   searchResults = null
   isSearchActive = false
   ↓
   Grids re-render showing all Pokemon
```

---

## Component Props & Interfaces

### StickySearchBar Component (NEW)

```typescript
interface StickySearchBarProps {
  // Input
  value: string
  onChange: (value: string) => void
  onClear: () => void
  
  // Optional
  placeholder?: string         // Default: "Search Pokemon by name..."
  minChars?: number           // Default: 3
  debounceMs?: number         // Default: 300
  
  // Accessibility
  ariaLabel?: string          // Default: "Search Pokemon by name"
  ariaDescribedBy?: string    // ID of help/instruction text
}

interface StickySearchBarState {
  isSticky: boolean
  hasFocus: boolean
  showClearButton: boolean    // true if value.length > 0
}
```

### useDebounce Hook (NEW)

```typescript
interface UseDebounceOptions {
  delay?: number              // Default: 300
}

function useDebounce<T>(
  value: T,
  options?: UseDebounceOptions
): {
  debouncedValue: T
  isDebouncing: boolean
}
```

### App Component (REFACTORED)

```typescript
interface AppProps {}

interface AppState {
  currentPokemon: Pokemon | null
  collection: Pokemon[]
  allPokemon: Pokemon[]
  error: string
  fetchedIndices: Set<number>
  
  // NEW
  searchQuery: string
  searchResults: Pokemon[] | null
  isSearchActive: boolean
}
```

---

## Data Flows

### Search Flow (Happy Path)

```
┌─────────────────────────────────────────────────────────────┐
│ User Types Pokemon Name in Search Bar                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │ StickySearchBar input  │
        │ onChange triggered     │
        └────────┬───────────────┘
                 │
                 ▼
    ┌──────────────────────────────┐
    │ setSearchQuery(userInput)     │
    │ trigger useDebounce timer     │
    └────────┬─────────────────────┘
             │
             ▼ (300ms passes, no new keystroke)
    ┌──────────────────────────────┐
    │ if (input.length >= 3):       │
    │   searchResults =             │
    │   pokemonService             │
    │   .searchPokemonByName()      │
    │   isSearchActive = true       │
    │ else:                         │
    │   searchResults = null        │
    │   isSearchActive = false      │
    └────────┬─────────────────────┘
             │
             ▼
    ┌──────────────────────────────┐
    │ App state updates            │
    │ (searchQuery, searchResults)  │
    └────────┬─────────────────────┘
             │
             ▼
    ┌──────────────────────────────┐
    │ Grids re-render with filter  │
    │ - Collected (if match)       │
    │ - Wishlisted (if match)      │
    │ - Available (if match)       │
    │ OR empty states if no match  │
    └──────────────────────────────┘
```

### Clear/Reset Flow

```
┌─────────────────────────────────────────────────────────────┐
│ User Presses Escape or Clicks Clear Button                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │ StickySearchBar        │
        │ onClear triggered      │
        └────────┬───────────────┘
                 │
                 ▼
    ┌──────────────────────────────┐
    │ App.handleSearchClear():      │
    │  - setSearchQuery("")         │
    │  - setSearchResults(null)     │
    │  - setIsSearchActive(false)   │
    └────────┬─────────────────────┘
             │
             ▼
    ┌──────────────────────────────┐
    │ Grids re-render with all     │
    │ Pokemon (unfiltered)         │
    └──────────────────────────────┘
```

### Sticky Positioning Flow

```
┌──────────────────────────────────────────┐
│ Page Load / User Scrolls                │
└────────────┬─────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────┐
│ Intersection Observer detects:                 │
│ Is header still in viewport?                   │
└────────┬───────────────────────────────────────┘
         │
    ┌────┴─────────────────────────────────────┐
    │                                           │
    ▼ (Header visible)          ▼ (Header out of view)
┌────────────────┐          ┌─────────────────────┐
│ search-section │          │ search-section      │
│ position:      │          │ position: sticky    │
│ static         │          │ top: 0              │
│ z-index: auto │          │ z-index: 10         │
└────────────────┘          │ box-shadow: 0 2px   │
                            │ 8px rgba(0,0,0,0.1) │
                            └─────────────────────┘
                            (stays at top on scroll)
```

---

## Edge Cases & Handling

| Edge Case | Behavior | Validation |
|-----------|----------|-----------|
| **User types 1-2 chars** | No filtering; show all Pokemon + placeholder text "Keep typing..." | `searchQuery.length < 3` |
| **Search returns 0 results** | All three grids show empty states with message "No Pokemon found matching '[query]'" | `searchResults.length === 0` |
| **User types special chars** (e.g., "nidoran♂") | Passed to pokemonService as-is; service handles accent/special char matching | Service handles validation |
| **Mobile 320px viewport** | Search bar spans full width with responsive padding; no horizontal scroll | CSS: `width: 100%; padding: 0 1rem; max-width: none;` |
| **Header + Search visible** | Search field position: static (not sticky yet) | CSS: `position: static; top: auto;` |
| **Rapid scroll** | Sticky positioning remains smooth; no jank | CSS transform/will-change properties optimize rendering |
| **Search, then scroll to top** | Search bar should return to static position naturally (no double-sticky) | CSS sticky handles this automatically |
| **Window resize during scroll** | Sticky bar repositions correctly; no layout shift | Re-calculate sticky boundary on resize event |
| **Empty search field** | Clears filter; shows all Pokemon again | `searchQuery === ""` → `searchResults = null` |
| **User unfocuses and refocuses** | Previous search value persists in field; no state loss | State managed in App, not StickySearchBar (controlled component) |

---

## Performance Considerations

### Debounce Optimization
- **300ms delay**: Reduces API calls and re-renders while user is actively typing
- **Cleanup on unmount**: useDebounce hook must clear timeout timer to prevent memory leaks
- **Metric tracking**: Record `searchStartTime` to measure actual response time (goal: <350ms total)

### Rendering Optimization
- **Search state isolated**: Only re-render grids when search results change, not on every keystroke
- **Memoization**: Consider useMemo for filtered grid results if performance degrades
- **Sticky positioning**: CSS `position: sticky` is GPU-accelerated; avoid JavaScript scroll listeners if possible

### Layout Shift Prevention
- **Gap enforcement**: 8px+ gap between search bar and grids prevents layout shift (CLS = 0)
- **Height fixed**: Search bar height must be consistent (no dynamic height changes)
- **No overlay**: Search bar never layered on top of grid content

---

## Backward Compatibility

### Breaking Changes
- **Layout restructure**: 2-column sidebar layout → single-column vertical (breaking change)
- **Index-based search**: Removed (only name search supported now)
- **PokemonSearch component**: Deprecated (replaced by StickySearchBar)

### Compatibility Mitigation
- **Existing data**: All Pokemon, collection, wishlist data unchanged (localStorage format same)
- **API contracts**: pokemonService.searchPokemonByName() unchanged (no API breaking changes)
- **Tests**: Existing unit/integration tests for grids remain valid (test refactored App layout)

---

## Summary of Changes

| Component | Change Type | Impact |
|-----------|------------|--------|
| **App.tsx** | Refactor | Layout change (grid to flex column); add search state management |
| **StickySearchBar.tsx** | New | New component for search input + sticky positioning |
| **useDebounce.ts** | New | New hook for debounce logic (300ms) |
| **PokemonSearch.tsx** | Deprecate | Remove from app (replaced by StickySearchBar) |
| **App.css** | Refactor | Update grid-template, add sticky styles |
| **components.css** | Refactor | Update for StickySearchBar styling |
| **pokemonService** | No change | Reuse existing searchPokemonByName() |
| **collectionStorage** | No change | No changes needed |

