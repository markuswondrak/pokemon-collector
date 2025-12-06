// T001: NameRegistry module - Preload and manage all Pokemon names
import { MAX_POKEMON_INDEX, NAMES_CACHE_KEY_PREFIX, APP_VERSION } from '../utils/constants.ts'
import * as pokemonApi from './pokemonApi.ts'

/**
 * PokemonReference - Basic name/ID pair
 */
export interface PokemonReference {
  id: number
  name: string
}

/**
 * NamesCacheRecord - localStorage structure
 */
interface NamesCacheRecord {
  version: string
  items: PokemonReference[]
  fetchedAt: number
}

/**
 * NameRegistry - In-memory registry for Pokemon names
 */
class NameRegistry {
  private byId: Map<number, string> = new Map()
  private all: PokemonReference[] = []
  private _ready: boolean = false
  private _error: string | null = null
  private _loading: boolean = false
  private lastValidVersion: string | null = null

  get ready(): boolean {
    return this._ready
  }

  get error(): string | null {
    return this._error
  }

  get loading(): boolean {
    return this._loading
  }

  /**
   * T004: Load all names with caching
   * T005: Retry with exponential backoff + jitter
   * T008: Persist and read cache via localStorage
   */
  async loadAllNamesWithCache(): Promise<void> {
    if (this._loading || this._ready) {
      return
    }

    this._loading = true
    this._error = null

    try {
      // Check cache first
      const cached = this.readCache()
      if (cached && cached.version === APP_VERSION) {
        this.hydrateFromCache(cached.items)
        if (import.meta.env.DEV) {
          console.log('[NameRegistry] Loaded from cache:', cached.items.length, 'names')
        }
        this._ready = true
        this._loading = false
        return
      }

      // T005: Retry with exponential backoff
      const maxRetries = 3
      const baseDelayMs = 500
      const jitter = 0.2

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          if (import.meta.env.DEV) {
            console.log(`[NameRegistry] Fetch attempt ${String(attempt)}/${String(maxRetries)}`)
          }

          // T004: Fetch all names
          const items = await this.fetchAllNames()

          // T007: Validate completeness
          if (!this.isCompleteList(items)) {
            throw new Error('Incomplete Pokemon list received')
          }

          // Hydrate in-memory registry
          this.hydrateFromCache(items)

          // T008: Persist to cache
          this.writeCache(items)

          this._ready = true
          this._loading = false

          if (import.meta.env.DEV) {
            console.log('[NameRegistry] Successfully loaded:', items.length, 'names')
          }

          return
        } catch (err) {
          if (attempt === maxRetries) {
            // Final attempt failed
            const message =
              err instanceof Error ? err.message : 'Failed to load Pokemon names'
            this._error = `Unable to load Pokemon names after ${String(maxRetries)} attempts. Please check your connection and refresh the page.`
            this._loading = false

            if (import.meta.env.DEV) {
              console.error('[NameRegistry] All retries exhausted:', message)
            }

            throw new Error(this._error)
          }

          // Calculate delay with jitter
          const delayMs = baseDelayMs * Math.pow(2, attempt - 1)
          const jitterMs = delayMs * jitter * (Math.random() * 2 - 1)
          const totalDelay = delayMs + jitterMs

          if (import.meta.env.DEV) {
            console.warn(
              `[NameRegistry] Attempt ${String(attempt)} failed, retrying in ${String(Math.round(totalDelay))}ms...`
            )
          }

          await new Promise((resolve) => setTimeout(resolve, totalDelay))
        }
      }
    } catch (err) {
      // Error already set in retry loop
      this._loading = false
      throw err
    }
  }

  /**
   * T004: Fetch all names from API
   * Extract IDs from resource URLs
   */
  private async fetchAllNames(): Promise<PokemonReference[]> {
    const response = await pokemonApi.getAllPokemonList()

    // Extract ID from URL using regex: /\/pokemon\/(\d+)\/?$/
    const idRegex = /\/pokemon\/(\d+)\/?$/
    const items: PokemonReference[] = []

    for (const item of response) {
      const match = item.url.match(idRegex)
      if (match && match[1]) {
        const id = parseInt(match[1], 10)
        items.push({
          id,
          name: this.capitalizeFirstLetter(item.name),
        })
      }
    }

    return items
  }

  /**
   * T007: Validate that the list is complete (all IDs 1..MAX without gaps)
   */
  private isCompleteList(items: PokemonReference[]): boolean {
    if (items.length < MAX_POKEMON_INDEX) {
      return false
    }

    // Create a Set of IDs and verify all required IDs exist
    const idSet = new Set(items.map((item) => item.id))

    for (let i = 1; i <= MAX_POKEMON_INDEX; i++) {
      if (!idSet.has(i)) {
        return false
      }
    }

    return true
  }

  /**
   * Hydrate in-memory structures from items array
   */
  private hydrateFromCache(items: PokemonReference[]): void {
    this.byId.clear()
    this.all = []

    for (const item of items) {
      this.byId.set(item.id, item.name)
      this.all.push(item)
    }

    // Sort by ID ascending
    this.all.sort((a, b) => a.id - b.id)
  }

  /**
   * T008: Read cache from localStorage
   */
  private readCache(): NamesCacheRecord | null {
    try {
      const key = `${NAMES_CACHE_KEY_PREFIX}${APP_VERSION}`
      const cached = localStorage.getItem(key)

      if (!cached) {
        return null
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const record: NamesCacheRecord = JSON.parse(cached)

      // Validate structure
      if (
        !record.version ||
        !Array.isArray(record.items) ||
        typeof record.fetchedAt !== 'number'
      ) {
        return null
      }

      return record
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn('[NameRegistry] Cache read error:', err)
      }
      return null
    }
  }

  /**
   * T008: Write cache to localStorage
   */
  private writeCache(items: PokemonReference[]): void {
    try {
      const key = `${NAMES_CACHE_KEY_PREFIX}${APP_VERSION}`
      const record: NamesCacheRecord = {
        version: APP_VERSION,
        items,
        fetchedAt: Date.now(),
      }

      localStorage.setItem(key, JSON.stringify(record))

      if (import.meta.env.DEV) {
        console.log('[NameRegistry] Cache written successfully')
      }
    } catch (err) {
      // Non-critical - log and continue
      if (import.meta.env.DEV) {
        console.warn('[NameRegistry] Cache write error:', err)
      }
    }
  }

  /**
   * T009: Get name by ID
   */
  getName(id: number): string | undefined {
    return this.byId.get(id)
  }

  /**
   * T009: Search by name (case-insensitive substring match)
   */
  search(term: string): PokemonReference[] {
    if (!term || term.length === 0) {
      return []
    }

    const lowerTerm = term.toLowerCase()
    return this.all.filter((item) => item.name.toLowerCase().includes(lowerTerm))
  }

  /**
   * Capitalize first letter of a string
   */
  private capitalizeFirstLetter(str: string): string {
    if (!str || str.length === 0) {
      return str
    }
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  /**
   * T005: Invalidate cache on version change
   * Should be called when app version changes to force refresh once
   * Returns true if invalidation occurred, false if no action needed
   */
  invalidateOnVersionChange(): boolean {
    if (this.lastValidVersion === APP_VERSION) {
      return false // Already validated for this version
    }
    
    // Version changed - invalidate caches
    this.lastValidVersion = APP_VERSION
    this.byId.clear()
    this.all = []
    this._ready = false
    this._error = null
    this._loading = false
    
    // Also invalidate API response cache
    pokemonApi.invalidateResponseCache()
    
    if (import.meta.env.DEV) {
      console.log('[NameRegistry] Cache invalidated for version change')
    }
    
    return true
  }

  /**
   * Reset registry (for testing)
   */
  reset(): void {
    this.byId.clear()
    this.all = []
    this._ready = false
    this._error = null
    this._loading = false
    this.lastValidVersion = null
  }
}

// Export singleton instance
export const nameRegistry = new NameRegistry()
