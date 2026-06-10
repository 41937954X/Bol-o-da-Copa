import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  return {
    plugins: [react()],
    // Se o comando for 'build' (no GitHub Actions), ele usa o caminho do repositório.
    // Se for qualquer outro comando (como 'dev' no localhost), usa a raiz '/'.
    base: command === 'build' ? '/Bol-o-da-Copa/' : '/',
  }
})