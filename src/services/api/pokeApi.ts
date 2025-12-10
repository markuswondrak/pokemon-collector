import { PokemonRef, PokemonType } from '../../types';

const BASE_URL = 'https://pokeapi.co/api/v2';
const IMAGE_BASE_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

interface PokeApiResult {
	name: string;
	url: string;
}

interface PokeApiResponse {
	results: PokeApiResult[];
}

interface TypeListResult {
	name: string;
	url: string;
}

interface TypeListResponse {
	results: TypeListResult[];
}

interface TypeDetailResponse {
	name: string;
	pokemon: {
		pokemon: {
			name: string;
			url: string;
		};
	}[];
}

export const pokeApi = {
	fetchPokemonTypes: async (): Promise<Map<string, PokemonType[]>> => {
		try {
			const response = await fetch(`${BASE_URL}/type`);
			if (!response.ok) throw new Error(`HTTP ${response.status} fetching ${BASE_URL}/type`);
			const data: TypeListResponse = await response.json();

			const typeMap = new Map<string, PokemonType[]>();

			const typePromises = data.results.map(async (typeInfo) => {
				try {
					const res = await fetch(typeInfo.url);
					if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${typeInfo.url}`);
					const typeData: TypeDetailResponse = await res.json();
					const typeName = typeInfo.name as PokemonType;

					typeData.pokemon.forEach((entry) => {
						const pokemonName = entry.pokemon.name;
						const current = typeMap.get(pokemonName) || [];
						current.push(typeName);
						typeMap.set(pokemonName, current);
					});
				} catch (err) {
					console.error(`Error fetching type details for ${typeInfo.name}:`, err);
				}
			});

			await Promise.all(typePromises);
			return typeMap;
		} catch (error) {
			console.error('Error fetching pokemon types list:', error);
			return new Map(); // Return empty map on failure to avoid blocking the app
		}
	},

	fetchPokemonList: async (retryCount = 0): Promise<PokemonRef[]> => {
		try {
			const [response, typeMap] = await Promise.all([
				fetch(`${BASE_URL}/pokemon?limit=10000`),
				pokeApi.fetchPokemonTypes()
			]);
			
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
					types: typeMap.get(item.name) || [],
				};
			});
		} catch (error) {
			if (retryCount < 1) {
				await new Promise(resolve => setTimeout(resolve, 3000));
				return pokeApi.fetchPokemonList(retryCount + 1);
			}
			throw error;
		}
	},
};
