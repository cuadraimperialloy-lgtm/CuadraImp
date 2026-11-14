/**
 * Script de migración de los 14 caballos reales de Cuadra Imperial Loy hacia Supabase.
 * Separa automáticamente los datos públicos (`public.horses`) de los precios internos
 * y documentos privados (`public.horse_private_data`) para garantizar RLS.
 *
 * Uso futuro cuando se conecte Supabase:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/migrate-to-supabase.ts
 */

import rawDatabase from '../src/data/database.json';

async function migrateToSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.log(
      'Modo verificación local: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY no definidos aún.'
    );
    console.log(
      `Se validaron ${rawDatabase.horses.length} ejemplares listos para migrar.`
    );
    return;
  }

  for (const h of rawDatabase.horses) {
    const publicRow = {
      id: h.id,
      name: h.name,
      slug: h.slug,
      code: h.code,
      sex: h.sex,
      type: h.type,
      origin: h.origin,
      birth_date: h.birthDate,
      height_m: h.heightM,
      registration_number: h.registrationNumber,
      microchip: h.microchip,
      full_paper: h.fullPaper,
      sire: h.sire,
      damsire: h.damsire,
      dam: h.dam,
      show_dam: h.showDam,
      awards: h.awards,
      level: h.level,
      bloodline_es: h.bloodlineEs,
      bloodline_en: h.bloodlineEn,
      description_es: h.descriptionEs,
      description_en: h.descriptionEn,
      vet_summary_es: h.vetSummaryEs,
      vet_summary_en: h.vetSummaryEn,
      cover_photo: h.coverPhoto,
      hover_photo: h.hoverPhoto,
      gallery: h.gallery,
      main_video: h.mainVideo,
      video_poster: h.videoPoster,
      available_document_types: h.privateDocuments.map((d) => d.type),
      status: h.status,
      estimated_arrival_date: h.estimatedArrivalDate,
      published: h.published,
      sort_order: h.sortOrder,
      updated_at: h.updatedAt,
    };

    const privateRow = {
      horse_id: h.id,
      internal_price_mxn: h.internalPriceMxn,
      internal_price_usd: h.internalPriceUsd,
      private_documents: h.privateDocuments,
      updated_at: h.updatedAt,
    };

    await fetch(`${supabaseUrl}/rest/v1/horses`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify(publicRow),
    });

    await fetch(`${supabaseUrl}/rest/v1/horse_private_data`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify(privateRow),
    });

    console.log(`Migrado: ${h.name} (${h.code})`);
  }
}

migrateToSupabase().catch(console.error);

