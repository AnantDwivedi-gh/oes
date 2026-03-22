import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

// DECISION: electron-vite expects out/{main,preload,renderer} by default
// DECISION: Force CJS output (.js) — electron-vite dev expects index.js not index.mjs
// DECISION: Explicit external array to prevent bundling node/electron modules
const externalDeps = ['electron', 'path', 'fs', 'child_process', 'util', 'os', 'events', 'electron-store', 'better-sqlite3', 'uuid'];

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'src/main/index.ts'),
        external: externalDeps,
        output: {
          format: 'cjs',
          entryFileNames: '[name].js',
        },
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'src/preload/index.ts'),
        external: externalDeps,
        output: {
          format: 'cjs',
          entryFileNames: '[name].js',
        },
      },
    },
  },
  renderer: {
    plugins: [react(), tailwindcss()],
    root: resolve(__dirname, 'src/renderer'),
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'src/renderer/index.html'),
      },
    },
    resolve: {
      alias: {
        '@renderer': resolve(__dirname, 'src/renderer'),
        '@shared': resolve(__dirname, 'src/shared'),
      },
    },
  },
});
