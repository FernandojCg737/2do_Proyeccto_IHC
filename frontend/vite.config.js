import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',   // Necesario para Docker
    port: 5173,
    watch: {
      usePolling: true, // Necesario para hot reload en Docker + Windows
    },
  },
})
