/**
 * Main i18n module. Re-exports everything and provides utility functions.
 */

export { type Locale, DEFAULT_LOCALE, LOCALES, LOCALE_LABELS, LANG_MAP, OG_LOCALE_MAP } from './types';
export { getAlternateUrl, getHreflangUrls, salarySlugEsToEn, salarySlugEnToEs, getSalaryRouteEs, getSalaryRouteEn } from './routes';
export { getMenuGroups, getFooterSections, t } from './ui';

import type { Locale } from './types';

/**
 * Detect locale from a URL pathname.
 */
export function getLocaleFromPath(pathname: string): Locale {
  return pathname.startsWith('/en/') || pathname === '/en' ? 'en' : 'es';
}
