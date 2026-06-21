import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  publicDir: "static",
  server: {
    proxy: {
      "/json": {
        target: "https://inet-ip.info",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "public",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        ipcalc: resolve(__dirname, "ipcalc.html"),
        IPv4byCountry: resolve(__dirname, "IPv4byCountry.html"),
        playground: resolve(__dirname, "playground.html"),
      },
    },
  },
});
