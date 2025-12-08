import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useGoogleAuth } from '../../../src/hooks/useGoogleAuth';
import { googleAuthService } from '../../../src/services/ai/googleAuth';

vi.mock('../../../src/services/ai/googleAuth', () => ({
	googleAuthService: {
		init: vi.fn(),
		login: vi.fn(),
	},
}));

describe('useGoogleAuth', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// @ts-ignore
		global.window.google = { accounts: {} }; // Mock google existing
	});

	afterEach(() => {
		// @ts-ignore
		delete global.window.google;
	});

	it('should initialize google auth service on mount', () => {
		renderHook(() => useGoogleAuth());
		expect(googleAuthService.init).toHaveBeenCalled();
	});

	it('should call login on service when login is called', () => {
		const { result } = renderHook(() => useGoogleAuth());
		act(() => {
			result.current.login();
		});
		expect(googleAuthService.login).toHaveBeenCalled();
	});
});
