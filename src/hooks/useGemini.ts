import { useCallback, useState } from 'react';
import { geminiService } from '../services/ai/gemini';
import { ChatMessage, FilterIntent } from '../types/chat';

interface UseGeminiResult {
	sendMessage: (messages: Partial<ChatMessage>[], accessToken: string) => Promise<{
		text?: string;
		filterIntent?: FilterIntent;
	}>;
	isLoading: boolean;
	error: string | null;
}

export const useGemini = (): UseGeminiResult => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const sendMessage = useCallback(async (
		messages: Partial<ChatMessage>[],
		accessToken: string
	) => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await geminiService.sendMessage(messages, accessToken);

			if (response.functionCall) {
				const { args } = response.functionCall;
				const filterIntent: FilterIntent = {
					types: args?.types,
					minStat: args?.minStat,
					nameContains: args?.nameContains,
					generation: args?.generation,
					matching_pokemon_names: args?.matching_pokemon_names,
				};
				return { filterIntent };
			}

			return { text: response.text };
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Unknown error';
			setError(message);
			throw err;
		} finally {
			setIsLoading(false);
		}
	}, []);

	return {
		sendMessage,
		isLoading,
		error,
	};
};
