/**
 * Shared UI strings for Header, Footer, and CalculadoraLayout.
 * Both 'es' and 'en' dictionaries.
 */

import type { Locale } from './types';

interface MenuItem {
  href: string;
  label: string;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

interface FooterSection {
  heading: string;
  items: MenuItem[];
}

// ─── Header menus ──────────────────────────────────────────────

const headerMenuEs: MenuGroup[] = [
  {
    label: 'Sueldo y Empleo',
    items: [
      { href: '/', label: 'Sueldo Neto' },
      { href: '/calculadora-irpf/', label: 'IRPF' },
      { href: '/calculadora-salario-bruto/', label: 'Salario Bruto' },
      { href: '/comparador-comunidades/', label: 'Comparador CCAA' },
      { href: '/calculadora-autonomos/', label: 'Autónomos' },
      { href: '/regimen-beckham-calculadora/', label: 'Régimen Beckham' },
      { href: '/calculadora-tipo-retencion/', label: 'Tipo de Retención' },
      { href: '/calculadora-pagas-extra/', label: 'Pagas Extra' },
      { href: '/calculadora-hora-trabajada/', label: 'Hora Trabajada' },
      { href: '/calculadora-finiquito/', label: 'Finiquito' },
      { href: '/calculadora-paro/', label: 'Paro' },
    ],
  },
  {
    label: 'Impuestos',
    items: [
      { href: '/calculadora-iva/', label: 'IVA' },
      { href: '/calculadora-herencia/', label: 'Herencia y Sucesiones' },
      { href: '/calculadora-venta-vivienda/', label: 'Venta de Vivienda' },
      { href: '/calculadora-plusvalia-municipal/', label: 'Plusvalía Municipal' },
    ],
  },
  {
    label: 'Finanzas',
    items: [
      { href: '/calculadora-hipoteca/', label: 'Hipoteca' },
      { href: '/calculadora-jubilacion/', label: 'Jubilación' },
      { href: '/calculadora-prestamo/', label: 'Préstamo' },
      { href: '/calculadora-interes-compuesto/', label: 'Interés Compuesto' },
      { href: '/calculadora-plan-ahorro/', label: 'Plan de Ahorro' },
      { href: '/calculadora-inflacion/', label: 'Inflación' },
    ],
  },
];

const headerMenuEn: MenuGroup[] = [
  {
    label: 'Salary & Employment',
    items: [
      { href: '/en/', label: 'Net Salary' },
      { href: '/en/irpf-calculator/', label: 'Income Tax (IRPF)' },
      { href: '/en/gross-salary-calculator/', label: 'Gross Salary' },
      { href: '/en/regional-comparison/', label: 'Regional Comparison' },
      { href: '/en/self-employed-calculator/', label: 'Self-Employed' },
      { href: '/en/beckham-law-calculator/', label: 'Beckham Law' },
      { href: '/en/withholding-rate-calculator/', label: 'Withholding Rate' },
      { href: '/en/extra-pay-calculator/', label: 'Extra Pay' },
      { href: '/en/hourly-wage-calculator/', label: 'Hourly Wage' },
      { href: '/en/severance-calculator/', label: 'Severance Pay' },
      { href: '/en/unemployment-calculator/', label: 'Unemployment' },
    ],
  },
  {
    label: 'Taxes',
    items: [
      { href: '/en/vat-calculator/', label: 'VAT' },
      { href: '/en/inheritance-tax-calculator/', label: 'Inheritance Tax' },
      { href: '/en/property-sale-calculator/', label: 'Property Sale' },
      { href: '/en/capital-gains-tax-calculator/', label: 'Capital Gains Tax' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { href: '/en/mortgage-calculator/', label: 'Mortgage' },
      { href: '/en/retirement-calculator/', label: 'Retirement' },
      { href: '/en/loan-calculator/', label: 'Loan' },
      { href: '/en/compound-interest-calculator/', label: 'Compound Interest' },
      { href: '/en/savings-plan-calculator/', label: 'Savings Plan' },
      { href: '/en/inflation-calculator/', label: 'Inflation' },
    ],
  },
];

// ─── Footer sections ──────────────────────────────────────────

const footerSectionsEs: FooterSection[] = [
  {
    heading: 'Calculadoras Sueldo',
    items: [
      { href: '/', label: 'Sueldo Neto' },
      { href: '/calculadora-irpf/', label: 'IRPF' },
      { href: '/calculadora-salario-bruto/', label: 'Salario Bruto' },
      { href: '/comparador-comunidades/', label: 'Comparador CCAA' },
      { href: '/calculadora-autonomos/', label: 'Autónomos' },
      { href: '/regimen-beckham-calculadora/', label: 'Régimen Beckham' },
      { href: '/calculadora-tipo-retencion/', label: 'Tipo de Retención' },
      { href: '/calculadora-finiquito/', label: 'Finiquito' },
      { href: '/calculadora-paro/', label: 'Paro' },
      { href: '/calculadora-hora-trabajada/', label: 'Hora Trabajada' },
      { href: '/calculadora-pagas-extra/', label: 'Pagas Extra' },
    ],
  },
  {
    heading: 'Calculadoras Financieras',
    items: [
      { href: '/calculadora-prestamo/', label: 'Préstamo' },
      { href: '/calculadora-interes-compuesto/', label: 'Interés Compuesto' },
      { href: '/calculadora-plan-ahorro/', label: 'Plan de Ahorro' },
      { href: '/calculadora-inflacion/', label: 'Inflación' },
      { href: '/calculadora-hipoteca/', label: 'Hipoteca' },
      { href: '/calculadora-herencia/', label: 'Herencia' },
      { href: '/calculadora-jubilacion/', label: 'Jubilación' },
      { href: '/calculadora-iva/', label: 'IVA' },
      { href: '/calculadora-venta-vivienda/', label: 'Venta Vivienda' },
      { href: '/calculadora-plusvalia-municipal/', label: 'Plusvalía Municipal' },
    ],
  },
  {
    heading: 'Legal',
    items: [
      { href: '/aviso-legal/', label: 'Aviso Legal' },
      { href: '/politica-privacidad/', label: 'Política de Privacidad' },
      { href: '/politica-cookies/', label: 'Política de Cookies' },
      { href: '/terminos/', label: 'Términos de Uso' },
      { href: '/contacto/', label: 'Contacto' },
      { href: '/sobre-nosotros/', label: 'Sobre Nosotros' },
    ],
  },
];

const footerSectionsEn: FooterSection[] = [
  {
    heading: 'Salary Calculators',
    items: [
      { href: '/en/', label: 'Net Salary' },
      { href: '/en/irpf-calculator/', label: 'Income Tax (IRPF)' },
      { href: '/en/gross-salary-calculator/', label: 'Gross Salary' },
      { href: '/en/regional-comparison/', label: 'Regional Comparison' },
      { href: '/en/self-employed-calculator/', label: 'Self-Employed' },
      { href: '/en/beckham-law-calculator/', label: 'Beckham Law' },
      { href: '/en/withholding-rate-calculator/', label: 'Withholding Rate' },
      { href: '/en/severance-calculator/', label: 'Severance Pay' },
      { href: '/en/unemployment-calculator/', label: 'Unemployment' },
      { href: '/en/hourly-wage-calculator/', label: 'Hourly Wage' },
      { href: '/en/extra-pay-calculator/', label: 'Extra Pay' },
    ],
  },
  {
    heading: 'Financial Calculators',
    items: [
      { href: '/en/loan-calculator/', label: 'Loan' },
      { href: '/en/compound-interest-calculator/', label: 'Compound Interest' },
      { href: '/en/savings-plan-calculator/', label: 'Savings Plan' },
      { href: '/en/inflation-calculator/', label: 'Inflation' },
      { href: '/en/mortgage-calculator/', label: 'Mortgage' },
      { href: '/en/inheritance-tax-calculator/', label: 'Inheritance Tax' },
      { href: '/en/retirement-calculator/', label: 'Retirement' },
      { href: '/en/vat-calculator/', label: 'VAT' },
      { href: '/en/property-sale-calculator/', label: 'Property Sale' },
      { href: '/en/capital-gains-tax-calculator/', label: 'Capital Gains Tax' },
    ],
  },
  {
    heading: 'Legal',
    items: [
      { href: '/en/legal-notice/', label: 'Legal Notice' },
      { href: '/en/privacy-policy/', label: 'Privacy Policy' },
      { href: '/en/cookie-policy/', label: 'Cookie Policy' },
      { href: '/en/terms/', label: 'Terms of Use' },
      { href: '/en/contact/', label: 'Contact' },
      { href: '/en/about/', label: 'About Us' },
    ],
  },
];

// ─── Shared UI strings ────────────────────────────────────────

const uiStrings = {
  es: {
    // Header
    guidesLink: 'Guías',
    guidesHref: '/guias/',
    homeHref: '/',
    brandLeft: 'El Sueldo',
    brandRight: 'Neto',
    menuLabel: 'Navegación principal',
    mobileMenuLabel: 'Navegación móvil',
    openMenu: 'Abrir menú',

    // Footer
    footerDescription: 'Calculadora de sueldo neto actualizada para el ejercicio fiscal',
    footerDisclaimer: 'Los cálculos son orientativos y no constituyen asesoramiento fiscal. Consulta con un profesional para tu situación particular.',

    // CalculadoraLayout
    faqTitle: 'Preguntas frecuentes',
    sourcesLabel: 'Fuentes:',
    updatedForFiscalYear: 'Actualizado para el ejercicio fiscal',
    lastUpdate: 'Última actualización:',
    breadcrumbHome: 'Inicio',
  },
  en: {
    // Header
    guidesLink: 'Guides',
    guidesHref: '/en/guides/',
    homeHref: '/en/',
    brandLeft: 'El Sueldo',
    brandRight: 'Neto',
    menuLabel: 'Main navigation',
    mobileMenuLabel: 'Mobile navigation',
    openMenu: 'Open menu',

    // Footer
    footerDescription: 'Net salary calculator updated for the fiscal year',
    footerDisclaimer: 'Calculations are indicative and do not constitute tax advice. Consult a professional for your specific situation.',

    // CalculadoraLayout
    faqTitle: 'Frequently asked questions',
    sourcesLabel: 'Sources:',
    updatedForFiscalYear: 'Updated for fiscal year',
    lastUpdate: 'Last updated:',
    breadcrumbHome: 'Home',
  },
} as const;

// ─── Public API ───────────────────────────────────────────────

export function getMenuGroups(locale: Locale): MenuGroup[] {
  return locale === 'en' ? headerMenuEn : headerMenuEs;
}

export function getFooterSections(locale: Locale): FooterSection[] {
  return locale === 'en' ? footerSectionsEn : footerSectionsEs;
}

export function t(locale: Locale, key: keyof typeof uiStrings.es): string {
  return uiStrings[locale][key];
}
