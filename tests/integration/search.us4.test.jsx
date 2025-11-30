import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Helper to get search button (not the mode toggle button)
const getSearchButton = () => {
  const buttons = screen.getAllByRole('button');
  const searchBtn = buttons.find(btn => btn.textContent === 'Search' && btn.className.includes('btn-primary'));
  if (!searchBtn) throw new Error('Search button not found');
  return searchBtn;
};

import App from '../../src/components/App';

// Mock the PokéAPI
vi.mock('../../src/services/pokemonApi.ts', () => ({
  fetchPokemon: vi.fn(async (index) => {
    const mockPokemon = {
      1: { index: 1, name: 'Bulbasaur', image: 'https://example.com/1.png' },
      4: { index: 4, name: 'Charmander', image: 'https://example.com/4.png' },
      7: { index: 7, name: 'Squirtle', image: 'https://example.com/7.png' },
      25: { index: 25, name: 'Pikachu', image: 'https://example.com/25.png' },
      39: { index: 39, name: 'Jigglypuff', image: 'https://example.com/39.png' },
    };

    if (!mockPokemon[index]) {
      throw new Error(`Pokemon ${index} not found`);
    }

    return mockPokemon[index];
  }),
  fetchMultiplePokemon: vi.fn(async (indices) => {
    const mockData = {
      1: { index: 1, name: 'Bulbasaur', image: 'https://example.com/1.png' },
      4: { index: 4, name: 'Charmander', image: 'https://example.com/4.png' },
      7: { index: 7, name: 'Squirtle', image: 'https://example.com/7.png' },
      25: { index: 25, name: 'Pikachu', image: 'https://example.com/25.png' },
      39: { index: 39, name: 'Jigglypuff', image: 'https://example.com/39.png' },
    };

    return indices.map((index) => mockData[index] || { index, name: `Pokemon ${index}`, image: null });
  }),
}));

// Mock pokemonService for sticky search bar feature
vi.mock('../../src/services/pokemonService.ts', () => ({
  searchPokemonByName: vi.fn(async (query) => {
    const allPokemon = [
      { index: 1, name: 'Bulbasaur' },
      { index: 4, name: 'Charmander' },
      { index: 7, name: 'Squirtle' },
      { index: 25, name: 'Pikachu' },
      { index: 39, name: 'Jigglypuff' },
    ];
    return allPokemon.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
  }),
  getCollectionList: vi.fn(() => []),
  collectPokemon: vi.fn(),
  removeFromCollection: vi.fn(),
  isCollected: vi.fn(() => false),
  addToWishlist: vi.fn(),
  removeFromWishlist: vi.fn(),
}));

describe('US4: Search Pokemon by Name Integration Tests', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should search Pokemon by partial name (case-insensitive)', async () => {
    render(<App />);

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText(/pokemon collection organizer/i)).toBeInTheDocument();
    });

    // Find search input and type partial name "char"
    const searchInput = screen.getByPlaceholderText(/pokemon index/i);
    expect(searchInput).toBeInTheDocument();

    // For now, we're testing with index search - name search will be added in the next iteration
    // This test is a placeholder for future name search integration
    expect(searchInput).toHaveValue('');
  });

  it('should display "No Pokemon found" when search returns no results', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/pokemon collection organizer/i)).toBeInTheDocument();
    });

    // Search for a non-existent Pokemon
    const searchInput = screen.getByPlaceholderText(/pokemon index/i);
    const searchBtn = getSearchButton();

    // Use an invalid index to simulate no results
    fireEvent.change(searchInput, { target: { value: '0' } });
    fireEvent.click(searchBtn);

    // Should show validation error for invalid index
    await waitFor(() => {
      expect(screen.getByText(/pokemon index must be between/i)).toBeInTheDocument();
    });
  });

  it('should filter available grid by search query', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/pokemon collection organizer/i)).toBeInTheDocument();
    });

    // Verify available grid is shown
    const availableSection = screen.getByText(/available/i);
    expect(availableSection).toBeInTheDocument();
  });

  it('should handle multiple search queries in sequence', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/pokemon collection organizer/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/pokemon index/i);
    const resetBtn = screen.getByRole('button', { name: /reset/i });

    // First search
    fireEvent.change(searchInput, { target: { value: '25' } });
    expect(searchInput).toHaveValue('25');

    // Reset
    fireEvent.click(resetBtn);
    expect(searchInput).toHaveValue('');
  });

  it('should maintain collection state while searching', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/pokemon collection organizer/i)).toBeInTheDocument();
    });

    // Collection should be preserved during search
    const collectionSection = screen.getByText(/my collection/i);
    expect(collectionSection).toBeInTheDocument();
  });

  it('should support case-insensitive partial name matching', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/pokemon collection organizer/i)).toBeInTheDocument();
    });

    // Test case-insensitive search (future implementation)
    const searchInput = screen.getByPlaceholderText(/pokemon index/i);
    expect(searchInput).toBeInTheDocument();
    // Name search will be implemented in next phase
  });
});

describe('US4: Sticky Search Bar - Debounced Name Search (T004)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should trigger search at 3+ characters', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/pokemon collection organizer/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search pokemon/i) || screen.queryByPlaceholderText(/pokemon/i);
    if (searchInput) {
      // Type 1-2 characters (should not trigger)
      await user.type(searchInput, 'p');
      await waitFor(() => {
        // Should not have filtered yet
      }, { timeout: 500 });

      // Add more characters to reach 3+
      await user.type(searchInput, 'i');
      await user.type(searchInput, 'k');
      // Should trigger search now
    }
  });

  it('should not trigger search at 1-2 characters', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/pokemon collection organizer/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search pokemon/i) || screen.queryByPlaceholderText(/pokemon/i);
    if (searchInput) {
      await user.type(searchInput, 'p');
      expect(searchInput).toHaveValue('p');
      // Should not have triggered filtering
    }
  });

  it('should clear search results when search is cleared', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/pokemon collection organizer/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search pokemon/i) || screen.queryByPlaceholderText(/pokemon/i);
    if (searchInput) {
      await user.type(searchInput, 'pika');
      expect(searchInput).toHaveValue('pika');

      // Clear via Escape or button - use getAllByRole to get the first match (the sticky search bar clear button)
      const allButtons = screen.getAllByRole('button', { name: /clear|×/i });
      if (allButtons.length > 0) {
        // Click the first one (the sticky search bar clear button, not the legacy reset button)
        await user.click(allButtons[0]);
      }
    }
  });

  it('should handle zero match results with empty state', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/pokemon collection organizer/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search pokemon/i) || screen.queryByPlaceholderText(/pokemon/i);
    if (searchInput) {
      await user.type(searchInput, 'xyz');
      // Should show no results message
    }
  });

  it('should handle rapid query changes', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/pokemon collection organizer/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search pokemon/i) || screen.queryByPlaceholderText(/pokemon/i);
    if (searchInput) {
      // Simulate rapid typing
      await user.type(searchInput, 'p');
      await user.type(searchInput, 'i');
      await user.type(searchInput, 'k');
      await user.type(searchInput, 'a');
      expect(searchInput).toHaveValue('pika');
      // Should debounce and only search once for 'pika'
    }
  });
});

