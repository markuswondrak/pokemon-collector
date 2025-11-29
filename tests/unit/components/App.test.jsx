import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the services before importing App
vi.mock('../../../src/services/pokemonApi');
vi.mock('../../../src/services/collectionStorage', () => ({
  getCollection: vi.fn(() => []),
  saveCollection: vi.fn(),
}));
vi.mock('../../../src/services/pokemonService', () => ({
  getCollection: vi.fn(() => []),
  getCollectionList: vi.fn(() => []),
  collectPokemon: vi.fn(),
  removeFromCollection: vi.fn(),
  isCollected: vi.fn(() => false),
}));
vi.mock('../../../src/components/AvailableGrid', () => ({
  default: () => <div data-testid="available-grid">Available Grid</div>,
}));

import App from '../../../src/components/App.jsx';

describe('App Component - User Story 1', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should render the main App component', () => {
    render(<App />);

    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('should have app CSS class', () => {
    const { container } = render(<App />);

    expect(container.querySelector('.app')).toBeInTheDocument();
  });

  it('should render search component', () => {
    render(<App />);

    expect(screen.getByPlaceholderText(/pokemon index/i)).toBeInTheDocument();
  });

  it('should render Pokemon card display area', () => {
    const { container } = render(<App />);

    expect(container.querySelector('.three-grids-section')).toBeInTheDocument();
  });

  it('should render collection list', () => {
    render(<App />);

    // Look for a heading that says "My Collection" more specifically
    expect(screen.getByText(/my collection/i)).toBeInTheDocument();
  });

  it('should have proper layout structure', () => {
    const { container } = render(<App />);

    expect(container.querySelector('.app-header')).toBeInTheDocument();
    expect(container.querySelector('.app-main')).toBeInTheDocument();
  });

  it('should render without crashing', () => {
    const { container } = render(<App />);

    expect(container).toBeInTheDocument();
  });

  it('should initialize with empty search state', () => {
    render(<App />);

    const searchInput = screen.getByPlaceholderText(/pokemon index/i);
    expect(searchInput.value).toBe('');
  });

  it('should initialize with empty collection', () => {
    render(<App />);

    const emptyMessages = screen.queryAllByText(/no pokemon/i);
    expect(emptyMessages.length).toBeGreaterThanOrEqual(1);
  });

  it('should have title or header', () => {
    render(<App />);

    const heading = screen.queryByRole('heading', { level: 1 });
    expect(heading || screen.queryByText(/pokemon/i)).toBeInTheDocument();
  });

  it('should render buttons for user interaction', () => {
    render(<App />);

    // Verify search button is rendered
    const searchButton = screen.getByRole('button', { name: /search/i });
    expect(searchButton).toBeInTheDocument();
  });
});
