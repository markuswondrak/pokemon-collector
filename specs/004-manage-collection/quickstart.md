# Quickstart: Manage Collection

## Overview
This feature allows users to track their Pokemon collection by marking them as "Caught" or adding them to a "Wishlist".

## Usage

### Marking a Pokemon
1. Browse the "Available" grid.
2. Click the **Pokeball** icon on a card to mark it as **Caught**.
   - The Pokemon moves to the "Caught" tab.
3. Click the **Heart** icon on a card to add it to your **Wishlist**.
   - The Pokemon moves to the "Wishlist" tab.

### Managing Lists
1. Switch between lists using the tabs at the top: **Available**, **Caught**, **Wishlist**.
2. To remove a Pokemon from a list:
   - Go to the respective tab.
   - Click the active icon (filled Pokeball or Heart) to toggle it off.
   - The Pokemon returns to the "Available" list.

### Undo
- If you accidentally move a Pokemon, a notification will appear at the bottom of the screen.
- Click **Undo** on the notification to reverse the action.

## Development

### State Access
Use the `useCollection` hook to access and modify the collection state.

```typescript
const { caught, wishlist, toggleCaught, toggleWishlist } = useCollection();
```

### Storage
Data is persisted in `localStorage` under the key `pokemon-collector:collection`.
To clear data manually:
```javascript
localStorage.removeItem('pokemon-collector:collection');
location.reload();
```
