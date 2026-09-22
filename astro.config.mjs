// @ts-check
import { defineConfig } from 'astro/config';
import trustKit from './src/integrations/trust-kit.mjs';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://elsueldoneto.es',
  /*
   * Pages consolidees le 2026-09-22.
   *
   * Ces trente-cinq pages ne differaient que par un montant et n'ont recu
   * aucune impression en 54 jours de mesure. Leur contenu reste accessible :
   * la page-mere /sueldo/ affiche le net calcule pour chacun des montants.
   */
  redirects: {
    '/sueldo/900-euros-brutos-al-mes/': '/sueldo/',
    '/sueldo/1000-euros-brutos-al-mes/': '/sueldo/',
    '/sueldo/1100-euros-brutos-al-mes/': '/sueldo/',
    '/sueldo/1200-euros-brutos-al-mes/': '/sueldo/',
    '/sueldo/1300-euros-brutos-al-mes/': '/sueldo/',
    '/sueldo/1400-euros-brutos-al-mes/': '/sueldo/',
    '/sueldo/1500-euros-brutos-al-mes/': '/sueldo/',
    '/sueldo/1600-euros-brutos-al-mes/': '/sueldo/',
    '/sueldo/1700-euros-brutos-al-mes/': '/sueldo/',
    '/sueldo/1800-euros-brutos-al-mes/': '/sueldo/',
    '/sueldo/1900-euros-brutos-al-mes/': '/sueldo/',
    '/sueldo/2000-euros-brutos-al-mes/': '/sueldo/',
    '/sueldo/2200-euros-brutos-al-mes/': '/sueldo/',
    '/sueldo/2500-euros-brutos-al-mes/': '/sueldo/',
    '/sueldo/3000-euros-brutos-al-mes/': '/sueldo/',
    '/sueldo/3500-euros-brutos-al-mes/': '/sueldo/',
    '/sueldo/15000-euros-brutos-al-año/': '/sueldo/',
    '/sueldo/18000-euros-brutos-al-año/': '/sueldo/',
    '/sueldo/20000-euros-brutos-al-año/': '/sueldo/',
    '/sueldo/21000-euros-brutos-al-año/': '/sueldo/',
    '/sueldo/23000-euros-brutos-al-año/': '/sueldo/',
    '/sueldo/24000-euros-brutos-al-año/': '/sueldo/',
    '/sueldo/25000-euros-brutos-al-año/': '/sueldo/',
    '/sueldo/27000-euros-brutos-al-año/': '/sueldo/',
    '/sueldo/28000-euros-brutos-al-año/': '/sueldo/',
    '/sueldo/32000-euros-brutos-al-año/': '/sueldo/',
    '/sueldo/35000-euros-brutos-al-año/': '/sueldo/',
    '/sueldo/40000-euros-brutos-al-año/': '/sueldo/',
    '/sueldo/45000-euros-brutos-al-año/': '/sueldo/',
    '/sueldo/50000-euros-brutos-al-año/': '/sueldo/',
    '/sueldo/60000-euros-brutos-al-año/': '/sueldo/',
    '/sueldo/70000-euros-brutos-al-año/': '/sueldo/',
    '/sueldo/80000-euros-brutos-al-año/': '/sueldo/',
    '/sueldo/100000-euros-brutos-al-año/': '/sueldo/',
    '/sueldo/120000-euros-brutos-al-año/': '/sueldo/',
  },

  trailingSlash: 'always',
  integrations: [
    trustKit({ lang: 'es', siteUrl: 'https://elsueldoneto.es', siteName: 'El Sueldo Neto', founded: '2026-05-14', about: '/sobre-nosotros/', method: '/metodologia/',
      i18n: [{ prefix: '/en/', lang: 'en', about: '/en/about/', method: '/en/methodology/' }] }),
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
