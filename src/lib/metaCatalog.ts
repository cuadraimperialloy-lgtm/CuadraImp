import { readDatabase } from '@/lib/db';
import { calculateHorseAge, formatHorseStatus } from '@/lib/utils';
import type { AdminHorse } from '@/types';

const SITE_URL = 'https://www.cuadraimperialloy.com';

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateMetaCatalogXml(): string {
  const db = readDatabase();
  // Filter only public/active horses (available, en_route, reserved, sold)
  const horses = db.horses.filter(
    (h) => h.published && h.status !== 'draft' && h.status !== 'archived'
  );

  const itemsXml = horses
    .map((horse: AdminHorse) => {
      const ageStr = calculateHorseAge(horse.birthDate, 'es') || '';
      const statusLabel = formatHorseStatus(horse.status, 'es');
      
      // Availability mapping according to Meta Commerce specification
      const availability =
        horse.status === 'available' || horse.status === 'en_route'
          ? 'in stock'
          : 'out of stock';

      // Base price 1.00 MXN for "Precio a consultar / Contáctanos"
      const priceFormatted = '1.00 MXN';

      // Pedigree concatenation (Padre × Madre y Abuelo)
      const parentsConcat = horse.sire && horse.dam
        ? `${horse.sire} × ${horse.dam}`
        : horse.sire
          ? `Padre: ${horse.sire}`
          : '';

      const pedigreeDetails = [
        parentsConcat ? `Línea: ${parentsConcat}` : '',
        horse.damsire ? `Abuelo Materno: ${horse.damsire}` : '',
      ]
        .filter(Boolean)
        .join(' · ');

      const fullDescription = [
        `Contáctanos y consulta su precio.`,
        horse.descriptionEs || `Ejemplar Frisón KFPS europeo de alta conformación racial y papeles en regla.`,
        pedigreeDetails ? `${pedigreeDetails}.` : '',
        ageStr ? `Edad: ${ageStr}.` : '',
        horse.heightM ? `Alzada: ${horse.heightM} m.` : '',
        `Ubicación: Zapotlanejo y La Barca, Jalisco (Cuadra Imperial Loy).`,
        `Estado: ${statusLabel}.`,
        `Visitas únicamente con previa cita a puerta cerrada.`,
      ]
        .filter(Boolean)
        .join(' ');

      // Image URLs (absolute)
      const coverPhotoUrl = horse.coverPhoto.startsWith('http')
        ? horse.coverPhoto
        : `${SITE_URL}${encodeURI(horse.coverPhoto)}`;

      const additionalImages = (horse.gallery || [])
        .map((img) => img.url)
        .filter((url) => url && url !== horse.coverPhoto)
        .slice(0, 10)
        .map((url) => {
          const abs = url.startsWith('http') ? url : `${SITE_URL}${encodeURI(url)}`;
          return `      <g:additional_image_link>${escapeXml(abs)}</g:additional_image_link>`;
        })
        .join('\n');

      const horseUrl = `${SITE_URL}/es/caballos/${encodeURIComponent(horse.slug)}`;
      const horseTitle = `${horse.name} · Frisón KFPS [${horse.code}]`;
      const productType =
        horse.type === 'stud'
          ? 'Caballos Frisones > Semental de Maquila'
          : 'Caballos Frisones > Ejemplares en Venta';

      return `    <item>
      <g:id>${escapeXml(horse.code || horse.id)}</g:id>
      <g:title><![CDATA[${horseTitle}]]></g:title>
      <g:description><![CDATA[${fullDescription}]]></g:description>
      <g:link>${escapeXml(horseUrl)}</g:link>
      <g:image_link>${escapeXml(coverPhotoUrl)}</g:image_link>
${additionalImages ? `${additionalImages}\n` : ''}      <g:brand>Cuadra Imperial Loy</g:brand>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${priceFormatted}</g:price>
      <g:product_type><![CDATA[${productType}]]></g:product_type>
      <g:custom_label_0>${escapeXml(horse.status)}</g:custom_label_0>
      <g:custom_label_1>${escapeXml(horse.origin || 'Holanda')}</g:custom_label_1>
      <g:custom_label_2><![CDATA[${horse.sire || ''}]]></g:custom_label_2>
      <g:custom_label_3>Zapotlanejo y La Barca, Jalisco</g:custom_label_3>
      <g:custom_label_4><![CDATA[${statusLabel}]]></g:custom_label_4>
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Cuadra Imperial Loy · Catálogo de Ejemplares Frisones KFPS</title>
    <link>${SITE_URL}</link>
    <description>Catálogo oficial y sincronización de ejemplares Frisones KFPS en Cuadra Imperial Loy (Zapotlanejo y La Barca, Jalisco).</description>
${itemsXml}
  </channel>
</rss>`;
}
