# Feature Specification: Modern Card Actions

**Feature Branch**: `004-modern-card-actions`
**Created**: 2025-12-04
**Status**: Draft
**Input**: User description: "the buttons within the pokemon cards don't look modern and the text does not fit to them. Replace them with a modern way to change the states of the cards to the different grids"

## Clarifications

### Session 2025-12-04
- Q: How should the "Collect" vs "Remove" interaction behave? → A: **Distinct Actions**: The icon changes completely (e.g., "Plus" icon becomes "Trash" icon) to indicate the new available action.
- Q: Where should the action icons be positioned? → A: **Bottom Action Bar**: Row of icons below the text/details (replaces current buttons).
- Q: How should the user know what the icons do? → A: **Tooltip on Hover/Focus**: Show a small text label floating near the icon when interacted with.
- Q: Which specific icons should be used for Collect/Remove? → A: **Pokeball and Open Pokeball**: Use a closed Pokeball to collect, and an open/broken one to remove (thematic choice).
- Q: How should the Wishlist icon behave when a Pokemon is already collected? → A: **Disabled State**: Icon remains visible but grayed out/unclickable (maintains layout).

## User Scenarios & Testing

### User Story 1 - Quick Collect Action (Priority: P1)

As a collector, I want to mark a Pokemon as collected using a simple icon button, so that I can quickly update my collection without dealing with cramped text buttons.

**Why this priority**: Collecting is the primary action of the application. The current text buttons are broken on small cards.

**Independent Test**: Can be tested by clicking the collect icon on an available Pokemon and verifying it moves to the collection.

**Acceptance Scenarios**:

1. **Given** an available Pokemon card, **When** I click the "Collect" icon (closed Pokeball), **Then** the Pokemon is marked as collected and moves to the collection grid.
2. **Given** a collected Pokemon card, **When** I hover over the action area, **Then** I see the state clearly indicated.

---

### User Story 2 - Wishlist Toggle (Priority: P2)

As a collector, I want to toggle a Pokemon's wishlist status using a heart icon, so that I can easily track what I want to find.

**Why this priority**: Wishlisting is a key secondary feature. The "In Wishlist" text is currently too long for the card.

**Independent Test**: Can be tested by clicking the heart icon and verifying the visual state changes and the item appears in the wishlist.

**Acceptance Scenarios**:

1. **Given** a Pokemon card, **When** I click the empty "Heart" icon, **Then** the icon becomes filled and the Pokemon is added to the wishlist.
2. **Given** a wishlisted Pokemon card, **When** I click the filled "Heart" icon, **Then** the icon becomes empty and the Pokemon is removed from the wishlist.

---

### User Story 3 - Remove from Collection (Priority: P3)

As a collector, I want to remove a Pokemon from my collection using a consistent icon interface, so that I can correct mistakes.

**Why this priority**: Essential for data management, but less frequent than adding.

**Independent Test**: Can be tested by clicking the remove/undo icon on a collected Pokemon.

**Acceptance Scenarios**:

1. **Given** a collected Pokemon card, **When** I click the "Remove" icon (which replaced the Collect icon), **Then** the Pokemon is removed from the collection and the icon reverts to the "Collect" state.

---

### Edge Cases

- What happens when a user tries to wishlist a collected Pokemon? (Should be disabled or handled gracefully as per current logic).
- How does the system handle keyboard navigation focus on icon-only buttons? (Must have visible focus rings).
- What happens if the image fails to load? (Icons should still be visible and usable).

## Requirements

### Functional Requirements

- **FR-001**: The system MUST replace the "Collect", "Remove", and "Wishlist" text buttons with icon-based buttons.
- **FR-002**: The "Collect" action MUST use a closed Pokeball icon.
- **FR-003**: The "Wishlist" action MUST use a Heart icon (Outline for not in wishlist, Filled for in wishlist).
- **FR-004**: The "Remove" action MUST replace the "Collect" icon with an open or broken Pokeball icon when the item is collected.
- **FR-005**: All icon buttons MUST have descriptive `aria-label` attributes for accessibility (e.g., "Add Bulbasaur to collection").
- **FR-006**: The action buttons MUST be positioned in a row at the bottom of the card (replacing the previous button row) to fit within the 140px card width.
- **FR-007**: Interactive elements MUST have a minimum touch target size of 44x44px (or appropriate spacing) for usability, even if the visual icon is smaller.
- **FR-008**: Hover and Focus states MUST be clearly visible to indicate interactivity.
- **FR-009**: All icon buttons MUST display a tooltip on hover and focus containing the action name (e.g., "Collect", "Wishlist").
- **FR-010**: All action icons MUST share a consistent visual style (e.g., same stroke width, size, and design language) to ensure a cohesive look and feel.
- **FR-011**: The Wishlist icon MUST be visible but disabled (grayed out, non-interactive) when the Pokemon is already collected.
- **FR-012**: Tooltips MUST float above the UI and NOT affect the layout of the buttons or card (no layout shifts).
- **FR-013**: All action buttons MUST use a consistent visual style: black icons on a white background (outline/ghost style), regardless of state (e.g., no solid green/red backgrounds).

### Key Entities

- **PokemonCard**: The UI component displaying the Pokemon and containing the action triggers.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Zero occurrences of text overflow or wrapping in the action area of Pokemon cards at the default 140px width.
- **SC-002**: 100% of action buttons pass accessibility checks for accessible names (aria-labels).
- **SC-003**: Users can perform Collect and Wishlist actions with a single click/tap.
- **SC-004**: The card layout remains stable (no height changes) when toggling states.

## Assumptions

- We will use existing icon libraries available in the project (e.g., Chakra UI icons or similar) or standard SVG icons.
- The card width of 140px is a design constraint that we should respect.
