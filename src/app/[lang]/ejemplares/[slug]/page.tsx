import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPublicHorseBySlug } from '@/lib/db';
import { normalizeLocale } from '@/lib/i18n';
import { HorseDetailView } from '@/components/home/HorseDetailView';
import { ProductHorseSchema } from '@/components/seo/StructuredData';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang: rawLang, slug } = await params;
  const lang = normalizeLocale(rawLang);
  const horse = getPublicHorseBySlug(slug);
  if (!horse) return {};

  const title =
    lang === 'es'
      ? `${horse.name} · Frisón KFPS | Cuadra Imperial Loy`
      : `${horse.name} · KFPS Friesian | Cuadra Imperial Loy`;
  const description =
    lang === 'es' ? horse.descriptionEs : horse.descriptionEn;

  return {
    title,
    description,
    alternates: {
      languages: {
        'es-MX': `https://cuadraimperialloy.com/es/ejemplares/${horse.slug}`,
        en: `https://cuadraimperialloy.com/en/ejemplares/${horse.slug}`,
      },
    },
  };
}

export default async function HorseDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang: rawLang, slug } = await params;
  const lang = normalizeLocale(rawLang);
  const horse = getPublicHorseBySlug(slug);

  if (!horse) {
    notFound();
  }

  return (
    <>
      <ProductHorseSchema horse={horse} lang={lang} />
      <HorseDetailView horse={horse} />
    </>
  );
}

