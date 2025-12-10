import { useState, useEffect } from 'react';
import { PokemonRef } from '../types';
import { pokeApi } from '../services/api/pokeApi';
import { storageService } from '../services/storage/localStorage';

interface UsePokemonIndexResult {
	pokemonList: PokemonRef[];
	isLoading: boolean;
	error: Error | null;
	retry: () => void;
}

export const usePokemonIndex = (): UsePokemonIndexResult => {
	const [pokemonList, setPokemonList] = useState<PokemonRef[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<Error | null>(null);

	const loadData = async () => {
		try {
			setIsLoading(true);
			setError(null);

			const CACHE_KEY = 'pokemon-collector:index';
			const TIMESTAMP_KEY = 'pokemon-collector:index-timestamp';
			const TTL = 24 * 60 * 60 * 1000; // 24 hours

			const cachedData = storageService.get(CACHE_KEY);
			const cachedTimestamp = storageService.get(TIMESTAMP_KEY);

			const now = Date.now();
			const isCacheValid = cachedData && cachedTimestamp && (now - (cachedTimestamp as number) < TTL);

			if (isCacheValid) {
				const list = cachedData as PokemonRef[];
				// Check if data is migrated (has types)
				if (list.length > 0 && 'types' in list[0]) {
					setPokemonList(list);
					setIsLoading(false);
					return;
				}
				// If cache exists but is missing types, we proceed to fetch new data
			}

			const data = await pokeApi.fetchPokemonList();
			
			setPokemonList(data);
			
			// Store data and timestamp
			storageService.set(CACHE_KEY, data);
			storageService.set(TIMESTAMP_KEY, now);

		} catch (err) {
			setError(err instanceof Error ? err : new Error('Unknown error occurred'));
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		loadData();
	}, []);

	return { pokemonList, isLoading, error, retry: loadData };
};
