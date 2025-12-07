import { useState, useMemo } from 'react';
import { PokemonRef, UserCollection, FilterStatus } from '../types';
import { useDebounce } from './useDebounce';

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
}

export function usePokemonSearch({
	pokemonList,
	userCollection,
}: UsePokemonSearchProps): UsePokemonSearchResult {
	const [searchQuery, setSearchQuery] = useState('');
	const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

	const debouncedSearchQuery = useDebounce(searchQuery, 300);

	const searchMatches = useMemo(() => {
		return pokemonList.filter((pokemon) => {
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
	}, [pokemonList, debouncedSearchQuery]);

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
	};
}
