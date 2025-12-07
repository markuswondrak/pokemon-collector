# Feature Specification: Manage Collection

**Feature Branch**: `004-manage-collection`  
**Created**: 2025-12-07  
**Status**: Draft  
**Input**: User description: "Implement Manage Collection"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mark as Caught (Priority: P1)

As a collector, I want to mark Pokemon I have caught so I can track my progress.

**Why this priority**: Core functionality of a "Collection" app.

**Independent Test**: Click the Pokeball icon on a Pokemon, refresh the page, and verify it remains marked as caught.

**Acceptance Scenarios**:

1. **Given** a Pokemon is in "Available" or "Wishlisted" state, **When** the user clicks the "Catch" (Pokeball) button, **Then** the Pokemon's state changes to "Caught".
2. **Given** a Pokemon is "Caught", **When** the user clicks the "Release" button, **Then** the Pokemon reverts to "Available" (toggle off).
3. **Given** a Pokemon is "Wishlisted", **When** it is marked as "Caught", **Then** it is automatically removed from the "Wishlist" and transferred to the "Available" state.

---

### User Story 2 - Manage Wishlist (Priority: P2)

As a collector, I want to mark Pokemon I want to find so I can focus my efforts.

**Why this priority**: Enhances the collecting experience.

**Independent Test**: Click the Heart icon, refresh, verify persistence. Try to wishlist a caught Pokemon (should fail/be disabled).

**Acceptance Scenarios**:

1. **Given** a Pokemon is "Available", **When** the user clicks the "Wishlist" (Heart) button, **Then** the Pokemon's state changes to "Wishlisted".
2. **Given** a Pokemon is "Wishlisted", **When** the user clicks the "Wishlist" button again, **Then** the Pokemon reverts to "Available".
3. **Given** a Pokemon is "Caught", **When** the user tries to click "Wishlist", **Then** the action is disabled (Transition "Caught to Wishlisted" is not allowed).

---

### User Story 3 - View Collection Grids (Priority: P2)

As a user, I want to see my caught Pokemon and wishlist in separate groups so I can easily see what I have and what I need.

**Why this priority**: Visual organization of the collection.

**Independent Test**: Mark several Pokemon with different states, scroll to the respective sections/grids, and verify they appear correctly.

**Acceptance Scenarios**:

1. **Given** the user has marked Pokemon as "Caught", **Then** they appear in the "Caught" grid/section.
2. **Given** the user has marked Pokemon as "Wishlisted", **Then** they appear in the "Wishlist" grid/section.
3. **Given** a Pokemon's status changes, **Then** it immediately moves to the correct grid/section in a wmooth transition.

### Edge Cases

- What happens if I try to catch a Pokemon that is already caught? (Toggle off).
- What happens if LocalStorage is full when saving status? (Show error toast).
- Concurrent updates in multiple tabs? (Last write wins, sync via storage event optional but good).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a "Catch" toggle button (Pokeball icon) on every Pokemon card, that is not in "Caught" state. 
- **FR-002**: System MUST provide a "Wishlist" toggle button (Heart icon) on every Pokemon card, that is not in "Caught" state. 
- **FR-003**: System MUST persist the state of each Pokemon ("Caught", "Wishlisted", "Available") in LocalStorage immediately upon change.
- **FR-004**: System MUST prevent the transition from "Caught" to "Wishlisted" (a caught Pokemon cannot be wishlisted).
- **FR-005**: System MUST automatically remove "Wishlisted" status if a Pokemon is marked as "Caught".
- **FR-006**: System MUST provide 3 distinct grids/views corresponding to the states: "Available", "Caught", and "Wishlisted".
  - The "Available" grid MUST show ONLY Pokemon that are NOT in "Caught" or "Wishlisted" lists (Mutually Exclusive).
- **FR-007**: System MUST update the UI immediately when state changes (optimistic UI).
- **FR-008**: System MUST display a Toast notification with an "Undo" action whenever a Pokemon is moved out of the current view (e.g., Caught from Available).
  - The Toast should appear for a short duration (e.g., 3-5 seconds).
  - Clicking "Undo" MUST revert the state change immediately.
- **FR-009**: System MUST use Chakra UI `Tabs` component for switching between the three views (Available, Caught, Wishlist).

### Key Entities *(include if feature involves data)*

- **UserCollection**: The data structure stored in LocalStorage key `pokemon-collector:collection`.
  - Schema: `{ "caught": number[], "wishlist": number[] }`
- **PokemonState**: Enum/Type representing the three states: Available, Caught, Wishlisted.

## Success Criteria *(mandatory)*

- **SC-001**: State changes are persisted to LocalStorage within 50ms.
- **SC-002**: User cannot put a Pokemon in both "Caught" and "Wishlisted" states simultaneously.
- **SC-003**: Collection state persists across browser reloads.

## Assumptions *(optional)*

- The "Available" state is the default for any ID not present in the `collectedIds` or `wishlistIds` lists.
- The UI layout allows for displaying multiple grids or switching between views (e.g., Tabs or stacked sections).

## Clarifications

### Session 2025-12-07

- Q: Storage format for collection data?
  - A: Key `pokemon-collector:collection`, Value `{"caught": number[], "wishlist": number[]}`.
- Q: How should the collection grids be organized?
  - A: 3 distinct grids for each state: Collected, Wishlisted, Available.
- Q: Definition of "Available" grid content?
  - A: Mutually Exclusive - "Available" shows ONLY items that are NOT Caught or Wishlisted.
- Q: UX feedback when an item leaves the current grid?
  - A: Toast notification with "Undo" action.
- Q: UI component for switching views?
  - A: Chakra UI Tabs.
