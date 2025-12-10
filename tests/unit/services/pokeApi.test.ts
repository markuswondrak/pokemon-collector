import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { pokeApi } from '../../../src/services/api/pokeApi';

describe('pokeApi', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		globalThis.fetch = vi.fn();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('should fetch pokemon list with correct limit and types', async () => {
		const mockPokemonList = {
			results: [
				{ name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
				{ name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' },
			],
		};

		const mockTypeList = {
			results: [
				{ name: 'grass', url: 'https://pokeapi.co/api/v2/type/12/' },
				{ name: 'fire', url: 'https://pokeapi.co/api/v2/type/10/' },
			]
		};

		const mockGrassType = {
			pokemon: [
				{ pokemon: { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' } }
			]
		};

		const mockFireType = {
			pokemon: [
				{ pokemon: { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' } }
			]
		};

		(globalThis.fetch as any).mockImplementation((url: string) => {
			if (url.includes('/pokemon?limit=10000')) {
				return Promise.resolve({ ok: true, json: async () => mockPokemonList });
			}
			if (url === 'https://pokeapi.co/api/v2/type') {
				return Promise.resolve({ ok: true, json: async () => mockTypeList });
			}
			if (url.includes('/type/12')) {
				return Promise.resolve({ ok: true, json: async () => mockGrassType });
			}
			if (url.includes('/type/10')) {
				return Promise.resolve({ ok: true, json: async () => mockFireType });
			}
			return Promise.reject(new Error('Unknown URL: ' + url));
		});

		const result = await pokeApi.fetchPokemonList();

		expect(globalThis.fetch).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokemon?limit=10000');
		expect(globalThis.fetch).toHaveBeenCalledWith('https://pokeapi.co/api/v2/type');
		expect(result).toHaveLength(2);
		expect(result[0]).toEqual({
			id: 1,
			name: 'bulbasaur',
			imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
			types: ['grass']
		});
		expect(result[1]).toEqual({
			id: 4,
			name: 'charmander',
			imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png',
			types: ['fire']
		});
	});

	it('should throw error on non-ok response', async () => {
		(globalThis.fetch as any).mockImplementation((url: string) => {
			if (url.includes('/pokemon')) return Promise.resolve({ ok: false, status: 500 });
			return Promise.resolve({ ok: true, json: async () => ({ results: [] }) });
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
		let attempts = 0;
		(globalThis.fetch as any).mockImplementation((url: string) => {
			if (url.includes('/type')) {
				return Promise.resolve({ ok: true, json: async () => ({ results: [] }) });
			}
			if (url.includes('/pokemon')) {
				attempts++;
				if (attempts === 1) {
					return Promise.resolve({ ok: false, status: 500 });
				}
				return Promise.resolve({ ok: true, json: async () => ({ results: [] }) });
			}
			return Promise.reject(new Error('Unknown URL: ' + url));
		});

		vi.useFakeTimers();

		const promise = pokeApi.fetchPokemonList();
		
		await vi.advanceTimersByTimeAsync(3000);
		
		const result = await promise;

		// 2 attempts * 2 calls (pokemon + type) = 4 calls
		expect(globalThis.fetch).toHaveBeenCalledTimes(4);
		expect(result).toEqual([]);
		
		vi.useRealTimers();
	});

	it('should throw after retry fails', async () => {
		(globalThis.fetch as any).mockImplementation((url: string) => {
			if (url.includes('/pokemon')) return Promise.resolve({ ok: false, status: 500 });
			return Promise.resolve({ ok: true, json: async () => ({ results: [] }) });
		});

		vi.useFakeTimers();

		const promise = pokeApi.fetchPokemonList();
		
		// Attach expectation before advancing timers to catch rejection
		const expectation = expect(promise).rejects.toThrow('Failed to fetch pokemon list');
		
		await vi.advanceTimersByTimeAsync(3000);
		await expectation;

		expect(globalThis.fetch).toHaveBeenCalledTimes(4); // Initial + 1 retry
		
		vi.useRealTimers();
	});
});
