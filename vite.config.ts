import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // caminhos relativos: funciona na raiz (Vercel) e em subpasta (GitHub Pages)
  base: './',
  plugins: [react()],
  server: { host: true },
  build: { chunkSizeWarningLimit: 1500 },
})
