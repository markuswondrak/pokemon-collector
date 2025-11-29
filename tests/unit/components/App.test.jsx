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
  collectPokemon: vi.fn(),
  removeFromCollection: vi.fn(),
  isCollected: vi.fn(() => false),
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

    expect(container.querySelector('.pokemon-display')).toBeInTheDocument();
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

    expect(screen.getByText(/no pokemon/i)).toBeInTheDocument();
  });

  it('should have title or header', () => {
    render(<App />);

    const heading = screen.queryByRole('heading', { level: 1 });
    expect(heading || screen.queryByText(/pokemon/i)).toBeInTheDocument();
  });

  it('should render buttons for user interaction', () => {
    render(<App />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
