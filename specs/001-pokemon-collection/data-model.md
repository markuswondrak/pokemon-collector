# Data Model: Pokemon Collection Organizer

## Entity: Pokemon

Represents a single Pokemon in the system.

### Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `index` | number | ✓ | Unique Pokemon identifier (1-1025) from PokeAPI |
| `name` | string | ✓ | Pokemon name (e.g., "Pikachu") |
| `image` | string | ✓ | URL to Pokemon image from PokeAPI |
| `collected` | boolean | ✓ | Is this Pokemon in user's collected list (default: false) |
| `wishlist` | boolean | ✓ | Is this Pokemon in user's wishlist (default: false) |

### Relationships

- Belongs to one **Collection** (if collected)
- Belongs to one **Wishlist** (if in wishlist, but NOT collected)
- Mutually exclusive: Cannot be both collected AND wishlist simultaneously

### Validation Rules

- `index` MUST be between 1 and 1025 (valid PokeAPI range)
- `index` MUST be unique (only one Pokemon per index allowed)
- `collected` and `wishlist` MUST NOT both be true simultaneously
- `name` MUST be non-empty string
- `image` MUST be valid URL

### Example

```javascript
{
  index: 25,
  name: "Pikachu",
  image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/pokemon/25.png",
  collected: true,
  wishlist: false
}
```

---

## Entity: Collection

Represents the user's collected Pokemon.

### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `id` | string | Unique collection identifier (default: "my-collection") |
| `pokemon` | Pokemon[] | Array of Pokemon marked as collected |
| `createdAt` | date | Date collection was first created |
| `updatedAt` | date | Date collection was last modified |

### Relationships

- Contains zero or more **Pokemon** entities (collected = true)
- Each Pokemon in collection is independent

### Operations

- **Add Pokemon**: Add Pokemon to collection (set collected=true)
- **Remove Pokemon**: Remove Pokemon from collection (set collected=false)
- **Get All**: Retrieve all collected Pokemon
- **Get Count**: Return total number of collected Pokemon
- **Search**: Find Pokemon by index in collection

### Persistence

- Stored in browser localStorage under key: `pokemon_collection`
- Format: JSON array of Pokemon objects with collected=true

### Example

```javascript
{
  id: "my-collection",
  pokemon: [
    {
      index: 25,
      name: "Pikachu",
      image: "...",
      collected: true,
      wishlist: false
    },
    {
      index: 39,
      name: "Jigglypuff",
      image: "...",
      collected: true,
      wishlist: false
    }
  ],
  createdAt: "2025-11-29T10:30:00Z",
  updatedAt: "2025-11-29T14:45:30Z"
}
```

---

## Entity: Wishlist

Represents the user's desired Pokemon (not yet collected).

### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `id` | string | Unique wishlist identifier (default: "my-wishlist") |
| `pokemon` | Pokemon[] | Array of Pokemon marked for wishlist |
| `createdAt` | date | Date wishlist was first created |
| `updatedAt` | date | Date wishlist was last modified |

### Relationships

- Contains zero or more **Pokemon** entities (wishlist=true, collected=false)
- Mutually exclusive with Collection: Same Pokemon cannot be in both

### Operations

- **Add Pokemon**: Add Pokemon to wishlist (set wishlist=true, collected=false)
- **Remove Pokemon**: Remove Pokemon from wishlist (set wishlist=false)
- **Get All**: Retrieve all wishlist Pokemon
- **Get Count**: Return total number of wishlist items
- **Search**: Find Pokemon by index in wishlist
- **Move to Collection**: Transfer Pokemon from wishlist to collection

### Persistence

- Stored in browser localStorage under key: `pokemon_wishlist`
- Format: JSON array of Pokemon objects with wishlist=true, collected=false

### Example

```javascript
{
  id: "my-wishlist",
  pokemon: [
    {
      index: 6,
      name: "Charizard",
      image: "...",
      collected: false,
      wishlist: true
    },
    {
      index: 150,
      name: "Mewtwo",
      image: "...",
      collected: false,
      wishlist: true
    }
  ],
  createdAt: "2025-11-29T10:30:00Z",
  updatedAt: "2025-11-29T14:20:00Z"
}
```

