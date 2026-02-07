import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function buildProxy(url) {
  return {
    "/api": {
      target: url,
      changeOrigin: true
    }
  };
}

function buildServer() {
  return {
    proxy: buildProxy("http://127.0.0.1:8000")
  };
}

export default defineConfig({
  plugins: [react()],
  server: buildServer()
});
