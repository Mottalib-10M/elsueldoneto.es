/**
 * Configuration for programmatic salary-amount SEO pages.
 * Each entry generates a unique landing page targeting "X euros brutos" searches.
 */

export interface SalaryPageConfig {
  amount: number;
  period: 'mes' | 'año';
  slug: string;
  annualGross: number;   // Normalized to annual for calculations
  rangeCategory: 'bajo' | 'medio-bajo' | 'medio' | 'medio-alto' | 'alto';
}

const monthlyPages: SalaryPageConfig[] = [
  900, 1000, 1100, 1200, 1300, 1400, 1500, 1600,
  1700, 1800, 1900, 2000, 2200, 2500, 3000, 3500,
].map(amount => ({
  amount,
  period: 'mes' as const,
  slug: `${amount}-euros-brutos-al-mes`,
  annualGross: amount * 14,  // 14 pagas standard
  rangeCategory: getRangeCategory(amount * 14),
}));

const annualPages: SalaryPageConfig[] = [
  15000, 18000, 20000, 21000, 22000, 23000, 24000, 25000,
  27000, 28000, 30000, 32000, 35000, 40000, 45000, 50000,
  55000, 60000, 70000, 80000, 100000, 120000,
].map(amount => ({
  amount,
  period: 'año' as const,
  slug: `${amount}-euros-brutos-al-año`,
  annualGross: amount,
  rangeCategory: getRangeCategory(amount),
}));

function getRangeCategory(annualGross: number): SalaryPageConfig['rangeCategory'] {
  if (annualGross <= 17094) return 'bajo';      // Near or below SMI
  if (annualGross <= 25000) return 'medio-bajo';
  if (annualGross <= 40000) return 'medio';
  if (annualGross <= 65000) return 'medio-alto';
  return 'alto';
}

export const allSalaryPages: SalaryPageConfig[] = [...monthlyPages, ...annualPages];

export function getSalaryPageBySlug(slug: string): SalaryPageConfig | undefined {
  return allSalaryPages.find(p => p.slug === slug);
}

export function getAdjacentPages(config: SalaryPageConfig): SalaryPageConfig[] {
  const samePeriod = allSalaryPages.filter(p => p.period === config.period);
  const idx = samePeriod.findIndex(p => p.slug === config.slug);
  const adjacent: SalaryPageConfig[] = [];

  for (let i = Math.max(0, idx - 3); i <= Math.min(samePeriod.length - 1, idx + 3); i++) {
    if (i !== idx) adjacent.push(samePeriod[i]);
  }

  return adjacent;
}

export function formatAmountSpanish(amount: number): string {
  return amount.toLocaleString('es-ES').replace(/\./g, ' ');
}
