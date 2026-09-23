/**
 * Spanish number and currency formatting utilities.
 * Uses comma as decimal separator, dot as thousands separator.
 * Currency symbol after number: 1.234,56 €
 */

const euroFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const euroFormatterNoDecimals = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat('es-ES', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function formatEuros(amount: number): string {
  return euroFormatter.format(amount);
}

export function formatEurosRound(amount: number): string {
  return euroFormatterNoDecimals.format(amount);
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatPercent(value: number): string {
  return percentFormatter.format(value);
}

export function formatPercentFromRate(rate: number): string {
  return percentFormatter.format(rate / 100);
}

export function formatEurosPerMonth(annualAmount: number, pagas: 12 | 14 = 14): string {
  return formatEuros(annualAmount / pagas);
}
