import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true, // Exposes the server to your local network (e.g., 10.189.51.43)
    allowedHosts: ['b5402f937cb07143-1-39-132-70.serveousercontent.com'],
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
