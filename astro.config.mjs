import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import pagefind from 'astro-pagefind';

export default defineConfig({
  site: 'https://sokpichdev.github.io',
  base: '/ios-qa',
  integrations: [
    react(),
    pagefind(),
  ],
  build: {
    format: 'directory',
  },
  vite: {
    build: {
      rollupOptions: {
        external: [/\/pagefind\//],
      },
    },
  },
});
