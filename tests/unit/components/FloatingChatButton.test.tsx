import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FloatingChatButton } from '../../../src/components/FloatingChatButton';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';

const renderWithChakra = (ui: React.ReactElement) => {
	return render(
		<ChakraProvider value={defaultSystem}>
			{ui}
		</ChakraProvider>
	);
};

describe('FloatingChatButton', () => {
	it('should render button', () => {
		renderWithChakra(<FloatingChatButton onClick={() => {}} />);
		expect(screen.getByRole('button')).toBeInTheDocument();
	});

	it('should call onClick when clicked', () => {
		const handleClick = vi.fn();
		renderWithChakra(<FloatingChatButton onClick={handleClick} />);
		fireEvent.click(screen.getByRole('button'));
		expect(handleClick).toHaveBeenCalled();
	});
});
