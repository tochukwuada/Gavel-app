import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    'process.env': '{}',
    'process.browser': 'true',
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
