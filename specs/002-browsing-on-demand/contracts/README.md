# API Contracts

This feature does not introduce new backend API endpoints. It consumes the existing PokeAPI (external) and the Global Index (internal).

## External Dependencies

- **PokeAPI Images**: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{id}.png`
  - **Method**: GET
  - **Response**: Image (PNG)
  - **Caching**: Handled by Service Worker (CacheFirst)
