// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://2217441.github.io',
  base: '/AikidoClub',
  vite: {
    plugins: [tailwindcss()]
  }
});