import type { MetadataRoute } from 'next';
import { getPublicHorses } from '@/lib/db';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://cuadraimperialloy.com';
  const horses = getPublicHorses();
  const routes = [
    '',
    '/ejemplares',
    '/cuadra-y-sementales',
    '/la-cuadra',
    '/garantia',
    '/cita-privada',
    '/preguntas',
    '/contacto',
    '/privacidad',
    '/terminos',
  ];

  const entries: MetadataRoute.Sitemap = [];
  for (const lang of ['es', 'en']) {
    for (const r of routes) {
      entries.push({
        url: `${baseUrl}/${lang}${r}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: r === '' ? 1.0 : 0.8,
      });
    }
    for (const horse of horses) {
      entries.push({
        url: `${baseUrl}/${lang}/ejemplares/${horse.slug}`,
        lastModified: new Date(horse.updatedAt),
        changeFrequency: 'daily',
        priority: 0.9,
      });
    }
  }
  return entries;
}

