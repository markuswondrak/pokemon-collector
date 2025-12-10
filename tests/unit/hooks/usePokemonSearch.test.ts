import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { usePokemonSearch } from '../../../src/hooks/usePokemonSearch';
import { PokemonRef, UserCollection } from '../../../src/types';

// Mock useDebounce to return value immediately
vi.mock('../../../src/hooks/useDebounce', () => ({
	useDebounce: (value: any) => value,
}));

const mockPokemonList: PokemonRef[] = [
	{ id: 1, name: 'bulbasaur', imageUrl: 'url1', types: ['grass', 'poison'] },
	{ id: 4, name: 'charmander', imageUrl: 'url4', types: ['fire'] },
	{ id: 25, name: 'pikachu', imageUrl: 'url25', types: ['electric'] },
	{ id: 150, name: 'mewtwo', imageUrl: 'url150', types: ['psychic'] },
];

const mockUserCollection: UserCollection = {
	caught: [1, 25],
	wishlist: [150],
};

describe('usePokemonSearch', () => {
	it('should return all pokemon initially', () => {
		const { result } = renderHook(() =>
			usePokemonSearch({
				pokemonList: mockPokemonList,
				userCollection: mockUserCollection,
			})
		);

		expect(result.current.filteredPokemon).toHaveLength(4);
		expect(result.current.searchQuery).toBe('');
		expect(result.current.filterStatus).toBe('all');
	});

	it('should filter by status: caught', () => {
		const { result } = renderHook(() =>
			usePokemonSearch({
				pokemonList: mockPokemonList,
				userCollection: mockUserCollection,
			})
		);

		act(() => {
			result.current.setFilterStatus('caught');
		});

		expect(result.current.filteredPokemon).toHaveLength(2);
		expect(result.current.filteredPokemon.map((p) => p.name)).toEqual([
			'bulbasaur',
			'pikachu',
		]);
	});

	it('should filter by status: wishlist', () => {
		const { result } = renderHook(() =>
			usePokemonSearch({
				pokemonList: mockPokemonList,
				userCollection: mockUserCollection,
			})
		);

		act(() => {
			result.current.setFilterStatus('wishlist');
		});

		expect(result.current.filteredPokemon).toHaveLength(1);
		expect(result.current.filteredPokemon[0].name).toBe('mewtwo');
	});

	it('should filter by search: ID', () => {
		const { result } = renderHook(() =>
			usePokemonSearch({
				pokemonList: mockPokemonList,
				userCollection: mockUserCollection,
			})
		);

		act(() => {
			result.current.setSearchQuery('25');
		});

		expect(result.current.filteredPokemon).toHaveLength(1);
		expect(result.current.filteredPokemon[0].name).toBe('pikachu');
	});

	it('should filter by search: Name (>= 3 chars)', () => {
		const { result } = renderHook(() =>
			usePokemonSearch({
				pokemonList: mockPokemonList,
				userCollection: mockUserCollection,
			})
		);

		act(() => {
			result.current.setSearchQuery('saur');
		});

		expect(result.current.filteredPokemon).toHaveLength(1);
		expect(result.current.filteredPokemon[0].name).toBe('bulbasaur');
	});

	it('should NOT filter by search: Name (< 3 chars)', () => {
		const { result } = renderHook(() =>
			usePokemonSearch({
				pokemonList: mockPokemonList,
				userCollection: mockUserCollection,
			})
		);

		act(() => {
			result.current.setSearchQuery('pi');
		});

		// Should return all because length < 3
		expect(result.current.filteredPokemon).toHaveLength(4);
	});

	it('should combine status and search filters', () => {
		const { result } = renderHook(() =>
			usePokemonSearch({
				pokemonList: mockPokemonList,
				userCollection: mockUserCollection,
			})
		);

		// Filter caught (bulbasaur, pikachu)
		act(() => {
			result.current.setFilterStatus('caught');
		});

		// Search 'pika'
		act(() => {
			result.current.setSearchQuery('pika');
		});

		expect(result.current.filteredPokemon).toHaveLength(1);
		expect(result.current.filteredPokemon[0].name).toBe('pikachu');
	});

	it('should return counts', () => {
		const { result } = renderHook(() =>
			usePokemonSearch({
				pokemonList: mockPokemonList,
				userCollection: mockUserCollection,
			})
		);

		expect(result.current.counts).toEqual({
			all: 4,
			caught: 2,
			wishlist: 1,
		});
	});

	it('should update counts when searching', () => {
		const { result } = renderHook(() =>
			usePokemonSearch({
				pokemonList: mockPokemonList,
				userCollection: mockUserCollection,
			})
		);

		act(() => {
			result.current.setSearchQuery('pika');
		});

		expect(result.current.counts).toEqual({
			all: 1,
			caught: 1,
			wishlist: 0,
		});
	});

	it('should handle special characters in search', () => {
		const specialPokemon: PokemonRef[] = [
			{ id: 122, name: 'mr. mime', imageUrl: 'url122', types: ['psychic', 'fairy'] },
			{ id: 83, name: "farfetch'd", imageUrl: 'url83', types: ['normal', 'flying'] },
		];
		const { result } = renderHook(() =>
			usePokemonSearch({
				pokemonList: [...mockPokemonList, ...specialPokemon],
				userCollection: mockUserCollection,
			})
		);

		act(() => {
			result.current.setSearchQuery("mr. m");
		});
		expect(result.current.filteredPokemon).toHaveLength(1);
		expect(result.current.filteredPokemon[0].name).toBe('mr. mime');

		act(() => {
			result.current.setSearchQuery("fetch'd");
		});
		expect(result.current.filteredPokemon).toHaveLength(1);
		expect(result.current.filteredPokemon[0].name).toBe("farfetch'd");
	});

	it('should filter by AI filter: matching_pokemon_names', () => {
		const { result } = renderHook(() =>
			usePokemonSearch({
				pokemonList: mockPokemonList,
				userCollection: mockUserCollection,
			})
		);

		act(() => {
			result.current.setAiFilter({
				matching_pokemon_names: ['pikachu', 'mewtwo'],
			});
		});

		expect(result.current.filteredPokemon).toHaveLength(2);
		expect(result.current.filteredPokemon.map((p) => p.name)).toEqual([
			'pikachu',
			'mewtwo',
		]);
	});

	it('should filter by AI filter: nameContains', () => {
		const { result } = renderHook(() =>
			usePokemonSearch({
				pokemonList: mockPokemonList,
				userCollection: mockUserCollection,
			})
		);

		act(() => {
			result.current.setAiFilter({
				nameContains: 'char',
			});
		});

		expect(result.current.filteredPokemon).toHaveLength(1);
		expect(result.current.filteredPokemon[0].name).toBe('charmander');
	});

	it('should clear AI filter', () => {
		const { result } = renderHook(() =>
			usePokemonSearch({
				pokemonList: mockPokemonList,
				userCollection: mockUserCollection,
			})
		);

		act(() => {
			result.current.setAiFilter({
				matching_pokemon_names: ['pikachu'],
			});
		});

		expect(result.current.filteredPokemon).toHaveLength(1);

		act(() => {
			result.current.clearAiFilter();
		});

		expect(result.current.filteredPokemon).toHaveLength(4);
		expect(result.current.aiFilter).toBeNull();
	});

	it('should combine AI filter with search and status filters', () => {
		const { result } = renderHook(() =>
			usePokemonSearch({
				pokemonList: mockPokemonList,
				userCollection: mockUserCollection,
			})
		);

		// Set AI filter to pikachu and bulbasaur
		act(() => {
			result.current.setAiFilter({
				matching_pokemon_names: ['pikachu', 'bulbasaur'],
			});
		});

		// Both are caught, so filtering by caught should still show both
		act(() => {
			result.current.setFilterStatus('caught');
		});

		expect(result.current.filteredPokemon).toHaveLength(2);
	});
});
