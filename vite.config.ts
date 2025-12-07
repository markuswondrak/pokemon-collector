/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        runtimeCaching: [
          {
            // Match PokeAPI image URLs
            // Pattern: https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/...
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/PokeAPI\/sprites\/master\/sprites\/pokemon\/.*$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pokeapi-images',
              expiration: {
                maxEntries: 1000, // Adjust based on expected collection size
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
              },
              cacheableResponse: {
                statuses: [0, 200], // 0 is for opaque responses (CORS)
              },
            },
          },
        ],
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
  },
})
