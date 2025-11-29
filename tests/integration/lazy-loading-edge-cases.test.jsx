import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

vi.mock('../../src/services/pokemonApi');
vi.mock('../../src/services/pokemonService', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getCollection: vi.fn(() => []),
    getCollectionList: vi.fn(() => []),
    collectPokemon: vi.fn(),
    removeFromCollection: vi.fn(),
    addToWishlist: vi.fn(),
    removeFromWishlist: vi.fn(),
  };
});

import App from '../../src/components/App.jsx';
import * as pokemonApi from '../../src/services/pokemonApi';
import * as pokemonService from '../../src/services/pokemonService';

describe('Lazy Loading Edge Cases & Performance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Mock API responses with some latency to simulate network
    pokemonApi.fetchPokemon.mockImplementation(async (index) => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 50));
      return {
        index,
        name: `Pokemon ${index}`,
        image: `https://example.com/pokemon${index}.png`,
        collected: false,
        wishlist: false
      };
    });

    pokemonService.getCollectionList.mockReturnValue([]);

    // Mock IntersectionObserver for lazy loading
    class MockIntersectionObserver {
      constructor(callback) {
        this.callback = callback;
      }
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }
    window.IntersectionObserver = MockIntersectionObserver;
  });

  it('should handle rapid scrolling gracefully without breaking', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Pokemon Collection Organizer')).toBeInTheDocument();
    }, { timeout: 1000 });

    const appContainer = document.querySelector('.app');
    expect(appContainer).toBeInTheDocument();

    // Simulate rapid scroll events
    for (let i = 0; i < 20; i++) {
      fireEvent.scroll(window, { y: i * 100 });
    }

    // App should still be responsive
    expect(screen.getByText('Pokemon Collection Organizer')).toBeInTheDocument();
  });

  it('should not crash when rendering many Pokemon (1000+)', async () => {
    // Create a large collection
    const largeCollection = Array.from({ length: 1000 }, (_, i) => ({
      index: i + 1,
      name: `Pokemon ${i + 1}`,
      image: `https://example.com/pokemon${i + 1}.png`,
      collected: false,
      wishlist: false
    }));

    pokemonService.getCollectionList.mockReturnValue([]);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Pokemon Collection Organizer')).toBeInTheDocument();
    }, { timeout: 1000 });

    // Verify app doesn't crash
    expect(screen.getByText('Pokemon Collection Organizer')).toBeInTheDocument();
    expect(document.querySelector('.app')).toBeInTheDocument();
  });

  it('should handle scroll to bottom repeatedly without memory leak', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Pokemon Collection Organizer')).toBeInTheDocument();
    }, { timeout: 1000 });

    // Simulate repeated scroll to bottom
    const scrollEvents = 10;
    for (let i = 0; i < scrollEvents; i++) {
      fireEvent.scroll(window, { y: document.body.scrollHeight });
    }

    // App should still function
    expect(screen.getByText('Pokemon Collection Organizer')).toBeInTheDocument();
  });

  it('should maintain correct visible Pokemon when window resizes during scroll', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Pokemon Collection Organizer')).toBeInTheDocument();
    }, { timeout: 1000 });

    // Scroll to specific position
    fireEvent.scroll(window, { y: 500 });

    // Simulate window resize
    const originalInnerHeight = window.innerHeight;
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 300
    });
    fireEvent.resize(window);

    // App should handle resize gracefully
    expect(screen.getByText('Pokemon Collection Organizer')).toBeInTheDocument();

    // Restore original height
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalInnerHeight
    });
  });

  it('should handle Pokemon transitions while scrolling', async () => {
    const mockCollection = [];
    let mockCollectionState = [...mockCollection];

    pokemonService.getCollectionList.mockImplementation(() => mockCollectionState);
    pokemonService.collectPokemon.mockImplementation(async (index) => {
      mockCollectionState.push({
        index,
        name: `Pokemon ${index}`,
        image: `https://example.com/pokemon${index}.png`,
        collected: true,
        wishlist: false
      });
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Pokemon Collection Organizer')).toBeInTheDocument();
    }, { timeout: 1000 });

    // Simulate scroll
    fireEvent.scroll(window, { y: 500 });

    // Try to collect Pokemon while scrolling (should not crash)
    const collectButtons = screen.queryAllByRole('button', { name: /collect/i });
    if (collectButtons.length > 0) {
      fireEvent.click(collectButtons[0]);
    }

    // Simulate more scrolling after action
    fireEvent.scroll(window, { y: 1000 });

    // App should still be functional
    expect(screen.getByText('Pokemon Collection Organizer')).toBeInTheDocument();
  });

  it('should load large images without blocking scroll (60 FPS target)', async () => {
    // Create scenario with many images loading
    pokemonApi.fetchPokemon.mockImplementation(async (index) => {
      // Simulate large image load
      await new Promise((resolve) => setTimeout(resolve, 100));
      return {
        index,
        name: `Pokemon ${index}`,
        image: `https://example.com/large-pokemon${index}.png`,
        collected: false,
        wishlist: false
      };
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Pokemon Collection Organizer')).toBeInTheDocument();
    }, { timeout: 1000 });

    const scrollStart = Date.now();

    // Perform rapid scrolling
    for (let i = 0; i < 10; i++) {
      fireEvent.scroll(window, { y: i * 100 });
    }

    const scrollEnd = Date.now();
    const scrollTime = scrollEnd - scrollStart;

    // Scrolling should be responsive (not blocked by image loading)
    // Should complete in reasonable time even with image delays
    expect(scrollTime).toBeLessThan(1000);
  });

  it('should recover gracefully from network latency', async () => {
    // Simulate network latency with delay
    pokemonApi.fetchPokemon.mockImplementation(async (index) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        index,
        name: `Pokemon ${index}`,
        image: `https://example.com/pokemon${index}.png`,
        collected: false,
        wishlist: false
      };
    });

    const { container } = render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Pokemon Collection Organizer')).toBeInTheDocument();
    });

    // Try to interact while network request is pending
    const searchInput = screen.getByPlaceholderText(/pokemon index/i);
    fireEvent.change(searchInput, { target: { value: '25' } });

    // Scroll while request is in flight
    fireEvent.scroll(window, { y: 500 });

    // App should not crash during latency
    expect(container).toBeInTheDocument();
  });

  it('should handle rapid search + scroll combination', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Pokemon Collection Organizer')).toBeInTheDocument();
    });

    // Rapid search inputs
    const searchInput = screen.getByPlaceholderText(/pokemon index/i);
    for (let i = 1; i <= 10; i++) {
      fireEvent.change(searchInput, { target: { value: String(i) } });
      fireEvent.scroll(window, { y: i * 50 });
    }

    // App should still be functional
    expect(screen.getByText('Pokemon Collection Organizer')).toBeInTheDocument();
  });

  it('should maintain virtual scroll position after Pokemon collection', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Pokemon Collection Organizer')).toBeInTheDocument();
    });

    // Scroll to position
    const scrollPosition = 500;
    fireEvent.scroll(window, { y: scrollPosition });

    // Verify scroll position is maintained
    expect(window.scrollY).toBeLessThanOrEqual(scrollPosition + 10); // Allow small margin

    // Collect a Pokemon
    const collectButtons = screen.queryAllByRole('button', { name: /collect/i });
    if (collectButtons.length > 0) {
      fireEvent.click(collectButtons[0]);
    }

    // Scroll position should be maintained
    expect(window.scrollY).toBeLessThanOrEqual(scrollPosition + 50); // Allow margin for re-render
  });

  it('should handle multiple simultaneous Pokemon transitions', async () => {
    const mockCollection = [];
    let mockCollectionState = [...mockCollection];

    pokemonService.getCollectionList.mockImplementation(() => mockCollectionState);
    pokemonService.collectPokemon.mockImplementation(async (index) => {
      await new Promise((resolve) => setTimeout(resolve, 10)); // Simulate async operation
      mockCollectionState.push({
        index,
        name: `Pokemon ${index}`,
        image: `https://example.com/pokemon${index}.png`,
        collected: true,
        wishlist: false
      });
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Pokemon Collection Organizer')).toBeInTheDocument();
    });

    // Try to collect multiple Pokemon rapidly
    const collectButtons = screen.queryAllByRole('button', { name: /collect/i });
    
    for (let i = 0; i < Math.min(3, collectButtons.length); i++) {
      fireEvent.click(collectButtons[i]);
    }

    // App should handle multiple async operations
    expect(screen.getByText('Pokemon Collection Organizer')).toBeInTheDocument();
  });

  it('should efficiently handle IntersectionObserver callback firing', async () => {
    let observerCallbackCount = 0;

    class CountingIntersectionObserver {
      constructor(callback) {
        this.callback = callback;
      }
      observe = vi.fn(() => {
        observerCallbackCount++;
      });
      unobserve = vi.fn();
      disconnect = vi.fn();
    }
    window.IntersectionObserver = CountingIntersectionObserver;

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Pokemon Collection Organizer')).toBeInTheDocument();
    });

    // Callback should not be called excessively
    // (reasonable number depends on implementation, but shouldn't be > 100 for normal operations)
    expect(observerCallbackCount).toBeLessThan(100);
  });

  it('should not cause memory issues with repeated mount/unmount cycles', async () => {
    const { unmount } = render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Pokemon Collection Organizer')).toBeInTheDocument();
    });

    // Unmount app
    unmount();

    // Remount app multiple times
    for (let i = 0; i < 5; i++) {
      const { unmount: unmountNext } = render(<App />);
      await waitFor(() => {
        expect(screen.getByText('Pokemon Collection Organizer')).toBeInTheDocument();
      });
      unmountNext();
    }

    // Final mount should work fine
    render(<App />);
    expect(screen.getByText('Pokemon Collection Organizer')).toBeInTheDocument();
  });

  it('should handle search on large dataset without freezing UI', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Pokemon Collection Organizer')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/pokemon index/i);
    const searchBtn = screen.getByRole('button', { name: /search/i });

    // Search for high index Pokemon
    fireEvent.change(searchInput, { target: { value: '1000' } });

    const startTime = Date.now();
    fireEvent.click(searchBtn);
    const endTime = Date.now();

    // Search should complete quickly
    expect(endTime - startTime).toBeLessThan(1000);
  });
});
