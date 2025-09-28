import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./public/manifest.json";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), crx({ manifest })],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        redirect: path.resolve(__dirname, "redirect.html"),
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Ensure only one React instance across multiple entrypoints (content scripts, UI)
    dedupe: ["react", "react-dom"],
  },
});
