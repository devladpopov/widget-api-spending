import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { resolve } from 'path';
import { cpSync, writeFileSync, readFileSync } from 'fs';
import { build } from 'vite';

export default defineConfig({
  base: './',
  root: resolve(__dirname, 'src/popup'),
  plugins: [
    preact(),
    {
      name: 'build-extension-scripts',
      async closeBundle() {
        const dist = resolve(__dirname, 'dist');

        // Build background service worker as IIFE
        await build({
          configFile: false,
          build: {
            outDir: dist,
            emptyOutDir: false,
            lib: {
              entry: resolve(__dirname, 'src/background/index.ts'),
              formats: ['iife'],
              name: 'background',
              fileName: () => 'background.js',
            },
            rollupOptions: {
              output: { inlineDynamicImports: true },
            },
          },
        });

        // Build content script as IIFE
        await build({
          configFile: false,
          build: {
            outDir: dist,
            emptyOutDir: false,
            lib: {
              entry: resolve(__dirname, 'src/content/index.ts'),
              formats: ['iife'],
              name: 'content',
              fileName: () => 'content.js',
            },
            rollupOptions: {
              output: { inlineDynamicImports: true },
            },
          },
        });

        // Copy manifest and assets
        cpSync(resolve(__dirname, 'manifest.json'), resolve(dist, 'manifest.json'));
        try {
          cpSync(resolve(__dirname, 'public/assets'), resolve(dist, 'assets'), { recursive: true, force: true });
        } catch {}
      },
    },
  ],
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
  resolve: {
    alias: {
      '@api-spending/core': resolve(__dirname, '../core/src/index.ts'),
    },
  },
});
