import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCollection } from '../../../src/hooks/useCollection';
import { storageService } from '../../../src/services/storage/localStorage';
import { STORAGE_KEYS } from '../../../src/types';

// Mock storageService
vi.mock('../../../src/services/storage/localStorage', () => ({
	storageService: {
		get: vi.fn(),
		set: vi.fn(),
		remove: vi.fn(),
	},
}));

describe('useCollection', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should initialize with empty collection if storage is empty', () => {
		(storageService.get as any).mockReturnValue(null);
		const { result } = renderHook(() => useCollection());

		expect(result.current.collection).toEqual({ caught: [], wishlist: [] });
		expect(result.current.isLoading).toBe(false);
		expect(result.current.error).toBeNull();
	});

	it('should load collection from storage', () => {
		const mockCollection = { caught: [1, 2], wishlist: [3] };
		(storageService.get as any).mockReturnValue(mockCollection);
		const { result } = renderHook(() => useCollection());

		expect(result.current.collection).toEqual(mockCollection);
		expect(result.current.isLoading).toBe(false);
	});

	it('should update collection and save to storage', () => {
		(storageService.get as any).mockReturnValue(null);
		const { result } = renderHook(() => useCollection());

		const newCollection = { caught: [1], wishlist: [] };
		act(() => {
			result.current.updateCollection(newCollection);
		});

		expect(result.current.collection).toEqual(newCollection);
		expect(storageService.set).toHaveBeenCalledWith(STORAGE_KEYS.COLLECTION, newCollection);
	});

	it('should handle storage errors during load', () => {
		(storageService.get as any).mockImplementation(() => {
			throw new Error('Storage error');
		});
		const { result } = renderHook(() => useCollection());

		expect(result.current.error).toBe('Failed to load collection');
		expect(result.current.isLoading).toBe(false);
	});

	it('should toggle caught state and persist', () => {
		(storageService.get as any).mockReturnValue(null);
		const { result } = renderHook(() => useCollection());

		// Catch
		act(() => {
			result.current.toggleCaught(1);
		});
		expect(result.current.collection.caught).toContain(1);
		expect(storageService.set).toHaveBeenCalledWith(STORAGE_KEYS.COLLECTION, { caught: [1], wishlist: [] });

		// Uncatch
		act(() => {
			result.current.toggleCaught(1);
		});
		expect(result.current.collection.caught).not.toContain(1);
		expect(storageService.set).toHaveBeenCalledWith(STORAGE_KEYS.COLLECTION, { caught: [], wishlist: [] });
	});

	it('should remove from wishlist when caught', () => {
		(storageService.get as any).mockReturnValue(null);
		const { result } = renderHook(() => useCollection());

		// Add to wishlist
		act(() => {
			result.current.toggleWishlist(1);
		});
		expect(result.current.collection.wishlist).toContain(1);

		// Catch
		act(() => {
			result.current.toggleCaught(1);
		});
		expect(result.current.collection.caught).toContain(1);
		expect(result.current.collection.wishlist).not.toContain(1);
	});

	it('should not allow wishlisting if caught', () => {
		(storageService.get as any).mockReturnValue(null);
		const { result } = renderHook(() => useCollection());

		// Catch
		act(() => {
			result.current.toggleCaught(1);
		});
		expect(result.current.collection.caught).toContain(1);

		// Try to wishlist
		act(() => {
			result.current.toggleWishlist(1);
		});
		expect(result.current.collection.wishlist).not.toContain(1);
		expect(result.current.collection.caught).toContain(1);
	});
});
