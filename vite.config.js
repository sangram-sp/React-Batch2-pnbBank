import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    port: 3000,       // Sets the port to 3000
    strictPort: true, // If port 3000 is busy, Vite will fail instead of picking 3001
    open: true        // Automatically opens the browser on start
  }
})
