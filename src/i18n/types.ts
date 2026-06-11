export type Locale = 'es' | 'en';

export const DEFAULT_LOCALE: Locale = 'es';
export const LOCALES: Locale[] = ['es', 'en'];

export const LOCALE_LABELS: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
};

export const LANG_MAP: Record<Locale, string> = {
  es: 'es-ES',
  en: 'en-GB',
};

export const OG_LOCALE_MAP: Record<Locale, string> = {
  es: 'es_ES',
  en: 'en_GB',
};
