/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

const repoRoot = fileURLToPath(new URL('../..', import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      // Allow importing content YAML from the repo root (outside apps/web).
      allow: [repoRoot],
    },
  },
  optimizeDeps: {
    // Workspace source package (TS, unbundled) — let Vite transform it directly.
    exclude: ['@underhood/simulation-engine'],
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
