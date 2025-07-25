/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: parseInt(process.env.VITE_DEV_PORT || '3000'),
    host: true
  },
  preview: {
    port: parseInt(process.env.VITE_PREVIEW_PORT || '3001'),
    host: true
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    exclude: ['tests/e2e/**', 'e2e/**', 'node_modules/**', 'dist/**', '.idea/**', '.git/**', '.cache/**']
  }
})
