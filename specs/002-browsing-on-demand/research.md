# Research: Caching & Grid Rendering

## Decision

1.  **Caching**: Use `vite-plugin-pwa` with a `CacheFirst` strategy for PokeAPI images (`https://raw.githubusercontent.com/...`).
2.  **Grid Rendering**: Use `react-virtuoso`'s `VirtuosoGrid` component, integrated with Chakra UI by passing custom components to the `components` prop.

## Rationale

### Caching Strategy
*   **CacheFirst**: The images from PokeAPI (hosted on GitHub raw content) are static and unlikely to change for a given Pokemon ID. A `CacheFirst` strategy ensures that once an image is downloaded, it is served from the cache immediately, saving bandwidth and improving load times significantly on subsequent visits.
*   **Expiration**: Setting a long expiration (e.g., 30 days) is appropriate for these static assets.

### Grid Rendering
*   **VirtuosoGrid**: `react-virtuoso` provides a robust `VirtuosoGrid` component specifically designed for windowing grids. It handles responsive layouts well and is easier to set up for this use case than `react-window`.
*   **Chakra UI Integration**: `VirtuosoGrid` allows customizing the internal container (`List`) and item wrapper (`Item`) via the `components` prop. By creating small wrapper components that forward refs, we can use Chakra's `SimpleGrid` or `Grid` for layout and styling while letting `Virtuoso` handle the virtualization logic.

## Alternatives Considered

### Caching
*   **StaleWhileRevalidate**: This would serve the cached content but still make a network request to check for updates. Since Pokemon images are effectively immutable (or change extremely rarely), this generates unnecessary network traffic.
*   **NetworkFirst**: Completely unsuitable for static assets as it requires a network round-trip before falling back to cache, defeating the purpose of offline-first/fast loading for images.

### Grid Rendering
*   **react-window**: Another popular virtualization library. It is more low-level and often requires more boilerplate for responsive grids (e.g., calculating column widths manually). `react-virtuoso` offers a higher-level API that is often easier to work with for responsive grids.
*   **Standard CSS Grid (without virtualization)**: Rendering hundreds or thousands of Pokemon cards at once would cause significant performance issues (DOM bloat, slow initial render). Virtualization is essential.

## Implementation Details

### 1. vite-plugin-pwa Configuration

In `vite.config.ts`, configure the `workbox` option to include a runtime caching rule for the images.

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    // ... other plugins
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        runtimeCaching: [
          {
            // Match PokeAPI image URLs
            // Pattern: https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/...
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/PokeAPI\/sprites\/master\/sprites\/pokemon\/.*$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pokeapi-images',
              expiration: {
                maxEntries: 1000, // Adjust based on expected collection size
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
              },
              cacheableResponse: {
                statuses: [0, 200], // 0 is for opaque responses (CORS)
              },
            },
          },
        ],
      },
    }),
  ],
});
```

### 2. react-virtuoso Grid with Chakra UI

To use `VirtuosoGrid` with Chakra UI, we need to define `List` and `Item` components that forward refs.

```tsx
// src/components/PokemonGrid.tsx
import React, { forwardRef } from 'react';
import { VirtuosoGrid } from 'react-virtuoso';
import { SimpleGrid, Box, Grid } from '@chakra-ui/react';

// 1. Define the List container (The Grid itself)
// It must forward the ref to the underlying DOM element.
// We use Chakra's SimpleGrid or Grid here.
const GridList = forwardRef((props, ref) => {
  return (
    <SimpleGrid
      ref={ref}
      {...props}
      columns={{ base: 2, md: 3, lg: 4 }} // Responsive columns
      spacing={4}
      p={4}
    />
  );
});

// 2. Define the Item container (The wrapper for each card)
// It must also forward the ref.
const GridItem = forwardRef((props, ref) => {
  return (
    <Box ref={ref} {...props} />
  );
});

// 3. The Main Component
export const PokemonGrid = ({ pokemonList }) => {
  return (
    <VirtuosoGrid
      style={{ height: '100vh' }} // Container must have a height
      totalCount={pokemonList.length}
      components={{
        List: GridList,
        Item: GridItem,
      }}
      itemContent={(index) => {
        const pokemon = pokemonList[index];
        return (
          <Box 
            borderWidth="1px" 
            borderRadius="lg" 
            overflow="hidden" 
            p={4}
            bg="white"
            shadow="md"
          >
            {/* Render your Pokemon Card content here */}
            {pokemon.name}
          </Box>
        );
      }}
    />
  );
};
```
