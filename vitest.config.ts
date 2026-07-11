import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['lib/cipher/**'],
      thresholds: {
        lines: 80,
      },
    },
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@cipher': path.resolve(__dirname, './lib/cipher'),
    },
  },
})
