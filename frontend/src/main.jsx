import { defineConfig as cfg } from "vite";
import reactPlugin from "@vitejs/plugin-react";

const createApiProxy = (endpoint) => ({
  "/api": Object.assign(
    {},
    {
      target: endpoint,
      changeOrigin: true
    }
  )
});

const createDevServer = () => {
  const backend = "http://127.0.0.1:8000";
  return {
    proxy: createApiProxy(backend)
  };
};

export default cfg(() => ({
  plugins: [reactPlugin()],
  server: createDevServer()
}));
