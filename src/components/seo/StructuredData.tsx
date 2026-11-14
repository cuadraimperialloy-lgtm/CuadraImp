import React from 'react';
import type { Locale, PublicHorse } from '@/types';

export function LocalBusinessSchema({ lang }: { lang: Locale }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'LocalBusiness'],
    name: 'Cuadra Imperial Loy',
    description:
      lang === 'es'
        ? 'Frisones importados de Holanda, escogidos uno por uno y registrados en la KFPS. Citas privadas en Zapotlanejo, Jalisco.'
        : 'Friesian horses imported from the Netherlands, hand-selected and registered with the KFPS. Private visits in Zapotlanejo, Jalisco.',
    url: 'https://cuadraimperialloy.com',
    telephone: '+523317026066',
    email: 'info@cuadraimperialloy.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Zapotlanejo',
      addressRegion: 'Jalisco',
      addressCountry: 'MX',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '17:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '09:00',
        closes: '13:00',
      },
    ],
    sameAs: [
      'https://www.instagram.com/cuadraimperialloy',
      'https://www.tiktok.com/@cuadraimperialloy',
      'https://www.facebook.com/CuadraImperialLoy',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ProductHorseSchema({
  horse,
  lang,
}: {
  horse: PublicHorse;
  lang: Locale;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: horse.name,
    sku: horse.code,
    brand: {
      '@type': 'Brand',
      name: 'Cuadra Imperial Loy · KFPS',
    },
    description:
      lang === 'es' ? horse.descriptionEs : horse.descriptionEn,
    image: `https://cuadraimperialloy.com${encodeURI(horse.coverPhoto)}`,
    category:
      lang === 'es' ? 'Caballos Frisones KFPS' : 'KFPS Friesian Horses',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FaqPageSchema({
  items,
}: {
  items: Array<{ q: string; a: string }>;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

