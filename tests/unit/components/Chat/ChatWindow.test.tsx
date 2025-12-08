import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ChatWindow } from '../../../../src/components/Chat/ChatWindow';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { ChatMessage } from '../../../../src/types/chat';

const renderWithChakra = (ui: React.ReactElement) => {
	return render(
		<ChakraProvider value={defaultSystem}>
			{ui}
		</ChakraProvider>
	);
};

const defaultProps = {
	isOpen: true,
	onClose: vi.fn(),
	messages: [] as ChatMessage[],
	isAuthenticated: false,
	isAuthLoading: false,
	isLoading: false,
	error: null,
	onLogin: vi.fn(),
	onLogout: vi.fn(),
	onSendMessage: vi.fn(),
	aiFilter: null,
	onClearFilter: vi.fn(),
};

describe('ChatWindow', () => {
	it('should render when isOpen is true', () => {
		renderWithChakra(<ChatWindow {...defaultProps} isOpen={true} />);
		expect(screen.getByText('AI Assistant')).toBeInTheDocument();
	});

	it('should not render when isOpen is false', () => {
		renderWithChakra(<ChatWindow {...defaultProps} isOpen={false} />);
		expect(screen.queryByText('AI Assistant')).not.toBeInTheDocument();
	});

	it('should call onClose when close button is clicked', () => {
		const handleClose = vi.fn();
		renderWithChakra(<ChatWindow {...defaultProps} onClose={handleClose} />);
		fireEvent.click(screen.getByLabelText('Close chat'));
		expect(handleClose).toHaveBeenCalled();
	});

	it('should show sign in prompt when not authenticated', () => {
		renderWithChakra(<ChatWindow {...defaultProps} isAuthenticated={false} />);
		expect(screen.getByText('Sign in with Google to chat with the AI assistant')).toBeInTheDocument();
		expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
	});

	it('should show loading state during auth initialization', () => {
		renderWithChakra(<ChatWindow {...defaultProps} isAuthLoading={true} />);
		expect(screen.getByText('Initializing...')).toBeInTheDocument();
	});

	it('should show chat input when authenticated', () => {
		renderWithChakra(<ChatWindow {...defaultProps} isAuthenticated={true} />);
		expect(screen.getByPlaceholderText('Ask about Pokemon...')).toBeInTheDocument();
	});

	it('should show messages when provided', () => {
		const messages: ChatMessage[] = [
			{ id: '1', role: 'user', content: 'Hello', timestamp: Date.now() },
			{ id: '2', role: 'model', content: 'Hi there!', timestamp: Date.now() },
		];
		renderWithChakra(<ChatWindow {...defaultProps} isAuthenticated={true} messages={messages} />);
		expect(screen.getByText('Hello')).toBeInTheDocument();
		expect(screen.getByText('Hi there!')).toBeInTheDocument();
	});

	it('should show error message when error is set', () => {
		renderWithChakra(<ChatWindow {...defaultProps} isAuthenticated={true} error="API Error" />);
		expect(screen.getByText('API Error')).toBeInTheDocument();
	});

	it('should show loading indicator when isLoading is true', () => {
		renderWithChakra(<ChatWindow {...defaultProps} isAuthenticated={true} isLoading={true} />);
		expect(screen.getByText('Thinking...')).toBeInTheDocument();
	});

	it('should show active filter indicator', () => {
		const aiFilter = { matching_pokemon_names: ['Pikachu', 'Charmander'] };
		renderWithChakra(<ChatWindow {...defaultProps} isAuthenticated={true} aiFilter={aiFilter} />);
		expect(screen.getByText('Filter active: 2 Pokemon')).toBeInTheDocument();
	});

	it('should call onClearFilter when clear is clicked', () => {
		const onClearFilter = vi.fn();
		const aiFilter = { matching_pokemon_names: ['Pikachu'] };
		renderWithChakra(
			<ChatWindow {...defaultProps} isAuthenticated={true} aiFilter={aiFilter} onClearFilter={onClearFilter} />
		);
		fireEvent.click(screen.getByText('Clear'));
		expect(onClearFilter).toHaveBeenCalled();
	});

	it('should call onLogin when sign in button is clicked', () => {
		const onLogin = vi.fn();
		renderWithChakra(<ChatWindow {...defaultProps} onLogin={onLogin} />);
		fireEvent.click(screen.getByText('Sign in with Google'));
		expect(onLogin).toHaveBeenCalled();
	});

	it('should call onLogout when sign out button is clicked', () => {
		const onLogout = vi.fn();
		renderWithChakra(<ChatWindow {...defaultProps} isAuthenticated={true} onLogout={onLogout} />);
		fireEvent.click(screen.getByText('Sign Out'));
		expect(onLogout).toHaveBeenCalled();
	});
});