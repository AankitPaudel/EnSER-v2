import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    host: true, // same Wi‑Fi: use the "Network" URL Vite prints (e.g. http://192.168.x.x:3000)
  },
})
