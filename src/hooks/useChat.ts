import { useState, useCallback } from 'react';
import { ChatMessage, ChatState } from '../types/chat';

export const useChat = () => {
	const [state, setState] = useState<ChatState>({
		messages: [],
		isOpen: false,
		isLoading: false,
		error: null,
	});

	const toggleChat = useCallback(() => {
		setState((prev) => ({ ...prev, isOpen: !prev.isOpen }));
	}, []);

	const addMessage = useCallback(
		(message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
			const newMessage: ChatMessage = {
				...message,
				id: crypto.randomUUID(),
				timestamp: Date.now(),
			};
			setState((prev) => ({
				...prev,
				messages: [...prev.messages, newMessage],
			}));
			return newMessage;
		},
		[]
	);

	const setLoading = useCallback((isLoading: boolean) => {
		setState((prev) => ({ ...prev, isLoading }));
	}, []);

	const setError = useCallback((error: string | null) => {
		setState((prev) => ({ ...prev, error }));
	}, []);

	const clearMessages = useCallback(() => {
		setState((prev) => ({ ...prev, messages: [] }));
	}, []);

	return {
		...state,
		toggleChat,
		addMessage,
		setLoading,
		setError,
		clearMessages,
	};
};
