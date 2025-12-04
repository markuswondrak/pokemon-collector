# Quickstart: Modern Card Actions

## Overview
This feature replaces the text buttons on the `PokemonCard` with modern icon-based actions.

## Usage

### 1. Installation
Ensure `react-icons` is installed:
```bash
pnpm add react-icons
```

### 2. Using the Component
The `PokemonCard` component API remains the same, but the visual output changes.

```tsx
import { PokemonCard } from './components/PokemonCard'

<PokemonCard
  pokemon={pokemonData}
  onCollect={handleCollect}
  onAddToWishlist={handleWishlist}
  onRemove={handleRemove}
/>
```

### 3. Key Changes
- **Icons**: Now uses `react-icons` (Tabler & FontAwesome).
- **Tooltips**: Hover over icons to see action names. Tooltips float above UI without layout shift.
- **Visuals**: Consistent black icons on white background (ghost style) for all actions.
- **Layout**: Actions are in a row at the bottom.

## Troubleshooting
- **Icons not showing**: Check if `react-icons` is installed and imported correctly.
- **Tooltips not showing**: Ensure `Tooltip` component is correctly wrapped around the `IconButton`.
