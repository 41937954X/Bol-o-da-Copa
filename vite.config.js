import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Se for o comando 'npm run build' (no GitHub), usa o caminho relativo './'
  // Se for o comando 'npm run dev' (no localhost), usa a raiz limpa '/'
  base: process.env.NODE_ENV === 'production' ? './' : '/',
})