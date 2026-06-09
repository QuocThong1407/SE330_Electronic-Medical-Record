import { defineConfig } from "vite";

export default defineConfig({
  root: process.cwd(),
  envDir: process.cwd(),
  server: {
    port: 5173,
  },
});
