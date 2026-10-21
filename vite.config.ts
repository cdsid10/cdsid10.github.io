import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { seoPages } from './seo-pages';

export default defineConfig({
  base: '/', // IMPORTANT: Use '/' for User Pages (username.github.io)
  plugins: [
    react(), 
    tailwindcss(),
    seoPages(), // per-route HTML + metadata + sitemap.xml (see seo-pages.ts)
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});