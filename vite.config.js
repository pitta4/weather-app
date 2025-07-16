import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Usa percorsi relativi
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
