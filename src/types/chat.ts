export interface ChatMessage {
	id: string;
	role: 'user' | 'model' | 'system';
	content: string;
	timestamp: number;
	isError?: boolean;
}

export interface FilterIntent {
	types?: string[];
	minStat?: number;
	nameContains?: string;
	generation?: number;
	matching_pokemon_names?: string[];
}

export interface AuthSession {
	provider: 'google';
	accessToken: string;
	expiresAt: number;
	status: 'idle' | 'authenticated' | 'error';
}

export interface ChatState {
	messages: ChatMessage[];
	isOpen: boolean;
	isLoading: boolean;
	error: string | null;
}

export interface AuthState {
	session: AuthSession | null;
	isInitializing: boolean;
	login: () => void;
	logout: () => void;
}
