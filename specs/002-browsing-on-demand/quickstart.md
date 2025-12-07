# Quickstart: Browsing & On-Demand Loading

## Prerequisites

- Node.js 18+
- pnpm 8+

## Setup

1.  **Install Dependencies**:
    ```bash
    pnpm install
    ```
    *Note: This will install `react-virtuoso` and `vite-plugin-pwa`.*

## Running Development

```bash
pnpm dev
```
*Note: Service Workers might not be enabled by default in `vite dev` mode depending on configuration. To test caching fully, use the production build.*

## Testing Service Worker (Caching)

1.  **Build the application**:
    ```bash
    pnpm build
    ```
2.  **Preview the build**:
    ```bash
    pnpm preview
    ```
3.  **Verify Caching**:
    - Open Browser DevTools -> Application -> Service Workers.
    - Ensure the SW is registered.
    - Go to Network tab.
    - Scroll through the grid to load images.
    - Go "Offline" in DevTools.
    - Reload or scroll back. Images should load from (ServiceWorker).

## Running Tests

```bash
pnpm test
```
