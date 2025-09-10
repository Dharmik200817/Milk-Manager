import { defineConfig } from 'vite'

export default defineConfig({
  // The "base" option is critical for deploying to GitHub Pages or any
  // other sub-directory. It tells Vite to prefix all asset URLs with
  // your repository name.
  //
  // Replace 'lovable-milk-manager' with the exact name of your GitHub repository.
  base: 'https://github.com/Dharmik200817/lovable-milk-manager.git',

  // The "build" section contains options related to the production build process.
  build: {
    // Setting "outDir" to 'dist' is the default and good practice.
    // This is where Vite will place all the generated assets (HTML, JS, CSS)
    // for your production site.
    outDir: 'dist',

    // "sourcemap" is useful for debugging production builds.
    sourcemap: false,

    // The "rollupOptions" section allows for fine-grained control over the
    // Rollup build tool that Vite uses internally.
    rollupOptions: {
      // You can define input files here if you have multiple entry points.
      // For a standard SPA, 'index.html' is the default.
      input: 'index.html'
    }
  },

  // The "server" section contains options for the development server.
  server: {
    // Specify the port to run the development server on.
    port: 3000
  }
});