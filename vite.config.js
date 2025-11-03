import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
    server: {
    host: true, 
    allowedHosts: ['.ngrok-free.app', '.ngrok-free.dev'] 
    // https://discomfortingly-increasing-kenya.ngrok-free.dev/
    // ngrok http 5173
  }
})
