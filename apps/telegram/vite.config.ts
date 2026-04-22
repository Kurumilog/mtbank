import path from "node:path";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../web/src"),
      "@telegram": path.resolve(__dirname, "./src"),
      "@shared-assets": path.resolve(__dirname, "../../shared/assets"),
    },
  },
  server: {
    fs: {
      allow: [path.resolve(__dirname, "../..")],
    },
  },
  assetsInclude: ["**/*.glb", "**/*.gltf"],
});
