import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SearchBar } from '../../../src/components/SearchBar';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';

// Helper to render with ChakraProvider
// Note: Chakra UI v3 might use different provider setup, but usually ChakraProvider is enough.
// If v3 uses 'defaultSystem', we might need to pass it.
// Checking package.json again, it is ^3.30.0.
// In v3, it is often <ChakraProvider value={defaultSystem}> or similar if using new system.
// But let's try standard wrapper first. If it fails, I'll adjust.
// Actually, for unit tests, we might not strictly need the provider if we don't test styles deeply,
// but components like InputGroup might rely on context.

const renderWithChakra = (ui: React.ReactElement) => {
	return render(<ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>);
};

describe('SearchBar', () => {
	it('should render with placeholder', () => {
		renderWithChakra(<SearchBar value="" onChange={() => {}} />);
		expect(screen.getByPlaceholderText('Search Pokemon...')).toBeInTheDocument();
	});

	it('should call onChange when typing', () => {
		const handleChange = vi.fn();
		renderWithChakra(<SearchBar value="" onChange={handleChange} />);
		
		const input = screen.getByPlaceholderText('Search Pokemon...');
		fireEvent.change(input, { target: { value: 'test' } });
		
		expect(handleChange).toHaveBeenCalledWith('test');
	});

	it('should show clear button when value is present', () => {
		renderWithChakra(<SearchBar value="test" onChange={() => {}} />);
		expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
	});

	it('should NOT show clear button when value is empty', () => {
		renderWithChakra(<SearchBar value="" onChange={() => {}} />);
		expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
	});

	it('should clear input when clear button is clicked', () => {
		const handleChange = vi.fn();
		renderWithChakra(<SearchBar value="test" onChange={handleChange} />);
		
		const clearButton = screen.getByLabelText('Clear search');
		fireEvent.click(clearButton);
		
		expect(handleChange).toHaveBeenCalledWith('');
	});
});
