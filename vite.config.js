import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Set VITE_BASE_URL env var to deploy to a sub-path (e.g. GitHub Pages)
// Example: VITE_BASE_URL=/algo-viz/ npm run build
const base = process.env.VITE_BASE_URL ?? '/'

export default defineConfig({
  plugins: [react()],
  base,
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        // Split vendor libs from app code for better caching
        manualChunks: {
          react: ['react', 'react-dom'],
        },
      },
    },
  },
})
