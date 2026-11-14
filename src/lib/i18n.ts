import esMX from '@/locales/es-MX.json';
import en from '@/locales/en.json';
import type { Locale } from '@/types';

export type Dictionary = typeof esMX;

const dictionaries: Record<Locale, Dictionary> = {
  es: esMX,
  en: en,
};

export function getDictionary(lang: string): Dictionary {
  const safeLang: Locale = lang === 'en' ? 'en' : 'es';
  return dictionaries[safeLang];
}

export function normalizeLocale(lang?: string): Locale {
  if (!lang) return 'es';
  return lang.toLowerCase().startsWith('en') ? 'en' : 'es';
}

