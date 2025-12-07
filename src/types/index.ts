export interface PokemonRef {
	id: number;
	name: string;
	imageUrl: string;
}

export interface UserCollection {
	caught: number[];
	wishlist: number[];
}

export enum PokemonState {
	Available = 'Available',
	Caught = 'Caught',
	Wishlisted = 'Wishlisted',
}

export const STORAGE_KEYS = {
	INDEX: 'pokemon-collector:index',
	TIMESTAMP: 'pokemon-collector:index-timestamp',
	COLLECTION: 'pokemon-collector:collection',
} as const;

export interface StorageSchema {
	[STORAGE_KEYS.INDEX]: PokemonRef[];
	[STORAGE_KEYS.TIMESTAMP]: number;
	[STORAGE_KEYS.COLLECTION]: UserCollection;
}
