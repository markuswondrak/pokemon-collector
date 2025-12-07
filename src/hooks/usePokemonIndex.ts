import { useState, useEffect } from 'react';
import { PokemonRef } from '../types';
import { pokeApi } from '../services/api/pokeApi';
import { storageService } from '../services/storage/localStorage';

interface UsePokemonIndexResult {
	pokemonList: PokemonRef[];
	isLoading: boolean;
	error: Error | null;
}

export const usePokemonIndex = (): UsePokemonIndexResult => {
	const [pokemonList, setPokemonList] = useState<PokemonRef[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		const loadData = async () => {
			try {
				setIsLoading(true);
				setError(null);

				// For US1, we just fetch from API and store.
				// Caching logic (US2) will be added later.
				
				// Check if we have data in storage (placeholder for US2, but good to have structure)
				// const cachedData = storageService.get('pokemon-collector:index');
				// if (cachedData) { ... }

				const data = await pokeApi.fetchPokemonList();
				
				setPokemonList(data);
				
				// Store data and timestamp
				storageService.set('pokemon-collector:index', data);
				storageService.set('pokemon-collector:index-timestamp', Date.now());

			} catch (err) {
				setError(err instanceof Error ? err : new Error('Unknown error occurred'));
			} finally {
				setIsLoading(false);
			}
		};

		loadData();
	}, []);

	return { pokemonList, isLoading, error };
};
