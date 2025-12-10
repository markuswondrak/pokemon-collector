# Quickstart: Pokemon Card Details

## Prerequisites
- Node.js & pnpm installed
- Internet connection (for PokeAPI)

## Running the App
1.  Install dependencies:
    ```bash
    pnpm install
    ```
2.  Start the development server:
    ```bash
    pnpm dev
    ```
3.  Open browser to `http://localhost:5173` (or port shown).

## Verifying the Feature
1.  **Check Types**: Scroll through the collection. Observe that each Pokemon card has one or two colored badges indicating its type (e.g., Red "Fire" badge).
2.  **Check Links**: Click on the image of a Pokemon (e.g., Bulbasaur).
3.  **Validate**: Ensure a new tab opens to `bulbapedia.bulbagarden.net` with the correct Pokemon page.

## Troubleshooting
-   **No Types Showing?**: Clear your `localStorage` (Application tab in DevTools) and reload to force a re-fetch of the index.
-   **Wrong Colors?**: Verify the type mapping in `src/utils/typeColors.ts` (or where implemented).