---

## State Transitions

### Pokemon State Machine

```
                    ┌─────────────────────────┐
                    │   Uncollected & Not     │
                    │   in Wishlist (INITIAL) │
                    └────────┬────────────────┘
                             │
                    ┌────────▼──────────┐
                    │  Add to Wishlist  │
                    └────────┬──────────┘
                             │
                    ┌────────▼──────────────────────┐
                    │  In Wishlist, Not Collected   │
                    └────────┬─────────────┬────────┘
                             │             │
                    ┌────────▼──────┐  ┌──▼─────────────┐
                    │ Mark Collected │  │ Remove from WL │
                    └────────┬──────┘  └──┬─────────────┘
                             │            │
                    ┌────────▼─────────────▼──────────────────┐
                    │  Collected, Not in Wishlist (TERMINAL)  │
                    └─────────────────────────────────────────┘
```

### State Transition Rules

1. **Uncollected & Not Wishlist** → **In Wishlist**: User clicks "Add to Wishlist"
2. **In Wishlist** → **Uncollected & Not Wishlist**: User clicks "Remove from Wishlist"
3. **In Wishlist** → **Collected**: User clicks "Mark as Collected"
4. **Collected** → **Uncollected & Not Wishlist**: User clicks "Remove from Collection"
5. **Collected** → **Wishlist**: Invalid (Collected takes precedence)

---

## API Integration (PokeAPI)

### Pokemon Data from PokeAPI

```javascript
// API Call Response Format
{
  id: 25,
  name: "pikachu",
  sprites: {
    front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/pokemon/25.png"
  }
}

// Mapped to Local Pokemon Model
{
  index: 25,
  name: "Pikachu",
  image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/pokemon/25.png",
  collected: false,
  wishlist: false
}
```

### API Endpoints Used

- **GET /pokemon/{id}** - Fetch Pokemon by index
  - Response includes: id, name, sprites.front_default
  - No authentication required
  - Free tier rate limit: ~100 requests/minute

---

## Storage Schema

### localStorage Keys

| Key | Type | Description |
|-----|------|-------------|
| `pokemon_collection` | JSON string | Serialized Collection entity |
| `pokemon_wishlist` | JSON string | Serialized Wishlist entity |

### Storage Format Example

```javascript
// localStorage['pokemon_collection']
JSON.stringify({
  id: "my-collection",
  pokemon: [{ index: 25, name: "Pikachu", image: "...", collected: true, wishlist: false }],
  createdAt: "2025-11-29T10:30:00Z",
  updatedAt: "2025-11-29T14:45:30Z"
})

// localStorage['pokemon_wishlist']
JSON.stringify({
  id: "my-wishlist",
  pokemon: [{ index: 6, name: "Charizard", image: "...", collected: false, wishlist: true }],
  createdAt: "2025-11-29T10:30:00Z",
  updatedAt: "2025-11-29T14:20:00Z"
})
```

---

## Validation & Constraints

### Data Validation

- **Pokemon Index**: Integer 1-1025, unique per collection/wishlist
- **Pokemon Name**: Non-empty string, max 50 characters
- **Pokemon Image**: Valid HTTPS URL
- **Collected & Wishlist**: Exactly one MUST be false if other is true
- **Timestamps**: ISO 8601 format

### Business Rules

1. A Pokemon CANNOT be both collected AND in wishlist simultaneously
2. Adding collected Pokemon to wishlist MUST prevent the action
3. Removing a Pokemon from collection MUST succeed (idempotent)
4. Wishlist items NOT collected are separate list
5. Collection and Wishlist are user-scoped (single user, client-side)

### Constraints

- **Storage Limit**: localStorage ~5-10MB per domain (supports ~1000 Pokemon entries)
- **Rate Limiting**: PokeAPI free tier ~100 req/minute (sufficient for user browsing)
- **Offline**: Application works offline for collection/wishlist (Pokemon data cached, new API calls fail gracefully)
