# Research: Pokemon Card Details

**Feature**: 008-pokemon-card-details
**Date**: 2025-12-10

## 1. Data Fetching Strategy

### Problem
The current application fetches a lightweight list of all Pokemon using the REST API (`/pokemon?limit=10000`). This response contains only `name` and `url`. It does *not* contain elemental types. Displaying types on the collection view (grid) requires this data for all items.

### Options
1.  **Fetch Details on Demand (N+1)**: Fetch `/pokemon/{id}` for each card as it renders.
    -   *Pros*: Simple implementation.
    -   *Cons*: Terrible performance. Scrolling quickly will trigger hundreds of requests, likely hitting API rate limits.
2.  **GraphQL API**: Use `https://beta.pokeapi.co/graphql/v1beta` to fetch `id`, `name`, `types` for all Pokemon in one query.
    -   *Pros*: Most efficient (1 request).
    -   *Cons*: API is technically "beta". Requires adding a GraphQL client or constructing a complex fetch body.
3.  **Inverted Index (Type-based)**: Fetch the list of all types (`/type`), then for each type, fetch the list of Pokemon. Construct a `Map<PokemonID, Type[]>` client-side.
    -   *Pros*: Uses stable REST API. Efficient enough (~20 requests total). Cacheable.
    -   *Cons*: slightly more complex logic to merge data.

### Decision
**Option 3 (Inverted Index)**.
It strikes the best balance between reliability (stable REST API) and performance (~20 requests is negligible compared to 1000+). We can run these requests in parallel.

## 2. Type-Color Mapping

### Requirement
Each type needs a distinct color.

### Proposed Palette
Standard colors often used in Pokemon media:

| Type | Color (Hex) | Chakra Color |
|---|---|---|
| Normal | #A8A77A | gray.400 |
| Fire | #EE8130 | orange.400 |
| Water | #6390F0 | blue.400 |
| Electric | #F7D02C | yellow.400 |
| Grass | #7AC74C | green.400 |
| Ice | #96D9D6 | cyan.300 |
| Fighting | #C22E28 | red.600 |
| Poison | #A33EA1 | purple.500 |
| Ground | #E2BF65 | orange.300 |
| Flying | #A98FF3 | purple.300 |
| Psychic | #F95587 | pink.400 |
| Bug | #A6B91A | green.500 |
| Rock | #B6A136 | yellow.600 |
| Ghost | #735797 | purple.700 |
| Dragon | #6F35FC | purple.800 |
| Steel | #B7B7CE | gray.300 |
| Dark | #705746 | gray.700 |
| Fairy | #D685AD | pink.300 |

*Note: Chakra UI colors are approximations. We will use specific Hex codes or closest Chakra theme tokens.*

## 3. Bulbapedia Linking

### URL Format
Base: `https://bulbapedia.bulbagarden.net/wiki/`
Suffix: `_{Name}_(Pokémon)`

### Edge Cases
-   **Spaces**: Replace with underscores (e.g., "Mr. Mime" -> "Mr._Mime").
-   **Special Characters**:
    -   "Nidoran♀" -> "Nidoran%E2%99%80" (URL encoded) or specific handling.
    -   "Farfetch'd" -> "Farfetch'd".
    -   "Mime Jr." -> "Mime_Jr."

### Decision
Implement a `getWikiUrl(name: string)` utility function.
1.  Capitalize first letter (if not already).
2.  Replace spaces with underscores.
3.  Append `_(Pokémon)` (This is standard for most, but some unique names might just be the name. However, `_(Pokémon)` usually redirects correctly or is the canonical page for the species).
    -   *Correction*: Bulbapedia pages are usually just `Name_(Pokémon)`.
    -   Let's check "Pikachu". `https://bulbapedia.bulbagarden.net/wiki/Pikachu_(Pokémon)` works.
    -   `https://bulbapedia.bulbagarden.net/wiki/Pikachu` also works (redirects).
    -   Safest is `Name_(Pokémon)` to avoid ambiguity with other terms.

## 4. Iconography
The spec mentions "colored badge". We will use text badges (Chakra `Badge` component) with the colors defined above. This is accessible and clear. No icons required by spec, but `react-icons` has generic shapes if needed. We will stick to text for clarity.
