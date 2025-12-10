import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storageService } from '../../../src/services/storage/localStorage';
import { STORAGE_KEYS, PokemonRef } from '../../../src/types';

describe('storageService', () => {
	beforeEach(() => {
		localStorage.clear();
		vi.restoreAllMocks();
	});

	it('should store and retrieve data', () => {
		const key = STORAGE_KEYS.INDEX;
		const data: PokemonRef[] = [{ id: 1, name: 'bulbasaur', imageUrl: 'url', types: ['grass'] }];

		storageService.set(key, data);
		const retrieved = storageService.get(key);

		expect(retrieved).toEqual(data);
	});

	it('should return null for non-existent key', () => {
		const retrieved = storageService.get(STORAGE_KEYS.INDEX);
		expect(retrieved).toBeNull();
	});

	it('should handle QuotaExceededError', () => {
		const key = STORAGE_KEYS.INDEX;
		const data: PokemonRef[] = [{ id: 1, name: 'bulbasaur', imageUrl: 'url', types: ['grass'] }];

		// Mock setItem to throw QuotaExceededError
		const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
			throw new DOMException('QuotaExceededError', 'QuotaExceededError');
		});

		expect(() => storageService.set(key, data)).toThrow('Storage quota exceeded');
		
		setItemSpy.mockRestore();
	});
});
