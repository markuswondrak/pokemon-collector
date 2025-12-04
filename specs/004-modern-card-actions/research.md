# Research: Modern Card Actions

## Unknowns & Clarifications

### 1. Icon Library
- **Context**: The project uses Chakra UI but no icon library is currently installed.
- **Requirement**: Need "Pokeball" (closed) and "Open/Broken Pokeball" icons, plus "Heart" (filled/outline).
- **Findings**: `react-icons` is permitted by the Constitution.
- **Decision**: Install `react-icons`.
- **Icon Selection**:
    - **Collect**: `MdCatchingPokemon` (Material Design) or `CgPokemon` (CSS.gg) or `TbPokeball` (Tabler). Let's use `MdCatchingPokemon` or `TbPokeball` as they are recognizable.
    - **Remove**: "Open Pokeball" is rare in standard sets. I will use a custom SVG component for the "Open Pokeball" if a suitable icon isn't found, or fall back to a "Trash" icon if the visual complexity of a custom SVG is too high for the timeline. *Update*: I will use `TbPokeballOff` from `react-icons/tb` (Tabler Icons) if available, or `MdOutlineCatchingPokemon` vs `MdCatchingPokemon`. If `TbPokeballOff` exists, it's perfect. If not, I will use `FaTrash` as a fallback for "Remove" but try to implement the "Open Pokeball" via SVG if possible.
    - **Wishlist**: `FaHeart` (Filled) and `FaRegHeart` (Outline) from `react-icons/fa`.

### 2. Chakra UI Version & Tooltips
- **Context**: `package.json` shows `@chakra-ui/react: ^3.30.0` and code uses `Card.Root`. This indicates Chakra UI v3.
- **Requirement**: Tooltips on hover/focus.
- **Approach**: Use `Tooltip` component from `@chakra-ui/react`. In v3, it might be `Tooltip.Root`, `Tooltip.Trigger`, `Tooltip.Content`.
- **Action**: Verify Chakra UI v3 Tooltip API during implementation.

### 3. Accessibility
- **Context**: Icon-only buttons need `aria-label`.
- **Requirement**: Visible focus rings.
- **Approach**: Chakra UI `IconButton` handles focus rings automatically. We must ensure `aria-label` is passed.

## Decisions

1. **Install `react-icons`**: To provide the necessary icons.
2. **Use Chakra UI `IconButton`**: For the interactive elements.
3. **Use Chakra UI `Tooltip`**: For the hover labels.
4. **Custom/Specific Icons**:
    - Collect: `TbPokeball` (Tabler)
    - Remove: `TbPokeballOff` (Tabler) - *Assumption: it exists. If not, use `FaTrash`.*
    - Wishlist: `FaHeart` / `FaRegHeart` (FontAwesome)

## Alternatives Considered

- **Custom SVGs for all**: More control, but more code to maintain. `react-icons` is standard.
- **Chakra UI Icons**: Limited set, likely doesn't have Pokeball.

## Updates (Fixes Phase)

### 4. Tooltip Positioning
- **Requirement**: Tooltips must not cause layout shifts.
- **Solution**: Use `Tooltip.Positioner` (Chakra UI v3 pattern) to ensure the tooltip renders outside the DOM flow of the button.
- **Decision**: Wrap `IconButton` in `Tooltip.Root` -> `Tooltip.Trigger`. Use `Tooltip.Positioner` for the content.

### 5. Visual Consistency
- **Requirement**: Black icons on white background (Ghost/Outline style).
- **Solution**: Use `variant="ghost"` or `variant="outline"` with `color="black"` and `_hover={{ bg: 'gray.100' }}`.
- **Decision**: Apply `variant="ghost"` to all action buttons. Remove `colorScheme` props.

