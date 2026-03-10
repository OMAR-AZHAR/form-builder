/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: env.VITE_APP_HOST || "localhost",
      port: Number(env.VITE_APP_PORT) || 5173,
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
    },
    build: {
      minify: "esbuild",
      target: "es2022",
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom", "@reduxjs/toolkit", "react-redux"],
            dnd: ["@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities"],
          },
        },
        treeshake: {
          moduleSideEffects: false,
          preset: "recommended",
        },
      },
    },
    esbuild: {
      drop: ["console", "debugger"],
      legalComments: "none",
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/test/setup.ts",
      css: true,
    },
  };
});
