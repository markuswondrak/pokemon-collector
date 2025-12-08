import { useState, useMemo, useCallback } from 'react';
import { PokemonRef, UserCollection, FilterStatus } from '../types';
import { useDebounce } from './useDebounce';
import { FilterIntent } from '../types/chat';

interface UsePokemonSearchProps {
	pokemonList: PokemonRef[];
	userCollection: UserCollection;
}

interface UsePokemonSearchResult {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	filterStatus: FilterStatus;
	setFilterStatus: (status: FilterStatus) => void;
	filteredPokemon: PokemonRef[];
	counts: {
		all: number;
		caught: number;
		wishlist: number;
	};
	aiFilter: FilterIntent | null;
	setAiFilter: (filter: FilterIntent | null) => void;
	clearAiFilter: () => void;
}

export function usePokemonSearch({
	pokemonList,
	userCollection,
}: UsePokemonSearchProps): UsePokemonSearchResult {
	const [searchQuery, setSearchQuery] = useState('');
	const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
	const [aiFilter, setAiFilter] = useState<FilterIntent | null>(null);

	const debouncedSearchQuery = useDebounce(searchQuery, 300);

	const clearAiFilter = useCallback(() => {
		setAiFilter(null);
	}, []);

	const searchMatches = useMemo(() => {
		return pokemonList.filter((pokemon) => {
			// If AI filter with matching_pokemon_names is active, filter by names first
			if (aiFilter?.matching_pokemon_names && aiFilter.matching_pokemon_names.length > 0) {
				const normalizedNames = aiFilter.matching_pokemon_names.map(n => n.toLowerCase());
				if (!normalizedNames.includes(pokemon.name.toLowerCase())) {
					return false;
				}
			}

			// If AI filter with nameContains is active
			if (aiFilter?.nameContains) {
				const query = aiFilter.nameContains.toLowerCase();
				if (!pokemon.name.toLowerCase().includes(query)) {
					return false;
				}
			}

			// Apply regular search query
			if (!debouncedSearchQuery) return true;

			const query = debouncedSearchQuery.trim().toLowerCase();
			
			if (!query) return true;

			if (/^\d+$/.test(query)) {
				return pokemon.id === parseInt(query, 10);
			}

			if (query.length >= 3) {
				return pokemon.name.toLowerCase().includes(query);
			}

			return true;
		});
	}, [pokemonList, debouncedSearchQuery, aiFilter]);

	const filteredPokemon = useMemo(() => {
		return searchMatches.filter((pokemon) => {
			if (filterStatus === 'caught') {
				return userCollection.caught.includes(pokemon.id);
			} else if (filterStatus === 'wishlist') {
				return userCollection.wishlist.includes(pokemon.id);
			}
			return true;
		});
	}, [searchMatches, filterStatus, userCollection]);

	const counts = useMemo(() => {
		return {
			all: searchMatches.length,
			caught: searchMatches.filter((p) => userCollection.caught.includes(p.id)).length,
			wishlist: searchMatches.filter((p) => userCollection.wishlist.includes(p.id)).length,
		};
	}, [searchMatches, userCollection]);

	return {
		searchQuery,
		setSearchQuery,
		filterStatus,
		setFilterStatus,
		filteredPokemon,
		counts,
		aiFilter,
		setAiFilter,
		clearAiFilter,
	};
}
