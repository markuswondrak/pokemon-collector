import { ChatMessage } from '../../types/chat';

const FILTER_TOOL = {
	function_declarations: [
		{
			name: 'filter_pokemon',
			description:
				'Filters the Pokemon grid based on natural language queries. ' +
				'Since the client lacks metadata, you explicitly calculate matches. ' +
				'Analyze the user query for types, generations, stats, colors, or names ' +
				'and return the specific list of matching Pokemon names.',
			parameters: {
				type: 'OBJECT',
				properties: {
					matching_pokemon_names: {
						type: 'ARRAY',
						items: { type: 'STRING' },
						description: 'The list of Pokemon names that match the user request (e.g. ["Charmander", "Vulpix"]).'
					},
					// Optional: Behalte dies NUR, wenn du im UI Feedback geben willst
					active_filters: {
						type: 'STRING',
						description: 'A short summary of what was filtered for UI display, e.g. "Strong Fire Types from Gen 1".'
					}
				},
				required: ['matching_pokemon_names'],
			},
		},
	],
};

export class GeminiService {
	private baseUrl =
		'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

	// debug method to check for available models
	async listAvailableModels(accessToken: string) {
		const response = await fetch(
			'https://generativelanguage.googleapis.com/v1beta/models',
			{
				method: 'GET',
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}
		);

		if (!response.ok) {
			console.error(
				`Failed to list models: ${response.status} ${response.statusText}`
			);
			return null;
		}

		const data = await response.json();
		console.log('Available Gemini models:', data);
		return data;
	}

	async sendMessage(history: Partial<ChatMessage>[], accessToken: string) {
		// await this.listAvailableModels(accessToken);
		const contents = history.map((msg) => ({
			role: msg.role === 'user' ? 'user' : 'model',
			parts: [{ text: msg.content }],
		}));

		const response = await fetch(this.baseUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
			body: JSON.stringify({
				contents,
				tools: [FILTER_TOOL],
				systemInstruction: {
					parts: [
						{
							text: 'You are a Pokemon filtering assistant. The client application only has Pokemon names and IDs - it does NOT have type, generation, or stat data. When users ask to filter by types, generations, stats, or any Pokemon characteristics, you MUST provide the matching Pokemon names in the matching_pokemon_names array. Use your knowledge of Pokemon to return the correct names.',
						},
					],
				},
			}),
		});

		if (!response.ok) {
			const errorData = await response.json();
			const errorMessage = errorData?.error?.message || response.statusText;
			throw new Error(`Gemini API Error: ${errorMessage}`);
		}

		const data = await response.json();
		const candidate = data.candidates?.[0];
		const part = candidate?.content?.parts?.[0];

		if (part?.functionCall) {
			return {
				functionCall: part.functionCall,
			};
		}

		return {
			text: part?.text || '',
		};
	}
}

export const geminiService = new GeminiService();
