import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ChatInput } from '../../../../src/components/Chat/ChatInput';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';

const renderWithChakra = (ui: React.ReactElement) => {
	return render(
		<ChakraProvider value={defaultSystem}>
			{ui}
		</ChakraProvider>
	);
};

describe('ChatInput', () => {
	it('should render input field and send button', () => {
		const onSend = vi.fn();
		renderWithChakra(<ChatInput onSend={onSend} />);

		expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
		expect(screen.getByLabelText('Send message')).toBeInTheDocument();
	});

	it('should call onSend when send button is clicked', () => {
		const onSend = vi.fn();
		renderWithChakra(<ChatInput onSend={onSend} />);

		const input = screen.getByPlaceholderText('Type a message...');
		fireEvent.change(input, { target: { value: 'Hello' } });
		fireEvent.click(screen.getByLabelText('Send message'));

		expect(onSend).toHaveBeenCalledWith('Hello');
	});

	it('should call onSend when Enter key is pressed', () => {
		const onSend = vi.fn();
		renderWithChakra(<ChatInput onSend={onSend} />);

		const input = screen.getByPlaceholderText('Type a message...');
		fireEvent.change(input, { target: { value: 'Hello' } });
		fireEvent.keyDown(input, { key: 'Enter' });

		expect(onSend).toHaveBeenCalledWith('Hello');
	});

	it('should clear input after sending', () => {
		const onSend = vi.fn();
		renderWithChakra(<ChatInput onSend={onSend} />);

		const input = screen.getByPlaceholderText('Type a message...');
		fireEvent.change(input, { target: { value: 'Hello' } });
		fireEvent.click(screen.getByLabelText('Send message'));

		expect(input).toHaveValue('');
	});

	it('should not send empty messages', () => {
		const onSend = vi.fn();
		renderWithChakra(<ChatInput onSend={onSend} />);

		fireEvent.click(screen.getByLabelText('Send message'));

		expect(onSend).not.toHaveBeenCalled();
	});

	it('should trim whitespace before sending', () => {
		const onSend = vi.fn();
		renderWithChakra(<ChatInput onSend={onSend} />);

		const input = screen.getByPlaceholderText('Type a message...');
		fireEvent.change(input, { target: { value: '  Hello  ' } });
		fireEvent.click(screen.getByLabelText('Send message'));

		expect(onSend).toHaveBeenCalledWith('Hello');
	});

	it('should be disabled when disabled prop is true', () => {
		const onSend = vi.fn();
		renderWithChakra(<ChatInput onSend={onSend} disabled />);

		const input = screen.getByPlaceholderText('Type a message...');
		expect(input).toBeDisabled();
	});

	it('should use custom placeholder', () => {
		const onSend = vi.fn();
		renderWithChakra(<ChatInput onSend={onSend} placeholder="Ask about Pokemon..." />);

		expect(screen.getByPlaceholderText('Ask about Pokemon...')).toBeInTheDocument();
	});
});
