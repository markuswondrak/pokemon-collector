# Research: Manage Collection

## 1. State Management & Storage

### Decision: Custom Hook `useCollection` with `localStorage`
We will implement a custom hook `useCollection` that manages the user's collection state.
- **State**: `caught: Set<number>`, `wishlist: Set<number>` (using Sets for O(1) lookups).
- **Persistence**: Sync with `localStorage` on every change.
- **Optimistic UI**: Update state immediately, then persist. Revert on error.

### Rationale
- **Simplicity**: No need for Redux or complex state managers for this scope.
- **Performance**: `Set` operations are fast. `localStorage` is synchronous but fast enough for small datasets (1025 integers).
- **Consistency**: Matches existing `usePokemonIndex` pattern.

### Alternatives Considered
- **Context API**: Could be used to share state, but since `App.tsx` is the main consumer and passes data down, a hook is sufficient for now. If prop drilling becomes an issue, we can wrap it in a Context later.
- **IndexedDB**: Overkill for storing two lists of integers.

## 2. UI Components

### Decision: Chakra UI `Tabs`
We will use Chakra UI's `Tabs` component to switch between "Available", "Caught", and "Wishlist" views.
- **Lazy Mounting**: `isLazy` prop on `TabPanels` to improve initial load performance.
- **Styling**: Default Chakra theme.

### Decision: Chakra UI `useToast`
We will use `useToast` for feedback.
- **Undo Functionality**: The toast will render a custom component or use the `description` field with a clickable "Undo" button.
- **Duration**: 3000ms.

### Decision: Action Buttons on `PokemonCard`
- **Layout**: Add a footer or overlay to the card with two icon buttons: `FaCheckCircle` (Catch) and `FaHeart` (Wishlist).
- **Visual Feedback**:
  - Caught: Pokeball icon colored/filled.
  - Wishlist: Heart icon colored/filled.
  - Available: Icons outlined/gray.

## 3. Data Filtering Logic

### Decision: Client-side Filtering
We will filter the global `pokemonList` based on the `caught` and `wishlist` sets.
- **Available**: `pokemonList.filter(p => !caught.has(p.id) && !wishlist.has(p.id))`
- **Caught**: `pokemonList.filter(p => caught.has(p.id))`
- **Wishlist**: `pokemonList.filter(p => wishlist.has(p.id))`

### Performance Implications
- Filtering 1000 items is negligible in JS.
- `react-virtuoso` handles the rendering of the filtered lists efficiently.

## 4. Unknowns Resolved
- **Storage Key**: `pokemon-collector:collection`
- **Storage Schema**: `{ caught: number[], wishlist: number[] }`
- **Grid Layout**: Reusing `LazyLoadingGrid` with filtered lists.

