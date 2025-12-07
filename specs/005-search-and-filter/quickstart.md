# Quickstart: Search & Filter

**Feature**: Search & Filter
**Date**: 2025-12-07

## Overview

This feature adds a sticky search bar and filter tabs to the main Pokemon list view. It allows users to filter Pokemon by name, ID, and collection status (Caught/Wishlist).

## Usage

### Search

1.  **Type in the search bar**:
    *   **Text**: Type at least 3 characters to search by Pokemon name (e.g., "Pika").
    *   **Number**: Type any number to search by Pokemon ID (e.g., "25").
2.  **Clear**: Click the 'X' button on the right side of the search bar to clear the input.

### Filter

1.  **Click a tab**:
    *   **All**: Shows all Pokemon (subject to search query).
    *   **Caught**: Shows only Pokemon you have marked as caught.
    *   **Wishlist**: Shows only Pokemon you have added to your wishlist.

### Combined

*   You can use both search and filter together. For example, selecting "Caught" and searching for "Char" will show only caught Pokemon with "Char" in their name.

## Development

### Key Components

*   `src/components/SearchBar.tsx`: Handles text input and debounce.
*   `src/components/FilterTabs.tsx`: Handles status selection.
*   `src/hooks/usePokemonSearch.ts`: Contains the filtering logic.

### State

State is managed in `App.tsx` (or parent container) and passed down:
*   `searchQuery`: string
*   `filterStatus`: 'all' | 'caught' | 'wishlist'

### Testing

*   **Unit Tests**: Verify `usePokemonSearch` correctly filters lists based on various inputs.
*   **Integration Tests**: Verify the UI updates when typing and clicking tabs.
