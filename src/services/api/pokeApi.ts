import { PokemonRef } from '../../types';

const BASE_URL = 'https://pokeapi.co/api/v2';
const IMAGE_BASE_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

interface PokeApiResult {
	name: string;
	url: string;
}

interface PokeApiResponse {
	results: PokeApiResult[];
}

export const pokeApi = {
	fetchPokemonList: async (): Promise<PokemonRef[]> => {
		const response = await fetch(`${BASE_URL}/pokemon?limit=10000`);
		
		if (!response.ok) {
			throw new Error('Failed to fetch pokemon list');
		}

		const data: PokeApiResponse = await response.json();

		return data.results.map((item) => {
			// Since the id field is missing, we must extract it from the url string (e.g., .../pokemon/1/) 
			const idMatch = item.url.match(/\/(\d+)\/$/);
			const id = idMatch ? parseInt(idMatch[1], 10) : 0;
			
			return {
				id,
				name: item.name,
				imageUrl: `${IMAGE_BASE_URL}/${id}.png`,
			};
		});
	},
};
