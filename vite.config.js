import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Bol-o-da-Copa/', // 👈 Aqui vai apenas o nome do repositório!
})