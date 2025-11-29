/**
 * Pokemon Model
 * Represents a single Pokemon with collection and wishlist state management
 */

export class Pokemon {
  constructor(index, name, image) {
    // Validate index
    if (!Number.isInteger(index) || index < 1 || index > 1025) {
      throw new Error(`Invalid Pokemon index: ${index}. Must be between 1 and 1025.`)
    }

    // Validate name
    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new Error('Pokemon name must be a non-empty string.')
    }

    // Validate image URL
    if (!this._isValidUrl(image)) {
      throw new Error(`Invalid image URL: ${image}`)
    }

    this.index = index
    this.name = name
    this.image = image
    this.collected = false
    this.wishlist = false
  }

  /**
   * Validate if a string is a valid URL
   * @param {string} url - The URL to validate
   * @returns {boolean} - True if URL is valid
   */
  _isValidUrl(url) {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  /**
   * Mark Pokemon as collected
   * @param {boolean} collected - Whether Pokemon is collected
   * @throws Error if trying to set both collected and wishlist to true
   */
  setCollected(collected) {
    if (collected && this.wishlist) {
      throw new Error('Pokemon cannot be both collected and in wishlist simultaneously.')
    }
    this.collected = collected
  }

  /**
   * Mark Pokemon as in wishlist
   * @param {boolean} wishlist - Whether Pokemon is in wishlist
   * @throws Error if trying to set both collected and wishlist to true
   */
  setWishlist(wishlist) {
    if (wishlist && this.collected) {
      throw new Error('Pokemon cannot be both collected and in wishlist simultaneously.')
    }
    this.wishlist = wishlist
  }

  /**
   * Convert Pokemon to JSON object
   * @returns {Object} - JSON representation of Pokemon
   */
  toJSON() {
    return {
      index: this.index,
      name: this.name,
      image: this.image,
      collected: this.collected,
      wishlist: this.wishlist
    }
  }

  /**
   * Create Pokemon instance from JSON object
   * @param {Object} json - JSON object with Pokemon data
   * @returns {Pokemon} - New Pokemon instance
   * @throws Error if JSON data is invalid
   */
  static fromJSON(json) {
    const pokemon = new Pokemon(json.index, json.name, json.image)
    if (json.collected) {
      pokemon.setCollected(true)
    }
    if (json.wishlist) {
      pokemon.setWishlist(true)
    }
    return pokemon
  }
}
