import { SITE_URL, SITE_NAME, CURRENT_FISCAL_YEAR } from '../config';
import { LANG_MAP, type Locale } from '../i18n';

export interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  noindex?: boolean;
}

export function buildCanonical(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const withTrailingSlash = cleanPath.endsWith('/') ? cleanPath : `${cleanPath}/`;
  return `${SITE_URL}${withTrailingSlash}`;
}

export function validateTitle(title: string): boolean {
  return title.length >= 50 && title.length <= 60;
}

export function validateDescription(description: string): boolean {
  return description.length >= 150 && description.length <= 160;
}

export function buildWebApplicationSchema(name: string, url: string, locale: Locale = 'es') {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    url: buildCanonical(url),
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    inLanguage: LANG_MAP[locale],
    availableLanguage: ['es-ES', 'en-GB'],
  };
}

export interface FAQItem {
  question: string;
  answer: string;
}

export function buildFAQSchema(items: FAQItem[], locale: Locale = 'es') {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
    inLanguage: LANG_MAP[locale],
  };
}

export function buildBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: buildCanonical(item.url),
    })),
  };
}

export function buildOrganizationSchema(locale: Locale = 'es') {
  const isEn = locale === 'en';
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon-512.png`,
    description: isEn
      ? `Free tax and financial calculators for Spain, updated for fiscal year ${CURRENT_FISCAL_YEAR}.`
      : `Calculadoras fiscales y financieras gratuitas para España, actualizadas para el ejercicio fiscal ${CURRENT_FISCAL_YEAR}.`,
    foundingDate: '2025',
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'contacto@elsueldoneto.es',
      contactType: 'customer service',
      availableLanguage: ['Spanish', 'English'],
    },
  };
}

export interface PersonSchemaProps {
  name: string;
  jobTitle: string;
  description: string;
  alumniOf?: { name: string; url?: string }[];
  knowsAbout?: string[];
  url?: string;
}

export function buildPersonSchema(props: PersonSchemaProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: props.name,
    jobTitle: props.jobTitle,
    description: props.description,
    url: props.url || `${SITE_URL}/sobre-nosotros/`,
    worksFor: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    ...(props.alumniOf && {
      alumniOf: props.alumniOf.map((a) => ({
        '@type': 'EducationalOrganization',
        name: a.name,
        ...(a.url && { url: a.url }),
      })),
    }),
    ...(props.knowsAbout && { knowsAbout: props.knowsAbout }),
  };
}

export function buildWebSiteSchema(locale: Locale = 'es') {
  const isEn = locale === 'en';
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: LANG_MAP[locale],
    description: isEn
      ? `Net salary, income tax, mortgage and more calculators for Spain ${CURRENT_FISCAL_YEAR}.`
      : `Calculadoras de sueldo neto, IRPF, hipoteca y más para España ${CURRENT_FISCAL_YEAR}.`,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    availableLanguage: ['es-ES', 'en-GB'],
  };
}
