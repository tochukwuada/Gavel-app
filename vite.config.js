import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    'process.env': '{}',
    'process.browser': 'true',
    'Buffer': ['buffer', 'Buffer'],
    'import.meta.env.VITE_PROGRAM_ID': JSON.stringify('JCy9xb86u24Be4M1qeMGUobZ8NCGJrP92qetqYVRu1RF'),
    'import.meta.env.VITE_CLUSTER': JSON.stringify('devnet'),
  },
  resolve: {
    alias: {
      buffer: 'buffer/',
      events: 'events/',
    },
  },
  optimizeDeps: {
    include: ['buffer', 'events'],
    exclude: ['@arcium-hq/client'],
  },
  build: {
    rollupOptions: {
      external: [],
    },
  },
})
