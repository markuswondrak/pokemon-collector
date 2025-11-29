import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PokemonSearch from '../../../src/components/PokemonSearch';

describe('PokemonSearch Component', () => {
  let mockOnSearch;
  let mockOnReset;

  beforeEach(() => {
    mockOnSearch = vi.fn();
    mockOnReset = vi.fn();
  });

  it('should render search input', () => {
    render(<PokemonSearch onSearch={mockOnSearch} onReset={mockOnReset} />);

    const input = screen.getByPlaceholderText(/pokemon index/i);
    expect(input).toBeInTheDocument();
  });

  it('should render search button', () => {
    render(<PokemonSearch onSearch={mockOnSearch} onReset={mockOnReset} />);

    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('should call onSearch when search button clicked', () => {
    render(<PokemonSearch onSearch={mockOnSearch} onReset={mockOnReset} />);

    const input = screen.getByPlaceholderText(/pokemon index/i);
    const searchBtn = screen.getByRole('button', { name: /search/i });

    fireEvent.change(input, { target: { value: '25' } });
    fireEvent.click(searchBtn);

    expect(mockOnSearch).toHaveBeenCalledWith(25);
  });

  it('should handle string input and convert to number', () => {
    render(<PokemonSearch onSearch={mockOnSearch} onReset={mockOnReset} />);

    const input = screen.getByPlaceholderText(/pokemon index/i);
    const searchBtn = screen.getByRole('button', { name: /search/i });

    fireEvent.change(input, { target: { value: '100' } });
    fireEvent.click(searchBtn);

    expect(mockOnSearch).toHaveBeenCalledWith(100);
  });

  it('should call onSearch on Enter key press', () => {
    render(<PokemonSearch onSearch={mockOnSearch} onReset={mockOnReset} />);

    const input = screen.getByPlaceholderText(/pokemon index/i);

    fireEvent.change(input, { target: { value: '25' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    expect(mockOnSearch).toHaveBeenCalledWith(25);
  });

  it('should clear input after search', () => {
    render(<PokemonSearch onSearch={mockOnSearch} onReset={mockOnReset} />);

    const input = screen.getByPlaceholderText(/pokemon index/i);
    const searchBtn = screen.getByRole('button', { name: /search/i });

    fireEvent.change(input, { target: { value: '25' } });
    fireEvent.click(searchBtn);

    expect(input.value).toBe('');
  });

  it('should validate input is a number', () => {
    render(<PokemonSearch onSearch={mockOnSearch} onReset={mockOnReset} />);

    const input = screen.getByPlaceholderText(/pokemon index/i);
    const searchBtn = screen.getByRole('button', { name: /search/i });

    fireEvent.change(input, { target: { value: 'invalid' } });
    fireEvent.click(searchBtn);

    expect(screen.getByText(/invalid input/i)).toBeInTheDocument();
    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it('should validate input is within valid Pokemon index range', () => {
    render(<PokemonSearch onSearch={mockOnSearch} onReset={mockOnReset} />);

    const input = screen.getByPlaceholderText(/pokemon index/i);
    const searchBtn = screen.getByRole('button', { name: /search/i });

    // Test invalid index (too low)
    fireEvent.change(input, { target: { value: '0' } });
    fireEvent.click(searchBtn);
    expect(screen.getByText(/pokemon index must be between/i)).toBeInTheDocument();
    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it('should render reset button', () => {
    render(<PokemonSearch onSearch={mockOnSearch} onReset={mockOnReset} />);

    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
  });

  it('should call onReset when reset button clicked', () => {
    render(<PokemonSearch onSearch={mockOnSearch} onReset={mockOnReset} />);

    const resetBtn = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(resetBtn);

    expect(mockOnReset).toHaveBeenCalled();
  });

  it('should have proper CSS classes for styling', () => {
    const { container } = render(
      <PokemonSearch onSearch={mockOnSearch} onReset={mockOnReset} />
    );

    expect(container.querySelector('.pokemon-search')).toBeInTheDocument();
  });

  it('should show error message for invalid input', () => {
    render(<PokemonSearch onSearch={mockOnSearch} onReset={mockOnReset} />);

    const input = screen.getByPlaceholderText(/pokemon index/i);
    const searchBtn = screen.getByRole('button', { name: /search/i });

    fireEvent.change(input, { target: { value: 'abc' } });
    fireEvent.click(searchBtn);

    expect(screen.queryByText(/invalid/i)).toBeInTheDocument();
  });
});
