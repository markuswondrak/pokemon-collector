# Research: Search and Filter Implementation

## 1. Chakra UI v3 Sticky Positioning

### Decision
Use the `Box` component with `position="sticky"`, `top="0"`, and `zIndex="sticky"` (or a high numeric value like `100`) to create the sticky header.

### Rationale
*   **Native Support**: Chakra UI v3 supports standard CSS `position` properties directly via props.
*   **Simplicity**: Using `position="sticky"` is simpler than using a fixed position header which requires calculating body padding to prevent content overlap.
*   **Integration**: It works seamlessly with the document flow.

### Implementation Details
```tsx
<Box position="sticky" top="0" zIndex="100" bg="white" _dark={{ bg: "gray.800" }} boxShadow="sm">
  {/* Search Bar and Tabs */}
</Box>
```
*   **Constraint**: Ensure that no ancestor element has `overflow: hidden`, `overflow: auto`, or `overflow: scroll` unless that ancestor is intended to be the scroll container.
*   **Layout Strategy**: Place the sticky header *above* the `Virtuoso` component in the main layout. If using `Virtuoso` with `useWindowScroll={true}` (default behavior often preferred for main page lists), the sticky header in the document flow will naturally stick to the top of the viewport.

### Alternatives Considered
*   **`position="fixed"`**: Removes the element from the flow, requiring manual spacing adjustments for the content below. Harder to maintain.
*   **Virtuoso `Header` prop**: We could pass the header to Virtuoso. However, making it sticky *within* the virtual scroller context can sometimes be jittery or require specific CSS setups. Keeping it outside is safer and more flexible.

## 2. React Virtuoso Filtering

### Decision
Filter the data array *before* passing it to the `VirtuosoGrid` (or `Virtuoso`) component.

### Rationale
*   **Separation of Concerns**: `react-virtuoso` is purely for virtualization (rendering only visible items). It is not a data management library.
*   **Performance**: The component is optimized to handle updates to the `data` prop efficiently. When the filtered array changes, Virtuoso will re-calculate the visible range and render the correct items.

### Implementation Details
*   Maintain a `searchTerm` state.
*   Use `useMemo` to derive `filteredData` from the full `pokemonList` and `searchTerm`.
*   Pass `filteredData` to `<VirtuosoGrid data={filteredData} ... />`.

### Alternatives Considered
*   **Built-in filtering**: Does not exist in `react-virtuoso`.
*   **Filtering in render**: Doing `data.filter(...)` directly in the render return without `useMemo` is fine for small lists, but for thousands of items, `useMemo` is preferred to avoid recalculating on every re-render.

## 3. Debounce Hook

### Decision
Implement a custom `useDebounce` hook to delay the filtering logic while the user is typing.

### Rationale
*   **Performance**: Filtering a large list (e.g., 1000+ Pokémon) on every keystroke can cause UI lag, especially on lower-end devices.
*   **UX**: Prevents the list from flashing or jittering while the user types a complete word.

### Implementation Details
Create `src/hooks/useDebounce.ts`:

```typescript
import { useEffect, useState } from 'react';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
```

### Alternatives Considered
*   **`lodash.debounce`**: Adds an extra dependency for a simple utility that can be implemented in 10 lines of code.
*   **`useDeferredValue` (React 18+)**: This is a viable modern alternative. It allows React to interrupt the rendering of the filtered list if the user keeps typing.
    *   *Comparison*: `useDebounce` delays the *start* of the work. `useDeferredValue` allows the work to start but be *interrupted*.
    *   *Decision*: `useDebounce` is often preferred for search inputs to avoid "stale" results appearing briefly or excessive CPU usage from starting/stopping renders constantly. We will stick with `useDebounce` for the search input for a predictable UX.
