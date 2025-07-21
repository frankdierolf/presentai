import { defineConfig } from 'vite'

export default defineConfig({
  define: {
    // Make environment variables available to the client
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL)
  }
})