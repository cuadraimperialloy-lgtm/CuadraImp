import React from 'react';
import { getDictionary, normalizeLocale } from '@/lib/i18n';
import { FaqView } from '@/components/pages/SecondaryViews';
import { FaqPageSchema } from '@/components/seo/StructuredData';

export default async function FaqPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = normalizeLocale(rawLang);
  const dict = getDictionary(lang);

  return (
    <>
      <FaqPageSchema items={dict.faqPage.items} />
      <FaqView />
    </>
  );
}

