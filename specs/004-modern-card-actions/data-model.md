# Data Model: Modern Card Actions

## Entities

### Pokemon (Existing)
No changes to the underlying data model.
```typescript
interface Pokemon {
  index: number
  name: string
  image: string | null
  collected: boolean
  wishlist: boolean
}
```

## Component State

### PokemonCard
The component is stateless (controlled). It relies on props for data and callbacks for actions.

**Props**:
- `pokemon`: The Pokemon data object.
- `onCollect`: Callback when "Collect" is clicked.
- `onAddToWishlist`: Callback when "Wishlist" is toggled.
- `onRemove`: Callback when "Remove" is clicked.

**Visual States**:
1. **Available**:
   - Collect Icon: Closed Pokeball (Action: Collect)
   - Wishlist Icon: Empty Heart (Action: Add to Wishlist)
2. **Collected**:
   - Collect Icon: Open/Broken Pokeball (Action: Remove)
   - Wishlist Icon: Filled Heart (Disabled/Grayed out)
3. **Wishlisted**:
   - Collect Icon: Closed Pokeball (Action: Collect)
   - Wishlist Icon: Filled Heart (Action: Remove from Wishlist)

## Validation Rules

- **Wishlist on Collected**: If a Pokemon is collected, the wishlist action should be disabled (visually) or no-op. The spec says "Visible but disabled".
- **Remove**: Only available if `collected` is true.
