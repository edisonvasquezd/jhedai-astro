// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  adapter: cloudflare(),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      external: ['node:buffer'],
    },
    build: {
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
