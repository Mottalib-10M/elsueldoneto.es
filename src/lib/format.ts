/**
 * Locale-aware formatting wrapper.
 * Uses en-GB for English, es-ES for Spanish. Always EUR currency.
 */

import type { Locale } from '../i18n/types';

function getIntlLocale(locale: Locale): string {
  return locale === 'en' ? 'en-GB' : 'es-ES';
}

export function formatEurosLocale(amount: number, locale: Locale): string {
  const intlLocale = getIntlLocale(locale);
  return new Intl.NumberFormat(intlLocale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatEurosRoundLocale(amount: number, locale: Locale): string {
  const intlLocale = getIntlLocale(locale);
  return new Intl.NumberFormat(intlLocale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
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
  return new Intl.NumberFormat(intlLocale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatAmountLocale(amount: number, locale: Locale): string {
  const intlLocale = getIntlLocale(locale);
  return amount.toLocaleString(intlLocale);
}
