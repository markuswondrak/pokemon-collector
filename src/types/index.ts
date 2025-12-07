export interface PokemonRef {
	id: number;
	name: string;
	imageUrl: string;
}

export const STORAGE_KEYS = {
	INDEX: 'pokemon-collector:index',
	TIMESTAMP: 'pokemon-collector:index-timestamp',
} as const;

export interface StorageSchema {
	[STORAGE_KEYS.INDEX]: PokemonRef[];
	[STORAGE_KEYS.TIMESTAMP]: number;
}
