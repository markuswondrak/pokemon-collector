# Pokemon Collector

Have a look at the application [**here**](https://markuswondrak.github.io/pokemon-collector/).

[![Deploy React to GitHub Pages](https://github.com/markuswondrak/pokemon-collector/actions/workflows/deploy.yaml/badge.svg)](https://github.com/markuswondrak/pokemon-collector/actions/workflows/deploy.yaml)

This application is a personal Pokemon collection manager built with React and Vite. It allows users to browse the full list of Pokemon, mark them as caught, and manage a wishlist.

**Note:** This project serves as a demonstration for [**Spec Kit**](https://github.com/github/spec-kit), a tool for spec driven development.

## Features

-   **Browse Pokemon**: Efficiently browse the complete Pokemon catalog with lazy loading and virtualization.
-   **Collection Management**:
    -   **Catch**: Mark Pokemon as owned/caught.
    -   **Wishlist**: Add Pokemon to a wishlist for future hunting.
-   **Search & Filter**: Quickly find Pokemon by name or ID.
-   **Local Persistence**: Your collection data is saved locally in your browser, so you don't lose progress on refresh.
-   **Responsive Design**: Optimized for both desktop and mobile viewing.

## Getting Started

### Prerequisites

-   Node.js (Latest LTS recommended)
-   pnpm (Package Manager)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/markuswondrak/pokemon-collector.git
    cd pokemon-collector
    ```

2.  Install dependencies:
    ```bash
    pnpm install
    ```

3.  Start the development server:
    ```bash
    pnpm dev
    ```

4.  Open your browser and navigate to `http://localhost:5173`.

### Running Tests

To run the test suite:

```bash
pnpm test
```

## Project Structure

The project follows a feature-driven specification structure alongside a standard React codebase:

-   **`specs/`**: Contains the documentation, plans, and task lists for each feature of the application. This folder demonstrates the Spec Kit structure (e.g., `001-global-data-index`, `004-manage-collection`).
-   **`src/`**: The application source code.
    -   **`components/`**: Reusable UI components (e.g., `PokemonCard`, `LazyLoadingGrid`).
    -   **`hooks/`**: Custom React hooks for logic reuse (e.g., `useCollection`, `usePokemonIndex`).
    -   **`services/`**: External services and data handling (e.g., `pokeApi`, `localStorage`).
    -   **`types/`**: TypeScript definitions and interfaces.
-   **`tests/`**: Unit and integration tests.
