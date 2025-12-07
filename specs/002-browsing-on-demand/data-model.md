# Data Model: Browsing & On-Demand Loading

## Entities

### ImageCache (Browser Storage)

This is not a database entity but a client-side storage entity managed by the Service Worker.

| Field | Type | Description |
|-------|------|-------------|
| `key` | `Request` | The HTTP Request object (URL: `https://raw.githubusercontent.com/...`) |
| `value` | `Response` | The HTTP Response object (Image Blob) |

**Storage Mechanism**: Cache Storage API (Browser)
**Cache Name**: `pokeapi-images`
**Eviction Policy**: LRU (Least Recently Used) / Expiration
**Max Entries**: 1000
**Max Age**: 30 Days

## Relationships

- **Pokemon** (Global Index) has a derived `imageUrl` which maps to a key in **ImageCache**.

## State Transitions

### Image Loading State (UI)

| State | Description | Trigger |
|-------|-------------|---------|
| `Idle` | Component mounted, image not yet requested (off-screen) | Initial render |
| `Loading` | Image requested from network or cache | Enters viewport |
| `Loaded` | Image successfully loaded and displayed | `onLoad` event |
| `Error` | Image failed to load | `onError` event |
