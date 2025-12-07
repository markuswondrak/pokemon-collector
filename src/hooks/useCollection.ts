import { useState, useEffect, useCallback } from 'react';
import { UserCollection, STORAGE_KEYS } from '../types';
import { storageService } from '../services/storage/localStorage';

const INITIAL_COLLECTION: UserCollection = {
	caught: [],
	wishlist: []
};

export const useCollection = () => {
	const [collection, setCollection] = useState<UserCollection>(INITIAL_COLLECTION);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const loadCollection = () => {
			try {
				const stored = storageService.get(STORAGE_KEYS.COLLECTION);
				if (stored) {
					setCollection(stored);
				}
			} catch (err) {
				console.error('Failed to load collection:', err);
				setError('Failed to load collection');
			} finally {
				setIsLoading(false);
			}
		};

		loadCollection();
	}, []);

	const updateCollection = useCallback((newCollection: UserCollection) => {
		try {
			storageService.set(STORAGE_KEYS.COLLECTION, newCollection);
			setCollection(newCollection);
			setError(null);
		} catch (err) {
			console.error('Failed to save collection:', err);
			if (err instanceof DOMException && err.name === 'QuotaExceededError') {
				setError('Storage full. Cannot save changes.');
			} else {
				setError('Failed to save changes');
			}
			throw err;
		}
	}, []);

	const toggleCaught = useCallback((pokemonId: number) => {
		setCollection((prev) => {
			const isCaught = prev.caught.includes(pokemonId);
			let newCaught: number[];
			let newWishlist = prev.wishlist;

			if (isCaught) {
				newCaught = prev.caught.filter((id) => id !== pokemonId);
			} else {
				newCaught = [...prev.caught, pokemonId];
				// Enforce mutual exclusivity: remove from wishlist if caught
				if (newWishlist.includes(pokemonId)) {
					newWishlist = newWishlist.filter((id) => id !== pokemonId);
				}
			}

			const newCollection = { caught: newCaught, wishlist: newWishlist };

			try {
				storageService.set(STORAGE_KEYS.COLLECTION, newCollection);
				setError(null);
				return newCollection;
			} catch (err) {
				console.error('Failed to save collection:', err);
				if (err instanceof DOMException && err.name === 'QuotaExceededError') {
					setError('Storage full. Cannot save changes.');
				} else {
					setError('Failed to save changes');
				}
				return prev;
			}
		});
	}, []);

	const toggleWishlist = useCallback((pokemonId: number) => {
		setCollection((prev) => {
			// Enforce mutual exclusivity: cannot wishlist if caught
			if (prev.caught.includes(pokemonId)) {
				return prev;
			}

			const isWishlisted = prev.wishlist.includes(pokemonId);
			let newWishlist: number[];

			if (isWishlisted) {
				newWishlist = prev.wishlist.filter((id) => id !== pokemonId);
			} else {
				newWishlist = [...prev.wishlist, pokemonId];
			}

			const newCollection = { ...prev, wishlist: newWishlist };

			try {
				storageService.set(STORAGE_KEYS.COLLECTION, newCollection);
				setError(null);
				return newCollection;
			} catch (err) {
				console.error('Failed to save collection:', err);
				if (err instanceof DOMException && err.name === 'QuotaExceededError') {
					setError('Storage full. Cannot save changes.');
				} else {
					setError('Failed to save changes');
				}
				return prev;
			}
		});
	}, []);

	return {
		collection,
		isLoading,
		error,
		updateCollection,
		toggleCaught,
		toggleWishlist,
	};
};
