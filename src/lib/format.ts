/**
 * Locale-aware formatting wrapper.
 * Uses en-GB for English, es-ES for Spanish. Always EUR currency.
 */

import type { Locale } from '../i18n/types';

function getIntlLocale(locale: Locale): string {
  return locale === 'en' ? 'en-GB' : 'es-ES';
}

/** Replace dot thousands separator with non-breaking space (Spanish formatting) */
function spacifyThousands(s: string): string {
  return s.replace(/\./g, '\u00A0');
}

export function formatEurosLocale(amount: number, locale: Locale): string {
  const intlLocale = getIntlLocale(locale);
  const formatted = new Intl.NumberFormat(intlLocale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return locale === 'es' ? spacifyThousands(formatted) : formatted;
}

export function formatEurosRoundLocale(amount: number, locale: Locale): string {
  const intlLocale = getIntlLocale(locale);
  const formatted = new Intl.NumberFormat(intlLocale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return locale === 'es' ? spacifyThousands(formatted) : formatted;
}

export function formatPercentLocale(value: number, locale: Locale): string {
  const intlLocale = getIntlLocale(locale);
  return new Intl.NumberFormat(intlLocale, {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumberLocale(value: number, locale: Locale): string {
  const intlLocale = getIntlLocale(locale);
  const formatted = new Intl.NumberFormat(intlLocale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return locale === 'es' ? spacifyThousands(formatted) : formatted;
}

export function formatAmountLocale(amount: number, locale: Locale): string {
  const intlLocale = getIntlLocale(locale);
  const formatted = amount.toLocaleString(intlLocale);
  return locale === 'es' ? formatted.replace(/\./g, '\u00A0') : formatted;
}
