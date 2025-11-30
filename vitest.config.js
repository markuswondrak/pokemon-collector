import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 20000, // Integration tests may take up to 20 seconds; unit tests much faster (< 1s)
    // HARD REQUIREMENT: waitFor global timeout is set to 1 second in setup.ts
    // This prevents tests from waiting indefinitely for elements that don't appear
    // Individual waitFor calls timeout after 1 second, but test execution can take up to 10 seconds total
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
