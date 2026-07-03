import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // Splits vendor code into cacheable chunks so a deploy that only
        // changes app code doesn't invalidate the framework/animation/
        // icon bundles the browser already cached from the previous visit.
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "animation-vendor": ["framer-motion"],
          "icons-vendor": ["lucide-react", "react-icons"],
          "http-vendor": ["axios"],
        },
      },
    },
  },
});
