import { describe, it, expect } from 'vitest'
import { Collection } from '../../../src/models/Collection'
import { Pokemon } from '../../../src/models/Pokemon'

describe('Collection Model', () => {
  describe('constructor', () => {
    it('should create an empty collection with timestamps', () => {
      const collection = new Collection()
      expect(collection.id).toBe('my-collection')
      expect(collection.pokemon).toEqual([])
      expect(collection.createdAt).toBeInstanceOf(Date)
      expect(collection.updatedAt).toBeInstanceOf(Date)
    })

    it('should accept custom ID', () => {
      const collection = new Collection('custom-id')
      expect(collection.id).toBe('custom-id')
    })

    it('should accept initial pokemon array', () => {
      const pokemon = new Pokemon(25, 'Pikachu', 'https://example.com/pikachu.png')
      pokemon.setCollected(true)
      const collection = new Collection('test', [pokemon])
      expect(collection.pokemon).toHaveLength(1)
      expect(collection.pokemon[0].index).toBe(25)
    })
  })

  describe('addPokemon', () => {
    it('should add a Pokemon to the collection', () => {
      const collection = new Collection()
      const pokemon = new Pokemon(25, 'Pikachu', 'https://example.com/pikachu.png')
      pokemon.setCollected(true)
      collection.addPokemon(pokemon)
      expect(collection.pokemon).toHaveLength(1)
      expect(collection.pokemon[0].index).toBe(25)
    })

    it('should update updatedAt timestamp', () => {
      const collection = new Collection()
      const originalTime = collection.updatedAt
      const pokemon = new Pokemon(25, 'Pikachu', 'https://example.com/pikachu.png')
      pokemon.setCollected(true)
      collection.addPokemon(pokemon)
      expect(collection.updatedAt.getTime()).toBeGreaterThanOrEqual(originalTime.getTime())
    })

    it('should throw an error if Pokemon with same index already exists', () => {
      const collection = new Collection()
      const pokemon1 = new Pokemon(25, 'Pikachu', 'https://example.com/pikachu.png')
      pokemon1.setCollected(true)
      const pokemon2 = new Pokemon(25, 'Pikachu', 'https://example.com/pikachu.png')
      pokemon2.setCollected(true)
      collection.addPokemon(pokemon1)
      expect(() => {
        collection.addPokemon(pokemon2)
      }).toThrow()
    })

    it('should throw an error if Pokemon is not marked as collected', () => {
      const collection = new Collection()
      const pokemon = new Pokemon(25, 'Pikachu', 'https://example.com/pikachu.png')
      expect(() => {
        collection.addPokemon(pokemon)
      }).toThrow()
    })
  })

  describe('removePokemon', () => {
    it('should remove a Pokemon by index', () => {
      const collection = new Collection()
      const pokemon = new Pokemon(25, 'Pikachu', 'https://example.com/pikachu.png')
      pokemon.setCollected(true)
      collection.addPokemon(pokemon)
      collection.removePokemon(25)
      expect(collection.pokemon).toHaveLength(0)
    })

    it('should update updatedAt timestamp', () => {
      const collection = new Collection()
      const pokemon = new Pokemon(25, 'Pikachu', 'https://example.com/pikachu.png')
      pokemon.setCollected(true)
      collection.addPokemon(pokemon)
      const originalTime = collection.updatedAt
      collection.removePokemon(25)
      expect(collection.updatedAt.getTime()).toBeGreaterThanOrEqual(originalTime.getTime())
    })

    it('should throw an error if Pokemon does not exist', () => {
      const collection = new Collection()
      expect(() => {
        collection.removePokemon(25)
      }).toThrow()
    })
  })

  describe('getPokemon', () => {
    it('should return a Pokemon by index', () => {
      const collection = new Collection()
      const pokemon = new Pokemon(25, 'Pikachu', 'https://example.com/pikachu.png')
      pokemon.setCollected(true)
      collection.addPokemon(pokemon)
      const found = collection.getPokemon(25)
      expect(found).toBeDefined()
      expect(found.name).toBe('Pikachu')
    })

    it('should return undefined if Pokemon does not exist', () => {
      const collection = new Collection()
      const found = collection.getPokemon(25)
      expect(found).toBeUndefined()
    })
  })

  describe('contains', () => {
    it('should return true if Pokemon is in collection', () => {
      const collection = new Collection()
      const pokemon = new Pokemon(25, 'Pikachu', 'https://example.com/pikachu.png')
      pokemon.setCollected(true)
      collection.addPokemon(pokemon)
      expect(collection.contains(25)).toBe(true)
    })

    it('should return false if Pokemon is not in collection', () => {
      const collection = new Collection()
      expect(collection.contains(25)).toBe(false)
    })
  })

  describe('getCount', () => {
    it('should return the count of collected Pokemon', () => {
      const collection = new Collection()
      const pokemon1 = new Pokemon(25, 'Pikachu', 'https://example.com/pikachu.png')
      pokemon1.setCollected(true)
      const pokemon2 = new Pokemon(39, 'Jigglypuff', 'https://example.com/jigglypuff.png')
      pokemon2.setCollected(true)
      collection.addPokemon(pokemon1)
      collection.addPokemon(pokemon2)
      expect(collection.getCount()).toBe(2)
    })

    it('should return 0 for empty collection', () => {
      const collection = new Collection()
      expect(collection.getCount()).toBe(0)
    })
  })

  describe('toJSON', () => {
    it('should serialize collection to JSON object', () => {
      const collection = new Collection()
      const pokemon = new Pokemon(25, 'Pikachu', 'https://example.com/pikachu.png')
      pokemon.setCollected(true)
      collection.addPokemon(pokemon)
      const json = collection.toJSON()
      expect(json.id).toBe('my-collection')
      expect(json.pokemon).toHaveLength(1)
      expect(json.pokemon[0].index).toBe(25)
      expect(json.createdAt).toBeDefined()
      expect(json.updatedAt).toBeDefined()
    })
  })

  describe('static fromJSON', () => {
    it('should create Collection from JSON object', () => {
      const json = {
        id: 'my-collection',
        pokemon: [
          {
            index: 25,
            name: 'Pikachu',
            image: 'https://example.com/pikachu.png',
            collected: true,
            wishlist: false
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      const collection = Collection.fromJSON(json)
      expect(collection.id).toBe('my-collection')
      expect(collection.pokemon).toHaveLength(1)
      expect(collection.pokemon[0].index).toBe(25)
    })
  })
})
