import { useState, useEffect, useCallback } from 'react';
import { googleAuthService } from '../services/ai/googleAuth';
import { AuthState, AuthSession } from '../types/chat';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export const useGoogleAuth = (): AuthState => {
	const [session, setSession] = useState<AuthSession | null>(null);
	const [isInitializing, setIsInitializing] = useState(true);

	useEffect(() => {
		const handleTokenResponse = (response: any) => {
			if (response.access_token) {
				setSession({
					provider: 'google',
					accessToken: response.access_token,
					expiresAt: Date.now() + Number(response.expires_in) * 1000,
					status: 'authenticated',
				});
			}
		};

		const initService = () => {
			if (GOOGLE_CLIENT_ID) {
				googleAuthService.init(GOOGLE_CLIENT_ID, handleTokenResponse);
			} else {
				console.warn('VITE_GOOGLE_CLIENT_ID is not defined');
			}
			setIsInitializing(false);
		};

		if (!window.google) {
			const script = document.createElement('script');
			script.src = 'https://accounts.google.com/gsi/client';
			script.async = true;
			script.defer = true;
			script.onload = initService;
			document.body.appendChild(script);
		} else {
			initService();
		}
	}, []);

	const login = useCallback(() => {
		googleAuthService.login();
	}, []);

	const logout = useCallback(() => {
		setSession(null);
	}, []);

	return {
		session,
		isInitializing,
		login,
		logout,
	};
};
