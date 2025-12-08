import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ChatMessage } from '../../../../src/components/Chat/ChatMessage';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { ChatMessage as ChatMessageType } from '../../../../src/types/chat';

const renderWithChakra = (ui: React.ReactElement) => {
	return render(
		<ChakraProvider value={defaultSystem}>
			{ui}
		</ChakraProvider>
	);
};

describe('ChatMessage', () => {
	it('should render user message', () => {
		const message: ChatMessageType = {
			id: '1',
			role: 'user',
			content: 'Hello',
			timestamp: Date.now(),
		};
		renderWithChakra(<ChatMessage message={message} />);
		expect(screen.getByText('Hello')).toBeInTheDocument();
	});

	it('should render model message', () => {
		const message: ChatMessageType = {
			id: '2',
			role: 'model',
			content: 'Hi there',
			timestamp: Date.now(),
		};
		renderWithChakra(<ChatMessage message={message} />);
		expect(screen.getByText('Hi there')).toBeInTheDocument();
	});
});
