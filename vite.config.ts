import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    host: true, // Configuração para aceitar conexões externas
    port: 8088,
    allowedHosts: ["pages.guiatour.online"], // Permite acessar via este domínio
  },
  build: {
    sourcemap: true,
  },
});
