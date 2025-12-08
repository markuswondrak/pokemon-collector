declare global {
	interface Window {
		google?: {
			accounts: {
				oauth2: {
					initTokenClient: (config: any) => any;
				};
			};
		};
	}
}

export class GoogleAuthService {
	private tokenClient: any;
	private callback: (response: any) => void = () => {};

	init(clientId: string, onTokenResponse?: (response: any) => void) {
		if (onTokenResponse) {
			this.callback = onTokenResponse;
		}

		if (window.google?.accounts?.oauth2) {
			this.tokenClient = window.google.accounts.oauth2.initTokenClient({
				client_id: clientId,
				scope: 'https://www.googleapis.com/auth/generative-language.retriever',
				callback: (response: any) => {
					this.callback(response);
				},
			});
		} else {
            console.warn('Google Identity Services script not loaded');
        }
	}

	login() {
		if (this.tokenClient) {
			this.tokenClient.requestAccessToken();
		} else {
			console.error('Google Auth not initialized');
		}
	}
}

export const googleAuthService = new GoogleAuthService();
