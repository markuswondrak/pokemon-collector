import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.tsx'],
    testTimeout: 20000, // Integration tests may take up to 20 seconds; unit tests much faster (< 1s)
    // HARD REQUIREMENT: waitFor global timeout is set to 1 second in setup.tsx
    // This prevents tests from waiting indefinitely for elements that don't appear
    // Individual waitFor calls timeout after 1 second, but test execution can take up to 10 seconds total
    
    // Test worker configuration per constitution: limit to 4 workers during implementation
    // to prevent resource contention and ensure stable, reproducible results
    threads: true,
    maxThreads: 4,
    minThreads: 1,
    
    // Chakra UI initialization for jsdom environment
    deps: {
      inline: ['@chakra-ui/react', '@emotion/react', '@emotion/styled'],
    },

    // Handle CSS imports in tests - use 'inline' to suppress jsdom CSS parsing warnings
    // jsdom's CSS parser generates warnings for advanced CSS features; inlining avoids this
    css: 'inline',
    
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'dist/'
      ]
    }
  }
})

