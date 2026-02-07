import { defineConfig as cfg } from "vite";
import reactPlugin from "@vitejs/plugin-react";

const backend = "http://127.0.0.1:8000";

const proxyConfig = {
  "/api": Object.freeze({
    target: backend,
    changeOrigin: true
  })
};

const serverConfig = Object.assign({}, { proxy: proxyConfig });

export default cfg(() => ({
  plugins: [].concat(reactPlugin()),
  server: serverConfig
}));
