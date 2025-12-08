import { ChatMessage } from '../../types/chat';

const FILTER_TOOL = {
	function_declarations: [
		{
			name: 'filter_pokemon',
			description:
				'Filter the Pokemon grid based on user criteria. IMPORTANT: The client only has Pokemon names ' +
				'and IDs. You MUST use matching_pokemon_names to provide a list of Pokemon names that match the ' +
				'user\'s query. For queries about types (fire, water, etc.), generations, stats, or any Pokemon ' + 
				'characteristics, you must determine which Pokemon match and return their names in matching_pokemon_names.',
			parameters: {
				type: 'OBJECT',
				properties: {
					types: {
						type: 'ARRAY',
						items: {
							type: 'STRING',
							enum: [
								'normal',
								'fire',
								'water',
								'grass',
								'electric',
								'ice',
								'fighting',
								'poison',
								'ground',
								'flying',
								'psychic',
								'bug',
								'rock',
								'ghost',
								'dragon',
								'steel',
								'dark',
								'fairy',
							],
						},
						description: 'List of Pokemon types to include.',
					},
					minStat: {
						type: 'NUMBER',
						description:
							"Minimum base stat total or specific stat value (e.g., 'strong' implies high stats > 400).",
					},
					nameContains: {
						type: 'STRING',
						description: "Substring to search for in the Pokemon's name.",
					},
					generation: {
						type: 'NUMBER',
						description: 'The generation number (1-9).',
					},
					matching_pokemon_names: {
						type: 'ARRAY',
						items: {
							type: 'STRING',
						},
						description:
							"REQUIRED: List of exact Pokemon names that match the user's query. Use " + 
							"this for ALL queries including types (e.g., 'fire pokemon' -> ['charmander', " + 
							"'charmeleon', 'charizard', ...]), generations (e.g., 'gen 1' -> ['bulbasaur', " + 
							"'ivysaur', ...]), stats (e.g., 'strong pokemon' -> ['mewtwo', 'rayquaza', ...]), " + 
							"or any characteristics. Only omit this if the user is asking a general question " + 
							"that doesn't require filtering.",
					},
				},
				required: [],
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
			throw new Error(`Gemini API Error: ${response.statusText}`);
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
