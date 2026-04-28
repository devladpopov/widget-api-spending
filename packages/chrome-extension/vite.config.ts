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

        const coreAlias = {
          '@api-spending/core': resolve(__dirname, '../core/src/index.ts'),
        };

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
          resolve: { alias: coreAlias },
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
          resolve: { alias: coreAlias },
        });

        // Build injected interceptor as IIFE (loaded via <script src> to bypass CSP)
        await build({
          configFile: false,
          build: {
            outDir: dist,
            emptyOutDir: false,
            lib: {
              entry: resolve(__dirname, 'src/injected/interceptor.ts'),
              formats: ['iife'],
              name: 'interceptor',
              fileName: () => 'interceptor.js',
            },
            rollupOptions: {
              output: { inlineDynamicImports: true },
            },
          },
        });

        // Build settings page as IIFE
        await build({
          configFile: false,
          build: {
            outDir: dist,
            emptyOutDir: false,
            lib: {
              entry: resolve(__dirname, 'src/settings/settings.tsx'),
              formats: ['iife'],
              name: 'settings',
              fileName: () => 'settings.js',
            },
            rollupOptions: {
              output: { inlineDynamicImports: true },
            },
          },
          resolve: {
            alias: {
              ...coreAlias,
              'react': 'preact/compat',
              'react-dom': 'preact/compat',
            },
          },
          plugins: [preact()],
        });

        // Copy settings HTML
        let settingsHtml = readFileSync(resolve(__dirname, 'src/settings/index.html'), 'utf-8');
        settingsHtml = settingsHtml
          .replace('./settings.tsx', './settings.js')
          .replace('<link rel="stylesheet" href="./settings.css" />', '<link rel="stylesheet" href="./assets/settings.css" />');
        writeFileSync(resolve(dist, 'settings.html'), settingsHtml);

        // Copy settings CSS
        cpSync(resolve(__dirname, 'src/settings/settings.css'), resolve(dist, 'assets/settings.css'));

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
