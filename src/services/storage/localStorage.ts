import { StorageSchema } from '../../types';

export const storageService = {
	get: <K extends keyof StorageSchema>(key: K): StorageSchema[K] | null => {
		try {
			const item = localStorage.getItem(key);
			return item ? JSON.parse(item) : null;
		} catch (error) {
			console.error(`Error reading from localStorage key "${key}":`, error);
			return null;
		}
	},

	set: <K extends keyof StorageSchema>(key: K, value: StorageSchema[K]): void => {
		try {
			const serialized = JSON.stringify(value);
			localStorage.setItem(key, serialized);
		} catch (error) {
			if (error instanceof DOMException && (
				error.name === 'QuotaExceededError' ||
				error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
			)) {
				throw new Error('Storage quota exceeded');
			}
			console.error(`Error writing to localStorage key "${key}":`, error);
			throw error;
		}
	},

	remove: <K extends keyof StorageSchema>(key: K): void => {
		try {
			localStorage.removeItem(key);
		} catch (error) {
			console.error(`Error removing from localStorage key "${key}":`, error);
		}
	}
};
