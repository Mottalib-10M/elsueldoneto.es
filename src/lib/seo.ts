import { SITE_URL, SITE_LANG, CURRENT_FISCAL_YEAR } from '../config';

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

export interface SchemaWebApplication {
  '@context': 'https://schema.org';
  '@type': 'WebApplication';
  name: string;
  url: string;
  applicationCategory: string;
  operatingSystem: string;
  offers: {
    '@type': 'Offer';
    price: '0';
    priceCurrency: 'EUR';
  };
  inLanguage: typeof SITE_LANG;
}

export function buildWebApplicationSchema(name: string, url: string): SchemaWebApplication {
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
    inLanguage: SITE_LANG,
  };
}

export interface FAQItem {
  question: string;
  answer: string;
}

export function buildFAQSchema(items: FAQItem[]) {
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
    inLanguage: SITE_LANG,
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
