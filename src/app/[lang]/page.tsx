import React from 'react';
import { getDictionary, normalizeLocale } from '@/lib/i18n';
import { HomeView } from '@/components/home/HomeView';
import { FaqPageSchema } from '@/components/seo/StructuredData';

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = normalizeLocale(rawLang);
  const dict = getDictionary(lang);

  return (
    <>
      <FaqPageSchema items={dict.faqPage.items.slice(0, 4)} />
      <HomeView />
    </>
  );
}

