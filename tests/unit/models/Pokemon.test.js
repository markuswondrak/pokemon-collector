import { describe, it, expect } from 'vitest'
import { Pokemon } from '../../../src/models/Pokemon'

describe('Pokemon Model', () => {
  describe('constructor', () => {
    it('should create a Pokemon with valid properties', () => {
      const pokemon = new Pokemon(25, 'Pikachu', 'https://example.com/pikachu.png')
      expect(pokemon.index).toBe(25)
      expect(pokemon.name).toBe('Pikachu')
      expect(pokemon.image).toBe('https://example.com/pikachu.png')
      expect(pokemon.collected).toBe(false)
      expect(pokemon.wishlist).toBe(false)
    })

    it('should throw an error if index is invalid (< 1)', () => {
      expect(() => {
        new Pokemon(0, 'Invalid', 'https://example.com/invalid.png')
      }).toThrow()
    })

    it('should throw an error if index is invalid (> 1025)', () => {
      expect(() => {
        new Pokemon(1026, 'Invalid', 'https://example.com/invalid.png')
      }).toThrow()
    })

    it('should throw an error if name is empty', () => {
      expect(() => {
        new Pokemon(25, '', 'https://example.com/pikachu.png')
      }).toThrow()
    })

    it('should throw an error if image URL is invalid', () => {
      expect(() => {
        new Pokemon(25, 'Pikachu', 'not-a-url')
      }).toThrow()
    })
  })

  describe('setCollected', () => {
    it('should set collected to true', () => {
      const pokemon = new Pokemon(25, 'Pikachu', 'https://example.com/pikachu.png')
      pokemon.setCollected(true)
      expect(pokemon.collected).toBe(true)
    })

    it('should throw an error if trying to set both collected and wishlist to true', () => {
      const pokemon = new Pokemon(25, 'Pikachu', 'https://example.com/pikachu.png')
      pokemon.setWishlist(true)
      expect(() => {
        pokemon.setCollected(true)
      }).toThrow()
    })

    it('should allow setting collected to false even if wishlist is true', () => {
      const pokemon = new Pokemon(25, 'Pikachu', 'https://example.com/pikachu.png')
      pokemon.setWishlist(true)
      pokemon.setCollected(false)
      expect(pokemon.collected).toBe(false)
      expect(pokemon.wishlist).toBe(true)
    })
  })

  describe('setWishlist', () => {
    it('should set wishlist to true', () => {
      const pokemon = new Pokemon(25, 'Pikachu', 'https://example.com/pikachu.png')
      pokemon.setWishlist(true)
      expect(pokemon.wishlist).toBe(true)
    })

    it('should throw an error if trying to set both wishlist and collected to true', () => {
      const pokemon = new Pokemon(25, 'Pikachu', 'https://example.com/pikachu.png')
      pokemon.setCollected(true)
      expect(() => {
        pokemon.setWishlist(true)
      }).toThrow()
    })

    it('should allow setting wishlist to false even if collected is true', () => {
      const pokemon = new Pokemon(25, 'Pikachu', 'https://example.com/pikachu.png')
      pokemon.setCollected(true)
      pokemon.setWishlist(false)
      expect(pokemon.collected).toBe(true)
      expect(pokemon.wishlist).toBe(false)
    })
  })

  describe('toJSON', () => {
    it('should serialize Pokemon to JSON object', () => {
      const pokemon = new Pokemon(25, 'Pikachu', 'https://example.com/pikachu.png')
      pokemon.setCollected(true)
      const json = pokemon.toJSON()
      expect(json).toEqual({
        index: 25,
        name: 'Pikachu',
        image: 'https://example.com/pikachu.png',
        collected: true,
        wishlist: false
      })
    })
  })

  describe('static fromJSON', () => {
    it('should create Pokemon from JSON object', () => {
      const json = {
        index: 25,
        name: 'Pikachu',
        image: 'https://example.com/pikachu.png',
        collected: true,
        wishlist: false
      }
      const pokemon = Pokemon.fromJSON(json)
      expect(pokemon.index).toBe(25)
      expect(pokemon.name).toBe('Pikachu')
      expect(pokemon.collected).toBe(true)
      expect(pokemon.wishlist).toBe(false)
    })

    it('should throw an error if fromJSON data is invalid', () => {
      expect(() => {
        Pokemon.fromJSON({
          index: 1026,
          name: 'Invalid',
          image: 'https://example.com/invalid.png',
          collected: false,
          wishlist: false
        })
      }).toThrow()
    })
  })
})
