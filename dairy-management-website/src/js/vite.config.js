import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // The base must match your repository name for GitHub Pages to work.
  base: '/lovable-milk-manager/'
});
