// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'

// export default defineConfig({

//   plugins: [react(), tailwindcss()],
//   server: { port: 5175 },
//   optimizeDeps: {
//     include: ["pdfjs-dist"]
//   },
//   build: {
//     commonjsOptions: {
//       transformMixedEsModules: true
//     }
//   },

// })


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5175 },

  // react-pdf 9.x + pdfjs-dist 4.x
  // Let Vite pre-bundle the API so ESM/CJS interop works cleanly.
  // The worker is loaded separately at runtime via `new URL(...)`
  // — see DocumentAnnotator.jsx. Do NOT exclude pdfjs-dist here;
  // doing so re-introduces the "fake worker" + warning.js export error.
  optimizeDeps: {
    include: ['react-pdf', 'pdfjs-dist'],
  },

  // Worker file is served as an ES module asset.
  worker: {
    format: 'es',
  },

  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
})
