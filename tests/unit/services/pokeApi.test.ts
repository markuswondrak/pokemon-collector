import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { pokeApi } from '../../../src/services/api/pokeApi';

describe('pokeApi', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		global.fetch = vi.fn();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('should fetch pokemon list with correct limit', async () => {
		const mockResponse = {
			results: [
				{ name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
				{ name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
			],
		};

		(global.fetch as any).mockResolvedValue({
			ok: true,
			json: async () => mockResponse,
		});

		const result = await pokeApi.fetchPokemonList();

		expect(global.fetch).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokemon?limit=10000');
		expect(result).toHaveLength(2);
		expect(result[0]).toEqual({
			id: 1,
			name: 'bulbasaur',
			imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
		});
	});

	it('should throw error on non-ok response', async () => {
		(global.fetch as any).mockResolvedValue({
			ok: false,
			status: 500,
		});

		await expect(pokeApi.fetchPokemonList()).rejects.toThrow('Failed to fetch pokemon list');
	});
});
