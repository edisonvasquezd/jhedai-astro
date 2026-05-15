// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { criticalCSSIntegration } from './src/integrations/critical-css.mjs';

export default defineConfig({
  output: 'static',
  adapter: cloudflare(),
  integrations: [react(), criticalCSSIntegration()],
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      external: ['node:buffer'],
    },
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('three') || id.includes('@react-three')) return 'three-vendor';
            if (id.includes('framer-motion')) return 'animation-vendor';
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'react-vendor';
          },
        },
      },
    },
  },
});
