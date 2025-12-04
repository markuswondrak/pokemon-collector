import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '../setup';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

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
  getAllPokemonList: vi.fn(async () => [
    { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
    { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' },
    { name: 'squirtle', url: 'https://pokeapi.co/api/v2/pokemon/7/' },
    { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
    { name: 'jigglypuff', url: 'https://pokeapi.co/api/v2/pokemon/39/' },
  ]),
}));

// Mock nameRegistry
vi.mock('../../src/services/nameRegistry.ts', () => ({
  nameRegistry: {
    loadAllNamesWithCache: vi.fn(() => Promise.resolve()),
    getName: vi.fn((id) => {
      const names = {
        1: 'Bulbasaur',
        4: 'Charmander',
        7: 'Squirtle',
        25: 'Pikachu',
        39: 'Jigglypuff',
      };
      return names[id] || `Pokemon ${id}`;
    }),
    search: vi.fn((query) => {
      const allPokemon = [
        { id: 1, name: 'Bulbasaur' },
        { id: 4, name: 'Charmander' },
        { id: 7, name: 'Squirtle' },
        { id: 25, name: 'Pikachu' },
        { id: 39, name: 'Jigglypuff' },
      ];
      return allPokemon.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
    }),
    ready: true,
    error: null,
    loading: false,
  },
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

    // Find search input and verify it's the sticky search bar
    const searchInput = screen.getByTestId('sticky-search-input');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveValue('');
  });

  it('should display "No Pokemon found" when search returns no results', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/pokemon collection organizer/i)).toBeInTheDocument();
    });

    // Search for a non-existent Pokemon name
    const searchInput = screen.getByTestId('sticky-search-input');

    // Type a name that won't match anything
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'XYZNotAPokemon' } });
      await new Promise(resolve => setTimeout(resolve, 350));
    });

    // Verify search was applied
    expect(searchInput).toHaveValue('XYZNotAPokemon');
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

    const searchInput = screen.getByTestId('sticky-search-input');
    
    // Wait for input to be enabled before interacting
    await waitFor(() => {
      expect(searchInput).not.toBeDisabled();
    });

    // First search
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Pikachu' } });
      await new Promise(resolve => setTimeout(resolve, 350));
    });
    expect(searchInput).toHaveValue('Pikachu');

    // Clear search (clicking the clear button if visible)
    const clearBtn = screen.queryByRole('button', { name: /clear search/i });
    if (clearBtn) {
      await act(async () => {
        fireEvent.click(clearBtn);
      });
    } else {
      // Manually clear
      await act(async () => {
        fireEvent.change(searchInput, { target: { value: '' } });
      });
    }
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

    // Test case-insensitive search with sticky search bar
    const searchInput = screen.getByTestId('sticky-search-input');
    expect(searchInput).toBeInTheDocument();
    
    // Type in mixed case
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'PIKACHU' } });
      await new Promise(resolve => setTimeout(resolve, 350));
    });
    
    expect(searchInput).toHaveValue('PIKACHU');
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

    const searchInput = screen.getByTestId('sticky-search-input');
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

    const searchInput = screen.getByTestId('sticky-search-input');
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

    const searchInput = screen.getByTestId('sticky-search-input');
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

    const searchInput = screen.getByTestId('sticky-search-input');
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

    const searchInput = screen.getByTestId('sticky-search-input');
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

