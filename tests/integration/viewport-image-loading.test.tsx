/**
 * Integration Test: Viewport-Based Image Loading
 * Feature: 008-simplify-render-cache
 * 
 * Tests IntersectionObserver-based image loading in PokemonCard component.
 * Validates that images load on-demand when cards enter viewport.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import PokemonCard from '../../src/components/PokemonCard'
import { ImageCacheService } from '../../src/services/imageCacheService'

// Mock fetch for image loading
global.fetch = vi.fn()

const mockPokemon = {
  index: 25,
  name: 'Pikachu',
  image: null,
  collected: false,
  wishlist: false
}

const mockCallbacks = {
  onCollect: vi.fn(),
  onAddToWishlist: vi.fn(),
  onRemove: vi.fn()
}

describe('Viewport-Based Image Loading', () => {
  let intersectionObserverCallback: IntersectionObserverCallback
  let observerInstance: { observe: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear()
    
    // Clear mocks
    vi.clearAllMocks()

    // Mock IntersectionObserver
    observerInstance = {
      observe: vi.fn(),
      disconnect: vi.fn()
    }

    global.IntersectionObserver = vi.fn((callback) => {
      intersectionObserverCallback = callback
      return observerInstance as unknown as IntersectionObserver
    })

    // Mock successful fetch responses
    const mockImageBlob = new Blob(['fake-image'], { type: 'image/png' })
    const mockImageUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png'
    
    ;(global.fetch as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
      if (url.includes('pokeapi.co')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            sprites: {
              other: {
                'official-artwork': {
                  front_default: mockImageUrl
                }
              }
            }
          })
        })
      }
      if (url === mockImageUrl) {
        return Promise.resolve({
          ok: true,
          blob: () => Promise.resolve(mockImageBlob)
        })
      }
      return Promise.reject(new Error('Unknown URL'))
    })

    // Mock FileReader
    class MockFileReader {
      result = 'data:image/png;base64,fakeImageData'
      onloadend: (() => void) | null = null
      onerror: ((error: unknown) => void) | null = null

      readAsDataURL() {
        setTimeout(() => {
          if (this.onloadend) {
            this.onloadend()
          }
        }, 0)
      }
    }

    global.FileReader = MockFileReader as unknown as typeof FileReader
  })

  it('should not load image before card enters viewport', () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <PokemonCard pokemon={mockPokemon} {...mockCallbacks} />
      </ChakraProvider>
    )

    // IntersectionObserver should be created and observing
    expect(global.IntersectionObserver).toHaveBeenCalled()
    expect(observerInstance.observe).toHaveBeenCalled()

    // Image should not be loaded yet
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('should load image when card enters viewport', async () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <PokemonCard pokemon={mockPokemon} {...mockCallbacks} />
      </ChakraProvider>
    )

    // Simulate card entering viewport
    const mockEntry = {
      isIntersecting: true,
      target: document.createElement('div')
    }

    intersectionObserverCallback([mockEntry as IntersectionObserverEntry], {} as IntersectionObserver)

    // Wait for image to load
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('pokeapi.co/api/v2/pokemon/25')
      )
    }, { timeout: 3000 })

    // Verify image fetch was called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('official-artwork/25.png')
      )
    }, { timeout: 3000 })
  })

  it('should display loading spinner while image is loading', async () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <PokemonCard pokemon={mockPokemon} {...mockCallbacks} />
      </ChakraProvider>
    )

    // Simulate card entering viewport
    const mockEntry = {
      isIntersecting: true,
      target: document.createElement('div')
    }

    intersectionObserverCallback([mockEntry as IntersectionObserverEntry], {} as IntersectionObserver)

    // Loading spinner should appear briefly
    await waitFor(() => {
      const spinner = screen.getByRole('status', { hidden: true })
      expect(spinner).toBeInTheDocument()
    }, { timeout: 100 })
  })

  it('should display cached image instantly without API call', async () => {
    const cacheService = ImageCacheService.getInstance()
    const cachedDataUrl = 'data:image/png;base64,cachedImageData'
    
    // Pre-populate cache
    cacheService.save(25, cachedDataUrl)

    render(
      <ChakraProvider value={defaultSystem}>
        <PokemonCard pokemon={mockPokemon} {...mockCallbacks} />
      </ChakraProvider>
    )

    // Simulate card entering viewport
    const mockEntry = {
      isIntersecting: true,
      target: document.createElement('div')
    }

    intersectionObserverCallback([mockEntry as IntersectionObserverEntry], {} as IntersectionObserver)

    // Image should appear without API call
    await waitFor(() => {
      const img = screen.getByAltText('Pikachu sprite')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', cachedDataUrl)
    })

    // No API calls should be made
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('should not trigger multiple loads for same card', async () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <PokemonCard pokemon={mockPokemon} {...mockCallbacks} />
      </ChakraProvider>
    )

    // Simulate card entering viewport multiple times
    const mockEntry = {
      isIntersecting: true,
      target: document.createElement('div')
    }

    intersectionObserverCallback([mockEntry as IntersectionObserverEntry], {} as IntersectionObserver)
    intersectionObserverCallback([mockEntry as IntersectionObserverEntry], {} as IntersectionObserver)
    intersectionObserverCallback([mockEntry as IntersectionObserverEntry], {} as IntersectionObserver)

    // Wait a bit
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    }, { timeout: 1000 })

    // Fetch should only be called once per URL
    const fetchCalls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls
    const apiCalls = fetchCalls.filter(call => String(call[0]).includes('pokeapi.co'))
    expect(apiCalls.length).toBeLessThanOrEqual(1)
  })

  it('should disconnect observer on unmount', () => {
    const { unmount } = render(
      <ChakraProvider value={defaultSystem}>
        <PokemonCard pokemon={mockPokemon} {...mockCallbacks} />
      </ChakraProvider>
    )

    unmount()

    expect(observerInstance.disconnect).toHaveBeenCalled()
  })

  it('should handle viewport entry with rootMargin preload', () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <PokemonCard pokemon={mockPokemon} {...mockCallbacks} />
      </ChakraProvider>
    )

    // Verify IntersectionObserver was created with rootMargin
    expect(global.IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        rootMargin: '200px',
        threshold: 0.01
      })
    )
  })

  it('should display error state when image loading fails', async () => {
    // Mock fetch to fail
    ;(global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'))

    render(
      <ChakraProvider value={defaultSystem}>
        <PokemonCard pokemon={mockPokemon} {...mockCallbacks} />
      </ChakraProvider>
    )

    // Simulate card entering viewport
    const mockEntry = {
      isIntersecting: true,
      target: document.createElement('div')
    }

    intersectionObserverCallback([mockEntry as IntersectionObserverEntry], {} as IntersectionObserver)

    // Wait for error state (with retries)
    await waitFor(() => {
      const errorText = screen.getByRole('status', { name: /error/i })
      expect(errorText).toBeInTheDocument()
    }, { timeout: 5000 })
  })
})
