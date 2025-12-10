# Pokemon Collector

[![Deploy to GitHub Pages](https://github.com/markuswondrak/pokemon-collector/actions/workflows/deploy.yaml/badge.svg)](https://github.com/markuswondrak/pokemon-collector/actions/workflows/deploy.yaml)

Have a look at the application [**here**](https://markuswondrak.github.io/pokemon-collector/).

This application is a personal Pokemon collection manager built with React and Vite. It allows users to browse the full list of Pokemon, mark them as caught, and manage a wishlist.

**Note:** This project serves as a demonstration for [**Spec Kit**](https://github.com/github/spec-kit), a tool for spec driven development.

## Features

-   **Browse Pokemon**: Efficiently browse the complete Pokemon catalog with lazy loading and virtualization.
-   **Collection Management**:
    -   **Catch**: Mark Pokemon as owned/caught.
    -   **Wishlist**: Add Pokemon to a wishlist for future hunting.
-   **Search & Filter**: Quickly find Pokemon by name or ID.
-   **AI Chat Agent**: Filter Pokemon using natural language queries powered by Google Gemini.
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

### AI Chat Configuration

To enable the AI chat features, you need to set up Google OAuth:

1.  **Google Cloud Setup**:
    -   Create a project in [Google Cloud Console](https://console.cloud.google.com/).
    -   Enable the **Gemini API**.
    -   Create an **OAuth 2.0 Client ID** (Web application).
    -   Add `http://localhost:5173` to **Authorized JavaScript origins**.

2.  **Environment Setup**:
    -   Create a `.env` file in the project root.
    -   Add your Client ID:
        ```env
        VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
        ```

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
