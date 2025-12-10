import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GoogleAuthService } from '../../../../src/services/ai/googleAuth';

describe('GoogleAuthService', () => {
	let service: GoogleAuthService;
	const mockTokenClient = {
		requestAccessToken: vi.fn(),
	};
	const mockGoogle = {
		accounts: {
			oauth2: {
				initTokenClient: vi.fn().mockReturnValue(mockTokenClient),
			},
		},
	};

	beforeEach(() => {
		// @ts-ignore
		global.window.google = mockGoogle;
		service = new GoogleAuthService();
	});

	afterEach(() => {
		vi.clearAllMocks();
		// @ts-ignore
		delete global.window.google;
	});

	it('should initialize token client', () => {
		service.init('test-client-id');
		expect(mockGoogle.accounts.oauth2.initTokenClient).toHaveBeenCalledWith({
			client_id: 'test-client-id',
			scope: 'https://www.googleapis.com/auth/generative-language.retriever',
			callback: expect.any(Function),
		});
	});

	it('should request access token', () => {
		service.init('test-client-id');
		service.login();
		expect(mockTokenClient.requestAccessToken).toHaveBeenCalled();
	});
});
