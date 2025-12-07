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

		vi.useFakeTimers();
		const promise = pokeApi.fetchPokemonList();
		
		// Attach expectation before advancing timers to catch rejection
		const expectation = expect(promise).rejects.toThrow('Failed to fetch pokemon list');
		
		await vi.advanceTimersByTimeAsync(3000);
		await expectation;
		
		vi.useRealTimers();
	});

	it('should retry once on failure', async () => {
		(global.fetch as any)
			.mockResolvedValueOnce({ ok: false, status: 500 }) // First attempt fails
			.mockResolvedValueOnce({ // Second attempt succeeds
				ok: true,
				json: async () => ({ results: [] }),
			});

		vi.useFakeTimers();

		const promise = pokeApi.fetchPokemonList();
		
		await vi.advanceTimersByTimeAsync(3000);
		
		const result = await promise;

		expect(global.fetch).toHaveBeenCalledTimes(2);
		expect(result).toEqual([]);
		
		vi.useRealTimers();
	});

	it('should throw after retry fails', async () => {
		(global.fetch as any)
			.mockResolvedValue({ ok: false, status: 500 }); // All attempts fail

		vi.useFakeTimers();

		const promise = pokeApi.fetchPokemonList();
		
		// Attach expectation before advancing timers to catch rejection
		const expectation = expect(promise).rejects.toThrow('Failed to fetch pokemon list');
		
		await vi.advanceTimersByTimeAsync(3000);
		await expectation;

		expect(global.fetch).toHaveBeenCalledTimes(2); // Initial + 1 retry
		
		vi.useRealTimers();
	});
});
