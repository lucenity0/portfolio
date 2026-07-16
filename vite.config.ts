import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

// me.lucenity.dev is a custom-domain GitHub Pages site served from the root,
// so the base path is "/" (no repo-name prefix).
export default defineConfig({
  base: "/",
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    // Honour a PORT assigned by the environment (falls back to Vite's default).
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
  },
  build: {
    outDir: "dist",
    target: "es2022",
    // Keep the output legible while the project is small.
    sourcemap: true,
  },
});
