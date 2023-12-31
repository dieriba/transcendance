import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  plugins: [react()],
  server: {
    proxy : {
      '^/api': {
        target: 'http://backend:3000',
        changeOrigin: true,
      },
      '/socket.io': {
        changeOrigin: true,
        target: 'ws://backend:9000',
        ws: true,
      },
    },
    host: true,
    port: 5173,
    watch: {
      usePolling: true,
    },
  },
});
