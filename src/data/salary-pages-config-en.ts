/**
 * Configuration for English salary-amount SEO pages.
 * Mirrors the Spanish salary-pages-config.ts with English slugs.
 */

import { type SalaryPageConfig, allSalaryPages } from './salary-pages-config';

export interface SalaryPageConfigEn {
  amount: number;
  period: 'month' | 'year';
  slug: string;
  esSlug: string;
  annualGross: number;
  rangeCategory: 'low' | 'mid-low' | 'mid' | 'mid-high' | 'high';
}

function mapRange(cat: SalaryPageConfig['rangeCategory']): SalaryPageConfigEn['rangeCategory'] {
  const map: Record<SalaryPageConfig['rangeCategory'], SalaryPageConfigEn['rangeCategory']> = {
    'bajo': 'low',
    'medio-bajo': 'mid-low',
    'medio': 'mid',
    'medio-alto': 'mid-high',
    'alto': 'high',
  };
  return map[cat];
}

export const allSalaryPagesEn: SalaryPageConfigEn[] = allSalaryPages.map(p => ({
  amount: p.amount,
  period: p.period === 'mes' ? 'month' as const : 'year' as const,
  slug: p.period === 'mes'
    ? `${p.amount}-euros-gross-per-month`
    : `${p.amount}-euros-gross-per-year`,
  esSlug: p.slug,
  annualGross: p.annualGross,
  rangeCategory: mapRange(p.rangeCategory),
}));

export function getSalaryPageBySlugEn(slug: string): SalaryPageConfigEn | undefined {
  return allSalaryPagesEn.find(p => p.slug === slug);
}

export function getAdjacentPagesEn(config: SalaryPageConfigEn): SalaryPageConfigEn[] {
  const samePeriod = allSalaryPagesEn.filter(p => p.period === config.period);
  const idx = samePeriod.findIndex(p => p.slug === config.slug);
  const adjacent: SalaryPageConfigEn[] = [];

  for (let i = Math.max(0, idx - 3); i <= Math.min(samePeriod.length - 1, idx + 3); i++) {
    if (i !== idx) adjacent.push(samePeriod[i]);
  }

  return adjacent;
}

export function formatAmountEnglish(amount: number): string {
  return amount.toLocaleString('en-GB');
}
