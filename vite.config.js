import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    'global.crypto': 'globalThis.crypto',
    'process.env': '{}',
    'process.browser': 'true',
  },
  resolve: {
    alias: {
      buffer: 'buffer/',
      events: 'events/',
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
    },
  },
  optimizeDeps: {
    include: ['buffer', 'events'],
    exclude: ['@arcium-hq/client'],
  },
})
