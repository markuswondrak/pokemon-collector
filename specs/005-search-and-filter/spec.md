# Feature Specification: Search & Filter

**Feature Branch**: `005-search-and-filter`  
**Created**: 2025-12-07  
**Status**: Draft  
**Input**: User description: "Implement Search & Filter"

## Clarifications

### Session 2025-12-07
- Q: Should search match only names or also IDs? → A: Name and ID (e.g., searching "25" finds Pikachu).
- Q: Should the 3-character limit apply to ID searches? → A: No, trigger immediately for numeric input.
- Q: How should the user clear the search? → A: Clear button inside input ('X' icon).
- Q: How should the search input be handled to prevent performance issues? → A: Debounce (300ms).
- Q: How should special characters in search be handled? → A: Literal match (try to find them in names).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Search by Name or ID (Priority: P1)

As a user, I want to find a specific Pokemon by typing its name or ID so I don't have to scroll through the entire list.

**Why this priority**: Essential navigation tool for large datasets (1000+ items).

**Independent Test**: Type "Pikachu" or "25" in the search bar and verify the correct Pokemon are shown.

**Acceptance Scenarios**:

1. **Given** the user is on the main view, **When** they type 3 or more characters into the search bar OR type any numeric value, **Then** the list updates to show Pokemon whose names contain the search string (case-insensitive) OR whose ID matches the string.
2. **Given** the user types fewer than 3 characters AND the input is not numeric, **Then** the filter is NOT applied (full list shown).
3. **Given** the search yields no results, **Then** a "No Pokemon found" message is displayed.
4. **Given** the search input has text, **When** the user clicks the clear button, **Then** the input is cleared and the full list is shown.

---

### User Story 2 - Filter by Status (Priority: P2)

As a user, I want to see only my caught Pokemon or my wishlist so I can focus on specific subsets of my collection.

**Why this priority**: Helps users manage their collection tasks.

**Independent Test**: Select "Caught" filter and verify only caught Pokemon are visible.

**Acceptance Scenarios**:

1. **Given** the user selects the "Caught" filter, **Then** only Pokemon marked as "Caught" are displayed.
2. **Given** the user selects the "Wishlist" filter, **Then** only Pokemon marked as "Wishlist" are displayed.
3. **Given** the user selects "All", **Then** all Pokemon are displayed.

---

### User Story 3 - Sticky Search Bar and Filter Tabs (Priority: P2)

As a user, I want the search bar and filter tabs to be always accessible so I can search or filter without scrolling back to the top.

**Why this priority**: Usability improvement.

**Independent Test**: Scroll down the list and verify the search bar and filter tabs remain fixed at the top of the viewport.

**Acceptance Scenarios**:

1. **Given** the user scrolls down the page, **Then** the search bar and filter tabs remain visible at the top of the screen (sticky positioning).

### Edge Cases

- What happens if I search for a name that doesn't exist? (Empty state).
- What happens if I combine search and status filter? (Intersection of results).
- Special characters in search? (Literal match - e.g., "Mr. Mime" matches "Mr. Mime").

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a search input field at the top of the main view.
- **FR-002**: System MUST keep the search bar visible at the top of the viewport while scrolling (sticky).
- **FR-003**: System MUST filter the displayed Pokemon list based on the text input (matching Name or ID).
- **FR-004**: System MUST apply the text filter when the input length is 3 characters or more, OR if the input is numeric (regardless of length).
- **FR-005**: System MUST perform filtering locally on the client side (no API calls).
- **FR-006**: System MUST provide filter options for "All", "Caught", and "Wishlist" (e.g., tabs or dropdown).
- **FR-007**: System MUST debounce the search input processing by 300ms.
- **FR-008**: System MUST support combined filtering (e.g., Search "Pika" AND Filter "Caught").
- **FR-009**: System MUST keep the filter tabs visible at the top of the viewport while scrolling (sticky).
- **FR-010**: System MUST provide a clear button ('X') inside the search input that appears when text is present and clears the input when clicked.
- **FR-011**: System MUST treat special characters in the search input as literal characters for matching (no sanitization or stripping).

### Key Entities *(include if feature involves data)*
### Key Entities *(include if feature involves data)*

- **SearchQuery**: The current text string entered by the user.
- **FilterState**: The current status filter selection.

## Success Criteria *(mandatory)*

- **SC-001**: Search results update within 100ms of typing (perceived instant).
- **SC-002**: Filtering correctly handles the intersection of Name and Status.
- **SC-003**: Search bar never leaves the viewport.

## Assumptions *(optional)*

- The entire Pokemon list is available in memory (from Feature 1) to allow for fast client-side filtering.
- "3 letters min length" applies to text searches to prevent UI thrashing, but numeric ID searches are instant.
