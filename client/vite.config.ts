import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

import fs from "node:fs";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    host: "localhost",
    port: 5173,

    https: {
      key: fs.readFileSync(
        path.resolve(__dirname, "../server/certs/localhost-key.pem"),
      ),
      cert: fs.readFileSync(
        path.resolve(__dirname, "../server/certs/localhost.pem"),
      ),
    },
  },
});
