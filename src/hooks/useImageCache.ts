/**
 * useImageCache Hook
 * 
 * Custom React hook for managing image loading with localStorage caching.
 * Feature: 008-simplify-render-cache
 */

import { useState, useCallback } from 'react'
import { ImageCacheService } from '../services/imageCacheService'

/**
 * Hook return value interface
 */
export interface UseImageCacheResult {
  imageDataUrl: string | null
  isLoading: boolean
  hasError: boolean
  errorMessage: string | null
  loadImage: () => Promise<void>
  clearError: () => void
}

/**
 * Custom hook for managing image loading with localStorage caching
 * 
 * @param pokemonIndex - Pokemon index (1-1025)
 * @returns Object with image data, loading state, error state, and control functions
 */
export function useImageCache(pokemonIndex: number): UseImageCacheResult {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [hasError, setHasError] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState<number>(0)

  const cacheService = ImageCacheService.getInstance()

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setHasError(false)
    setErrorMessage(null)
  }, [])

  /**
   * Convert image URL to Data URL
   */
  const convertImageToDataUrl = async (imageUrl: string): Promise<string> => {
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => { resolve(reader.result as string); }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  /**
   * Fetch Pokemon data and extract image URL
   */
  const fetchPokemonImageUrl = async (index: number): Promise<string> => {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${String(index)}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch Pokemon: ${response.statusText}`)
    }
    const data = await response.json()
    const imageUrl = 
      data.sprites?.other?.['official-artwork']?.front_default ||
      data.sprites?.front_default ||
      null
    
    if (!imageUrl) {
      throw new Error('No image URL found in Pokemon data')
    }
    
    return imageUrl
  }

  /**
   * Check if error is transient (retryable)
   */
  const isTransientError = (error: unknown): boolean => {
    if (!(error instanceof Error)) return false
    const message = error.message.toLowerCase()
    return (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('fetch') ||
      message.includes('5')
    )
  }

  /**
   * Load image from cache or API
   */
  const loadImage = useCallback(async () => {
    setIsLoading(true)
    clearError()

    try {
      // Check cache first
      const cached = cacheService.get(pokemonIndex)
      if (cached) {
        setImageDataUrl(cached)
        setIsLoading(false)
        setRetryCount(0)
        return
      }

      // Cache miss - fetch from API
      const imageUrl = await fetchPokemonImageUrl(pokemonIndex)
      const dataUrl = await convertImageToDataUrl(imageUrl)
      
      // Save to cache
      try {
        cacheService.save(pokemonIndex, dataUrl)
      } catch (cacheError) {
        // Log cache save error but don't fail the load
        console.warn('Failed to cache image:', cacheError)
      }
      
      setImageDataUrl(dataUrl)
      setIsLoading(false)
      setRetryCount(0)
    } catch (error) {
      setIsLoading(false)
      
      // Check if we should retry
      if (isTransientError(error) && retryCount < 2) {
        // Exponential backoff: 1s, 2s
        const delay = Math.pow(2, retryCount) * 1000
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
          void loadImage()
        }, delay)
        return
      }
      
      // Set error state
      setHasError(true)
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          setErrorMessage('Unable to load image. Check your internet connection.')
        } else if (error.message.includes('Pokemon')) {
          setErrorMessage('Image temporarily unavailable. Please try again later.')
        } else if (error.message.includes('Storage') || error.message.includes('quota')) {
          setErrorMessage('Storage full. Some older images were removed.')
        } else {
          setErrorMessage('An error occurred while loading the image.')
        }
      } else {
        setErrorMessage('An error occurred while loading the image.')
      }
      setRetryCount(0)
    }
  }, [pokemonIndex, cacheService, clearError, retryCount])

  return {
    imageDataUrl,
    isLoading,
    hasError,
    errorMessage,
    loadImage,
    clearError
  }
}

export default useImageCache
