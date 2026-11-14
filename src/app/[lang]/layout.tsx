import React from 'react';
import type { Metadata } from 'next';
import { getPublicHorses, getSiteSettings } from '@/lib/db';
import { getDictionary, normalizeLocale } from '@/lib/i18n';
import { GalleryProvider } from '@/context/GalleryContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { GlobalOverlays } from '@/components/layout/GlobalOverlays';
import { LocalBusinessSchema } from '@/components/seo/StructuredData';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = normalizeLocale(rawLang);
  const dict = getDictionary(lang);

  return {
    title: dict.seo.title,
    description: dict.seo.description,
    alternates: {
      canonical: `https://cuadraimperialloy.com/${lang}`,
      languages: {
        'es-MX': 'https://cuadraimperialloy.com/es',
        en: 'https://cuadraimperialloy.com/en',
      },
    },
    openGraph: {
      title: dict.seo.ogTitle,
      description: dict.seo.ogDescription,
      type: 'website',
      locale: lang === 'es' ? 'es_MX' : 'en_US',
    },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = normalizeLocale(rawLang);
  const horses = getPublicHorses();
  const settings = getSiteSettings();

  return (
    <GalleryProvider lang={lang} horses={horses} settings={settings}>
      <LocalBusinessSchema lang={lang} />
      <Header />
      <main>{children}</main>
      <Footer />
      <GlobalOverlays />
    </GalleryProvider>
  );
}

