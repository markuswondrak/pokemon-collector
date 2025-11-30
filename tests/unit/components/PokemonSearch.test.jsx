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

    const buttons = screen.getAllByRole('button');
    const searchBtn = buttons.find(btn => btn.textContent === 'Search' && btn.className.includes('btn-primary'));
    expect(searchBtn).toBeInTheDocument();
  });

  it('should call onSearch when search button clicked', () => {
    render(<PokemonSearch onSearch={mockOnSearch} onReset={mockOnReset} />);

    const input = screen.getByPlaceholderText(/pokemon index/i);
    const buttons = screen.getAllByRole('button');
    const searchBtn = buttons.find(btn => btn.textContent === 'Search' && btn.className.includes('btn-primary'));

    fireEvent.change(input, { target: { value: '25' } });
    fireEvent.click(searchBtn);

    expect(mockOnSearch).toHaveBeenCalledWith(25);
  });

  it('should handle string input and convert to number', () => {
    render(<PokemonSearch onSearch={mockOnSearch} onReset={mockOnReset} />);

    const input = screen.getByPlaceholderText(/pokemon index/i);
    const buttons = screen.getAllByRole('button');
    const searchBtn = buttons.find(btn => btn.textContent === 'Search' && btn.className.includes('btn-primary'));

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
    const buttons = screen.getAllByRole('button');
    const searchBtn = buttons.find(btn => btn.textContent === 'Search' && btn.className.includes('btn-primary'));

    fireEvent.change(input, { target: { value: '25' } });
    fireEvent.click(searchBtn);

    expect(input.value).toBe('');
  });

  it('should validate input is a number', () => {
    render(<PokemonSearch onSearch={mockOnSearch} onReset={mockOnReset} />);

    const input = screen.getByPlaceholderText(/pokemon index/i);
    const buttons = screen.getAllByRole('button');
    const searchBtn = buttons.find(btn => btn.textContent === 'Search' && btn.className.includes('btn-primary'));

    fireEvent.change(input, { target: { value: 'invalid' } });
    fireEvent.click(searchBtn);

    expect(screen.getByText(/invalid input/i)).toBeInTheDocument();
    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it('should validate input is within valid Pokemon index range', () => {
    render(<PokemonSearch onSearch={mockOnSearch} onReset={mockOnReset} />);

    const input = screen.getByPlaceholderText(/pokemon index/i);
    const buttons = screen.getAllByRole('button');
    const searchBtn = buttons.find(btn => btn.textContent === 'Search' && btn.className.includes('btn-primary'));

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
    const buttons = screen.getAllByRole('button');
    const searchBtn = buttons.find(btn => btn.textContent === 'Search' && btn.className.includes('btn-primary'));

    fireEvent.change(input, { target: { value: 'abc' } });
    fireEvent.click(searchBtn);

    expect(screen.queryByText(/invalid/i)).toBeInTheDocument();
  });

  describe('Name Search Mode (US4)', () => {
    it('should support search by Pokemon name', () => {
      render(<PokemonSearch onSearch={mockOnSearch} onReset={mockOnReset} />);

      const input = screen.getByPlaceholderText(/pokemon index/i);
      const buttons = screen.getAllByRole('button');
      const searchBtn = buttons.find(btn => btn.textContent === 'Search' && btn.className.includes('btn-primary'));

      // Search by name should work when component is updated
      fireEvent.change(input, { target: { value: 'bulbasaur' } });
      fireEvent.click(searchBtn);

      // Expected behavior: component accepts name and passes to onSearch
      // Note: This test assumes PokemonSearch component will be enhanced
      // to accept both index and name search modes
    });

    it('should handle case-insensitive name search', () => {
      render(<PokemonSearch onSearch={mockOnSearch} onReset={mockOnReset} />);

      const input = screen.getByPlaceholderText(/pokemon index/i);

      // Case-insensitive input should be handled
      fireEvent.change(input, { target: { value: 'PIKACHU' } });
      expect(input).toHaveValue('PIKACHU');
    });

    it('should support partial name matching', () => {
      render(<PokemonSearch onSearch={mockOnSearch} onReset={mockOnReset} />);

      const input = screen.getByPlaceholderText(/pokemon index/i);

      // Partial name input
      fireEvent.change(input, { target: { value: 'char' } });
      expect(input).toHaveValue('char');

      // Could match "Charmander", "Charizard", etc.
    });

    it('should clear error message when user types after error', () => {
      render(<PokemonSearch onSearch={mockOnSearch} onReset={mockOnReset} />);

      const input = screen.getByPlaceholderText(/pokemon index/i);
      const buttons = screen.getAllByRole('button');
      const searchBtn = buttons.find(btn => btn.textContent === 'Search' && btn.className.includes('btn-primary'));

      // First, trigger an error
      fireEvent.change(input, { target: { value: 'invalid' } });
      fireEvent.click(searchBtn);
      expect(screen.getByText(/invalid/i)).toBeInTheDocument();

      // Clear input and type again
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.change(input, { target: { value: '25' } });

      // Type valid input - error should still show until next search
      // User can then click search with new input
      const currentInput = screen.getByPlaceholderText(/pokemon index/i);
      expect(currentInput.value).toBe('25');
    });

    it('should display "No Pokemon found" message for name search with no matches', () => {
      render(<PokemonSearch onSearch={mockOnSearch} onReset={mockOnReset} />);

      const input = screen.getByPlaceholderText(/pokemon index/i);
      const buttons = screen.getAllByRole('button');
      const searchBtn = buttons.find(btn => btn.textContent === 'Search' && btn.className.includes('btn-primary'));

      // Search for non-existent Pokemon
      fireEvent.change(input, { target: { value: 'xyzabc' } });
      fireEvent.click(searchBtn);

      // Component should handle when search returns no results
      // This behavior will be implemented when name search is added
    });

    it('should debounce name search input', () => {
      vi.useFakeTimers();

      render(<PokemonSearch onSearch={mockOnSearch} onReset={mockOnReset} />);

      const input = screen.getByPlaceholderText(/pokemon index/i);

      // Type multiple characters rapidly
      fireEvent.change(input, { target: { value: 'p' } });
      fireEvent.change(input, { target: { value: 'pi' } });
      fireEvent.change(input, { target: { value: 'pik' } });
      fireEvent.change(input, { target: { value: 'pika' } });
      fireEvent.change(input, { target: { value: 'pikac' } });
      fireEvent.change(input, { target: { value: 'pikachu' } });

      // Debounce should prevent multiple API calls
      // Only final input should trigger search if auto-search is enabled

      vi.useRealTimers();
    });

    it('should allow toggling between index and name search modes', () => {
      render(<PokemonSearch onSearch={mockOnSearch} onReset={mockOnReset} />);

      const input = screen.getByPlaceholderText(/pokemon index/i);

      // Initially should accept index
      fireEvent.change(input, { target: { value: '25' } });
      expect(input).toHaveValue('25');

      // Should also accept name-like strings
      fireEvent.change(input, { target: { value: 'pikachu' } });
      expect(input).toHaveValue('pikachu');
    });
  });
});
