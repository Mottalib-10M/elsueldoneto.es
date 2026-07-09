// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://elsueldoneto.es',
  trailingSlash: 'always',
  integrations: [
    react(),
    sitemap({
      filter: (page) =>
        !page.includes('/aviso-legal') &&
        !page.includes('/politica-privacidad') &&
        !page.includes('/politica-cookies') &&
        !page.includes('/terminos') &&
        !page.includes('/contacto') &&
        !page.includes('/404') &&
        !page.includes('/legal-notice') &&
        !page.includes('/privacy-policy') &&
        !page.includes('/cookie-policy') &&
        !page.includes('/terms') &&
        !page.includes('/contact') &&
        !page.includes('/en/salary/'),
      serialize(item) {
        item.lastmod = new Date('2026-07-09').toISOString();
        return item;
      },
      i18n: {
        defaultLocale: 'es',
        locales: { es: 'es-ES', en: 'en-GB' },
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
