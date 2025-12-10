# Data Model: Pokemon Card Details

## Entities

### Pokemon (Updated)
Extends the existing `PokemonRef` to include elemental types.

```typescript
interface PokemonRef {
  id: number;
  name: string;
  imageUrl: string;
  types: PokemonType[]; // New field
}
```

### PokemonType
Enumeration or String Union of valid Pokemon types.

```typescript
type PokemonType = 
  | 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice' 
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' 
  | 'bug' | 'rock' | 'ghost' | 'dragon' | 'steel' | 'dark' | 'fairy';
```

## State Management

### Index Store (localStorage)
The `pokemon-collector:index` storage key will now contain objects with the `types` array.

- **Migration**: On first load with the new code, the old cache (without types) should be invalidated or updated. Since we are changing the fetch logic, we can simply bump the cache key or check for missing `types` property to trigger a re-fetch.

### API Response Maps
Internal intermediate structure during fetching:

```typescript
// Map<TypeName, PokemonUrl[]>
// We use URL to extract ID to match with the main list
interface TypeListResponse {
  name: string; // e.g., "fire"
  pokemon: {
    pokemon: {
      name: string;
      url: string;
    }
  }[];
}
```
