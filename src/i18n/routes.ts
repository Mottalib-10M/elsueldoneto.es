/**
 * Bidirectional route mapping between Spanish and English paths.
 * Used for language switcher + hreflang tags.
 */

/** Map of Spanish path -> English path (without locale prefix) */
const ES_TO_EN: Record<string, string> = {
  '/': '/en/',
  '/calculadora-irpf/': '/en/irpf-calculator/',
  '/calculadora-salario-bruto/': '/en/gross-salary-calculator/',
  '/regimen-beckham-calculadora/': '/en/beckham-law-calculator/',
  '/calculadora-autonomos/': '/en/self-employed-calculator/',
  '/calculadora-finiquito/': '/en/severance-calculator/',
  '/calculadora-paro/': '/en/unemployment-calculator/',
  '/calculadora-hora-trabajada/': '/en/hourly-wage-calculator/',
  '/calculadora-pagas-extra/': '/en/extra-pay-calculator/',
  '/calculadora-tipo-retencion/': '/en/withholding-rate-calculator/',
  '/comparador-comunidades/': '/en/regional-comparison/',
  '/calculadora-iva/': '/en/vat-calculator/',
  '/calculadora-herencia/': '/en/inheritance-tax-calculator/',
  '/calculadora-venta-vivienda/': '/en/property-sale-calculator/',
  '/calculadora-plusvalia-municipal/': '/en/capital-gains-tax-calculator/',
  '/calculadora-hipoteca/': '/en/mortgage-calculator/',
  '/calculadora-jubilacion/': '/en/retirement-calculator/',
  '/calculadora-prestamo/': '/en/loan-calculator/',
  '/calculadora-interes-compuesto/': '/en/compound-interest-calculator/',
  '/calculadora-plan-ahorro/': '/en/savings-plan-calculator/',
  '/calculadora-inflacion/': '/en/inflation-calculator/',
  '/guias/': '/en/guides/',
  '/guias/como-calcular-sueldo-neto/': '/en/guides/how-to-calculate-net-salary/',
  '/guias/regimen-beckham-explicado/': '/en/guides/beckham-law-explained/',
  '/guias/jubilacion-espana-edad-pension/': '/en/guides/retirement-spain-age-pension/',
  '/guias/cuotas-autonomos-espana/': '/en/guides/self-employed-contributions-spain/',
  '/guias/tramos-irpf-espana/': '/en/guides/income-tax-brackets-spain/',
  '/guias/irpf-por-comunidad-autonoma/': '/en/guides/irpf-by-autonomous-community/',
  '/guias/calcular-finiquito-indemnizacion/': '/en/guides/severance-pay-guide/',
  '/aviso-legal/': '/en/legal-notice/',
  '/politica-privacidad/': '/en/privacy-policy/',
  '/politica-cookies/': '/en/cookie-policy/',
  '/terminos/': '/en/terms/',
  '/contacto/': '/en/contact/',
  '/sobre-nosotros/': '/en/about/',
  '/sueldo/': '/en/salary/',
  '/widget/': '/en/widget/',
};

/** Build reverse map: English path -> Spanish path */
const EN_TO_ES: Record<string, string> = {};
for (const [es, en] of Object.entries(ES_TO_EN)) {
  EN_TO_ES[en] = es;
}

/**
 * Build salary page route mappings dynamically.
 * Spanish: /sueldo/{amount}-euros-brutos-al-mes/
 * English: /en/salary/{amount}-euros-gross-per-month/
 */
export function getSalaryRouteEs(slug: string): string {
  return `/sueldo/${slug}/`;
}

export function getSalaryRouteEn(slug: string): string {
  return `/en/salary/${slug}/`;
}

export function salarySlugEsToEn(esSlug: string): string {
  return esSlug
    .replace('-euros-brutos-al-mes', '-euros-gross-per-month')
    .replace('-euros-brutos-al-año', '-euros-gross-per-year');
}

export function salarySlugEnToEs(enSlug: string): string {
  return enSlug
    .replace('-euros-gross-per-month', '-euros-brutos-al-mes')
    .replace('-euros-gross-per-year', '-euros-brutos-al-año');
}

/**
 * Get the alternate URL for a given path in the target locale.
 * Handles both static routes and dynamic salary pages.
 */
export function getAlternateUrl(currentPath: string, targetLocale: 'es' | 'en'): string | null {
  // Normalize path: decode URI components (e.g. %C3%B1 → ñ) and ensure trailing slash
  const decoded = decodeURIComponent(currentPath);
  const path = decoded.endsWith('/') ? decoded : `${decoded}/`;

  // Check static routes first
  if (targetLocale === 'en') {
    if (ES_TO_EN[path]) return ES_TO_EN[path];
    // Check salary pages
    const salaryMatch = path.match(/^\/sueldo\/(.+)\/$/);
    if (salaryMatch) {
      return `/en/salary/${salarySlugEsToEn(salaryMatch[1])}/`;
    }
  } else {
    if (EN_TO_ES[path]) return EN_TO_ES[path];
    // Check salary pages
    const salaryMatch = path.match(/^\/en\/salary\/(.+)\/$/);
    if (salaryMatch) {
      return `/sueldo/${salarySlugEnToEs(salaryMatch[1])}/`;
    }
  }

  return null;
}

/**
 * Get both alternate URLs for hreflang tags.
 */
export function getHreflangUrls(currentPath: string): { es: string; en: string } | null {
  const path = currentPath.endsWith('/') ? currentPath : `${currentPath}/`;
  const isEnglish = path.startsWith('/en/');

  const esPath = isEnglish ? getAlternateUrl(path, 'es') : path;
  const enPath = isEnglish ? path : getAlternateUrl(path, 'en');

  if (!esPath || !enPath) return null;

  return { es: esPath, en: enPath };
}
