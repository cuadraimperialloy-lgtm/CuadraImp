'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bookmark,
  ExternalLink,
  FileText,
  Play,
  ShieldCheck,
  X,
} from 'lucide-react';
import type { PublicHorse } from '@/types';
import { useGallery } from '@/context/GalleryContext';
import {
  calculateHorseAge,
  formatDomaLevel,
  formatHorseSex,
  formatHorseStatus,
  formatMaskedMicrochip,
} from '@/lib/utils';
import {
  AccordionItem,
  DynamicScheduleMicrocopy,
  PrimaryButton,
  SecondaryButton,
  WhatsAppIcon,
} from '@/components/ui/Primitives';
import { Reveal } from '@/components/ui/MotionPrimitives';

export function HorseDetailView({ horse }: { horse: PublicHorse }) {
  const {
    lang,
    dict,
    settings,
    isSelected,
    toggleSelection,
    openDossierDrawer,
    triggerWhatsApp,
  } = useGallery();

  const [showDossierBar, setShowDossierBar] = useState(false);
  const [dossierBarDismissed, setDossierBarDismissed] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [activeDocModal, setActiveDocModal] = useState<
    'pedigree' | 'tech_sheet' | null
  >(null);

  // Trigger non-modal dossier bar once at 60% scroll (Section 7.4)
  useEffect(() => {
    if (horse.status === 'sold' || dossierBarDismissed) return;
    let shownOnce = false;
    const handleScroll = () => {
      if (shownOnce) return;
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 200 && scrollTop / docHeight >= 0.6) {
        shownOnce = true;
        setShowDossierBar(true);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [horse.status, dossierBarDismissed]);

  const saved = isSelected(horse.slug);
  const ageText = calculateHorseAge(horse.birthDate, lang);
  const levelText = formatDomaLevel(horse.level, lang);
  const sexText = formatHorseSex(horse.sex, lang);
  const isSold = horse.status === 'sold';
  const isStud = horse.type === 'stud';

  const statusText = isStud
    ? lang === 'es'
      ? 'Semental cuadra'
      : 'Stable Stallion'
    : horse.status === 'en_route'
      ? lang === 'es'
        ? 'Disponible · En tránsito'
        : 'Available · In transit'
      : formatHorseStatus(horse.status, lang);

  const nationalityLabel =
    horse.origin === 'Holanda'
      ? lang === 'es'
        ? 'HOLANDA (EUROPEO)'
        : 'NETHERLANDS (EUROPEAN)'
      : lang === 'es'
        ? 'MÉXICO (NACIONAL)'
        : 'MEXICO (NATIONAL)';

  const cedisLabel =
    horse.status === 'en_route'
      ? lang === 'es'
        ? 'En tránsito (Europa → México)'
        : 'In transit (Europe → Mexico)'
      : lang === 'es'
        ? 'Zapotlanejo, Jalisco'
        : 'Zapotlanejo, Jalisco';

  const fullPaperLabel =
    horse.fullPaper === true
      ? lang === 'es'
        ? 'Full Paper (Sí)'
        : 'Full Paper (Yes)'
      : horse.fullPaper === false
        ? lang === 'es'
          ? 'Registro KFPS (No Full Paper)'
          : 'KFPS Registry (Non-Full Paper)'
        : lang === 'es'
          ? 'N/A (Nacional)'
          : 'N/A (National)';

  const bloodlineText = lang === 'es' ? horse.bloodlineEs : horse.bloodlineEn;
  const descriptionText =
    lang === 'es' ? horse.descriptionEs : horse.descriptionEn;
  const vetSummaryText =
    lang === 'es' ? horse.vetSummaryEs : horse.vetSummaryEn;

  // 6 Main Characteristic Cards strictly from the official spreadsheet (no assumptions)
  const mainCharacteristicCards = [
    {
      label: lang === 'es' ? 'Raza' : 'Breed',
      value: lang === 'es' ? 'Frisón / Frisian' : 'Friesian (KFPS)',
    },
    {
      label: lang === 'es' ? 'Edad' : 'Age',
      value: ageText || '—',
    },
    {
      label: lang === 'es' ? 'Sexo' : 'Sex',
      value:
        sexText || (lang === 'es' ? 'Macho entero' : 'Stallion'),
    },
    ...(horse.heightM
      ? [
        {
          label: lang === 'es' ? 'Alzada (m)' : 'Height (m)',
          value: `${horse.heightM.toFixed(2)} m`,
        },
      ]
      : []),
    {
      label: lang === 'es' ? 'Nacionalidad · CEDIS' : 'Origin · Location',
      value:
        horse.origin === 'Holanda'
          ? horse.status === 'en_route'
            ? lang === 'es'
              ? 'Europeo · En tránsito'
              : 'European · In transit'
            : lang === 'es'
              ? 'Europeo · Zapotlanejo'
              : 'European · Zapotlanejo'
          : lang === 'es'
            ? 'Nacional · Zapotlanejo'
            : 'National · Zapotlanejo',
    },
    {
      label: lang === 'es' ? 'Full Paper' : 'Full Paper',
      value:
        horse.fullPaper === true
          ? lang === 'es'
            ? 'Sí'
            : 'Yes'
          : horse.fullPaper === false
            ? 'No'
            : 'N/A',
    },
    ...(horse.awards && horse.awards.length > 0
      ? [
        {
          label:
            lang === 'es' ? 'Premio / Título propio' : 'Predicate / Award',
          value: horse.awards.join(' · '),
        },
      ]
      : []),
  ];

  // Genealogy & Registry Table Rows strictly from the official spreadsheet (only rows with data)
  const genealogyTableRows: Array<{ field: string; info: string }> = [
    ...(horse.registrationNumber
      ? [
        {
          field: lang === 'es' ? 'Registro KFPS' : 'KFPS Registration',
          info: horse.registrationNumber,
        },
      ]
      : []),
    {
      field: lang === 'es' ? 'Full Paper' : 'Full Paper',
      info: fullPaperLabel,
    },
    ...(horse.awards && horse.awards.length > 0
      ? [
        {
          field:
            lang === 'es' ? 'Premio / Título propio' : 'Predicate / Award',
          info: horse.awards.join(' · '),
        },
      ]
      : []),
    ...(horse.sire
      ? [
        {
          field: lang === 'es' ? 'Padre' : 'Sire',
          info: horse.sire,
        },
      ]
      : []),
    ...(horse.dam
      ? [
        {
          field: lang === 'es' ? 'Madre' : 'Dam',
          info: horse.dam,
        },
      ]
      : []),
    ...(horse.damsire
      ? [
        {
          field:
            lang === 'es'
              ? 'Abuelo directo destacado'
              : 'Featured Maternal Grandsire',
          info: horse.damsire,
        },
      ]
      : []),
    ...(horse.microchip
      ? [
        {
          field:
            lang === 'es'
              ? 'Chip (últimos 4 dígitos)'
              : 'Chip (last 4 digits)',
          info: `${formatMaskedMicrochip(horse.microchip)} (${lang === 'es'
              ? 'solo últimos 4 dígitos visibles'
              : 'only last 4 digits visible'
            })`,
        },
      ]
      : []),
    ...(horse.birthDate
      ? [
        {
          field: lang === 'es' ? 'Fecha de nacimiento' : 'Date of birth',
          info: horse.birthDate,
        },
      ]
      : []),
    {
      field: lang === 'es' ? 'CEDIS / Ubicación' : 'Location / CEDIS',
      info: cedisLabel,
    },
  ];

  return (
    <div className="bg-niebla text-tinta pt-24 pb-28 lg:pb-24">
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Breadcrumb + Save Bar */}
        <nav
          aria-label="Breadcrumb"
          className="mb-5 flex items-center justify-between text-[12px] uppercase tracking-[0.18em] text-tinta-diluida"
        >
          <div className="flex items-center gap-2">
            <Link
              href={
                isStud
                  ? `/${lang}/cuadra-y-sementales`
                  : `/${lang}/ejemplares`
              }
              className="hover:text-tinta transition-colors"
            >
              ← {isStud ? dict.nav.stallions : dict.horseDetail.breadcrumbRoot}
            </Link>
            <span>/</span>
            <span className="text-tinta font-medium">{horse.name}</span>
          </div>

          <button
            type="button"
            onClick={() => toggleSelection(horse)}
            className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.18em] text-tinta-diluida hover:text-tinta"
          >
            <Bookmark
              className="w-3.5 h-3.5 stroke-[1.5]"
              fill={saved ? 'currentColor' : 'none'}
            />
            <span>{saved ? dict.system.saved : dict.system.save}</span>
          </button>
        </nav>

        {/* =================================================================
            1. TOP EQUINE COLLECTION BRAND HEADER CARD (Green Pólder + Golden Crest)
            ================================================================= */}
        <Reveal>
          <div className="bg-polder text-niebla rounded-2xl py-8 px-6 text-center mb-6 flex flex-col items-center gap-2">
            <img
              src="/brand/Logotipo_Cuadra_Imperial_Loy_isotipo_degradado.svg"
              alt="Cuadra Imperial Loy Escudo Oficial"
              className="w-14 h-14 object-contain"
            />
            <h2 className="font-display-split font-bold text-[26px] sm:text-[32px] tracking-[0.14em] uppercase text-niebla leading-none mt-1">
              CUADRA IMPERIAL LOY
            </h2>
            <div className="w-10 h-[1px] bg-champagne my-0.5" />
            <p className="text-[11px] sm:text-[12px] uppercase tracking-[0.28em] text-champagne font-semibold">
              EQUINE COLLECTION · KFPS ROYAL FRIESIAN
            </p>
          </div>
        </Reveal>

        {/* =================================================================
            2. MAIN HERO PHOTO CARD (4:3 Uncropped + Subtle Brand Pill + Sold Stamp)
            ================================================================= */}
        <Reveal delay={0.05}>
          <div
            onClick={() => setLightboxUrl(horse.coverPhoto)}
            className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-arena cursor-zoom-in mb-7"
          >
            <img
              src={encodeURI(horse.coverPhoto)}
              alt={horse.name}
              loading="eager"
              className="w-full h-full object-contain bg-arena transition-transform duration-700 hover:scale-[1.015]"
            />
            {isSold && (
              <div className="pointer-events-none absolute inset-0 bg-tinta/25 flex items-center justify-center z-10">
                <div className="-rotate-12 px-8 py-3.5 rounded-xl bg-[#9E2A2B]/95 text-niebla border-2 border-[#C6B28A] shadow-2xl backdrop-blur-sm">
                  <span className="block font-display-split font-bold text-[30px] sm:text-[42px] tracking-[0.22em] uppercase leading-none text-center">
                    ★ {lang === 'es' ? 'VENDIDO' : 'SOLD'} ★
                  </span>
                </div>
              </div>
            )}
            <div className="absolute bottom-4 left-4 px-3.5 py-1.5 rounded-full bg-tinta/75 backdrop-blur-sm text-niebla text-[12px] tracking-[0.04em] inline-flex items-center gap-2 z-10">
              <span className="w-2 h-2 rounded-full bg-champagne" />
              <span>cuadraimperialloy</span>
            </div>
          </div>
        </Reveal>

        {/* =================================================================
            3. HORSE NAME, STATUS BADGE & ID · BREED · COUNTRY SUBTITLE
            ================================================================= */}
        <Reveal delay={0.08}>
          <div className="pb-7 border-b border-linea">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="font-display-split font-bold text-[42px] sm:text-[56px] leading-[0.98] tracking-tight text-tinta uppercase">
                  {horse.name}
                </h1>
                <p className="mt-2.5 text-[13px] sm:text-[14px] uppercase tracking-[0.15em] text-bronce font-semibold tabular-specs">
                  {horse.registrationNumber
                    ? `${horse.registrationNumber}`
                    : `ID ${horse.code}`}{' '}
                  · FRISÓN KFPS · {nationalityLabel}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {(horse.fullPaper ||
                  (horse.awards && horse.awards.length > 0)) && (
                    <span className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-[#EFE9DC] text-[#756242] border border-[#D8CCB4] text-[12px] font-semibold">
                      {horse.awards && horse.awards.length > 0
                        ? `Full Paper · ${horse.awards[0]}`
                        : 'Full Paper · KFPS'}
                    </span>
                  )}
                <span
                  className={`inline-flex items-center px-4 py-1.5 rounded-full text-[13px] font-semibold tracking-[0.04em] ${isSold
                      ? 'bg-[#9E2A2B] text-niebla uppercase font-bold'
                      : 'bg-[#DCE8E0] text-[#1C2E24]'
                    }`}
                >
                  {statusText}
                </span>
              </div>
            </div>

            {/* Quick Action Bar at Top so buyer doesn't have to wait until bottom */}
            {!isSold && (
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <PrimaryButton
                  onClick={() =>
                    triggerWhatsApp({
                      intent: isStud ? 'stud' : 'horse',
                      horses: [
                        {
                          name: horse.name,
                          code: horse.code,
                          sire: horse.sire,
                        },
                      ],
                      ctaPosition: 'ficha_top_primary',
                    })
                  }
                >
                  {isStud
                    ? `${dict.horseDetail.studPrimaryCtaPrefix} ${horse.name}`
                    : lang === 'es'
                      ? `Solicitar información de ${horse.name}`
                      : `Request information on ${horse.name}`}
                </PrimaryButton>

                <SecondaryButton
                  isWhatsAppCta={true}
                  onClick={() =>
                    triggerWhatsApp({
                      intent: isStud ? 'stud' : 'visit',
                      horses: [
                        {
                          name: horse.name,
                          code: horse.code,
                          sire: horse.sire,
                        },
                      ],
                      ctaPosition: 'ficha_top_visit',
                    })
                  }
                >
                  {isStud
                    ? dict.horseDetail.studSecondaryCta
                    : `${dict.horseDetail.primaryCtaPrefix} ${horse.name}`}
                </SecondaryButton>
              </div>
            )}
          </div>
        </Reveal>

        {/* =================================================================
            4. PRESENTACIÓN (Commercial & Pedigree Narrative)
            ================================================================= */}
        <Reveal className="py-8 border-b border-linea">
          <h2 className="text-[22px] font-semibold text-tinta mb-3">
            {lang === 'es' ? 'Presentación' : 'Presentation'}
          </h2>
          <p className="text-[16px] sm:text-[17px] text-tinta leading-relaxed">
            {descriptionText}
          </p>
          {bloodlineText && (
            <p className="mt-3 text-[15px] sm:text-[16px] text-tinta-diluida leading-relaxed">
              {bloodlineText}
            </p>
          )}
        </Reveal>

        {/* =================================================================
            5. CARACTERÍSTICAS PRINCIPALES (2x3 Rounded Card Grid)
            ================================================================= */}
        <Reveal className="py-8 border-b border-linea">
          <h2 className="text-[22px] font-semibold text-tinta mb-5">
            {lang === 'es'
              ? 'Características principales'
              : 'Key Characteristics'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4">
            {mainCharacteristicCards.map((item) => (
              <div
                key={item.label}
                className="bg-arena rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-1.5"
              >
                <span className="text-[13px] text-tinta-diluida">
                  {item.label}
                </span>
                <strong className="text-[17px] sm:text-[19px] font-semibold text-tinta tabular-specs leading-snug">
                  {item.value}
                </strong>
              </div>
            ))}
          </div>
        </Reveal>

        {/* =================================================================
            6. GALERÍA DE FOTOGRAFÍAS (2x2 Rounded Grid, Uncropped)
            ================================================================= */}
        <Reveal className="py-8 border-b border-linea">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[22px] font-semibold text-tinta">
              {lang === 'es' ? 'Galería de fotografías' : 'Photo Gallery'}
            </h2>
            <span className="text-[12px] uppercase tracking-[0.18em] text-tinta-diluida tabular-specs">
              {horse.gallery.length}{' '}
              {horse.gallery.length === 1
                ? lang === 'es'
                  ? 'FOTOGRAFÍA'
                  : 'PHOTO'
                : lang === 'es'
                  ? 'FOTOGRAFÍAS'
                  : 'PHOTOS'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {horse.gallery.map((media, idx) => (
              <figure
                key={idx}
                onClick={() => setLightboxUrl(media.url)}
                className="group relative aspect-[4/3] rounded-[16px] overflow-hidden bg-arena border border-linea cursor-zoom-in"
              >
                <img
                  src={encodeURI(media.url)}
                  alt={lang === 'es' ? media.altEs : media.altEn}
                  loading={idx < 2 ? 'eager' : 'lazy'}
                  className="w-full h-full object-contain bg-arena transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <figcaption className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-tinta/70 text-niebla text-[11px] tabular-specs">
                  0{idx + 1} / 0{horse.gallery.length}
                </figcaption>
              </figure>
            ))}
          </div>
        </Reveal>

        {/* =================================================================
            7. GENEALOGÍA Y REGISTRO (Clean Table Campo | Información + Tree)
            ================================================================= */}
        <Reveal className="py-8 border-b border-linea">
          <h2 className="text-[22px] font-semibold text-tinta mb-5">
            {lang === 'es' ? 'Genealogía y registro' : 'Genealogy & Registry'}
          </h2>

          <div className="bg-arena/50 border border-linea rounded-[16px] overflow-hidden">
            <div className="grid grid-cols-12 px-5 py-3.5 bg-arena border-b border-linea text-[13px] font-semibold text-tinta">
              <div className="col-span-5">
                {lang === 'es' ? 'Campo' : 'Field'}
              </div>
              <div className="col-span-7">
                {lang === 'es' ? 'Información' : 'Information'}
              </div>
            </div>

            <div className="divide-y divide-linea">
              {genealogyTableRows.map((row) => (
                <div
                  key={row.field}
                  className="grid grid-cols-12 px-5 py-3.5 text-[15px] items-baseline gap-2"
                >
                  <div className="col-span-5 text-tinta-diluida">
                    {row.field}
                  </div>
                  <div className="col-span-7 text-tinta font-medium tabular-specs">
                    {row.info}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual 3-Node Pedigree Diagram when Sire/Dam/Damsire are present */}
          {(horse.sire || horse.dam || horse.damsire) && (
            <div className="mt-6 bg-arena/70 border border-linea rounded-[16px] p-5">
              <p className="text-[11px] uppercase tracking-[0.2em] text-tinta-diluida mb-4">
                {lang === 'es'
                  ? 'ÁRBOL GENEALÓGICO DIRECTO · KFPS'
                  : 'DIRECT PEDIGREE TREE · KFPS'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                <div className="bg-niebla border border-tinta p-4 rounded-[12px]">
                  <span className="block text-[10px] uppercase tracking-[0.2em] text-tinta-diluida">
                    {lang === 'es' ? 'EJEMPLAR' : 'HORSE'}
                  </span>
                  <strong className="font-display-split font-bold text-[26px] text-tinta leading-none">
                    {horse.name}
                  </strong>
                  {horse.registrationNumber && (
                    <span className="block text-[12px] text-tinta-diluida mt-1 tabular-specs">
                      Reg. {horse.registrationNumber}
                    </span>
                  )}
                </div>

                <div className="bg-niebla border border-linea p-4 rounded-[12px]">
                  <span className="block text-[10px] uppercase tracking-[0.2em] text-tinta-diluida">
                    {lang === 'es' ? 'PADRE (SIRE)' : 'SIRE'}
                  </span>
                  <strong className="text-[16px] font-semibold text-tinta block mt-0.5">
                    {horse.sire || '—'}
                  </strong>
                </div>

                <div className="bg-niebla border border-linea p-4 rounded-[12px] flex flex-col gap-2">
                  <div>
                    <span className="block text-[10px] uppercase tracking-[0.2em] text-tinta-diluida">
                      {lang === 'es' ? 'MADRE (DAM)' : 'DAM'}
                    </span>
                    <strong className="text-[15px] font-semibold text-tinta block">
                      {horse.dam || '—'}
                    </strong>
                  </div>
                  {horse.damsire && (
                    <div className="pt-2 border-t border-linea">
                      <span className="block text-[10px] uppercase tracking-[0.2em] text-tinta-diluida">
                        {lang === 'es'
                          ? 'ABUELO MATERNO (DAMSIRE)'
                          : 'DAMSIRE'}
                      </span>
                      <strong className="text-[14px] font-medium text-tinta block">
                        {horse.damsire}
                      </strong>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Reveal>

        {/* =================================================================
            8. VIDEOS (Original Arena Video from Dossier)
            ================================================================= */}
        {horse.mainVideo && (
          <Reveal className="py-8 border-b border-linea">
            <h2 className="text-[22px] font-semibold text-tinta mb-5">
              {lang === 'es' ? 'Videos' : 'Videos'}
            </h2>

            <div className="relative rounded-[18px] overflow-hidden bg-arena border border-linea aspect-[4/3]">
              <video
                src={encodeURI(horse.mainVideo)}
                poster={encodeURI(horse.videoPoster || horse.coverPhoto)}
                controls
                playsInline
                preload="metadata"
                className="w-full h-full object-contain bg-arena"
              />
              <div className="pointer-events-none absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-tinta/75 text-niebla text-[12px] inline-flex items-center gap-1.5">
                <Play className="w-3 h-3 fill-current" />
                <span>cuadraimperialloy</span>
              </div>
            </div>

            <p className="mt-3 text-[14px] text-tinta-diluida">
              {lang === 'es'
                ? 'Presentación en movimiento · Video original integrado desde el expediente.'
                : 'Presentation in motion · Original video integrated from the horse’s file.'}
            </p>
          </Reveal>
        )}

        {/* =================================================================
            9. DOCUMENTACIÓN (Registro Genealógico & Ficha Técnica Interactive Rows)
            ================================================================= */}
        <Reveal className="py-8 border-b border-linea">
          <h2 className="text-[22px] font-semibold text-tinta mb-5">
            {lang === 'es' ? 'Documentación' : 'Documentation'}
          </h2>

          <div className="flex flex-col gap-3.5">
            {/* Row 1: Registro genealógico (un solo botón limpio, sin repetir VER DOCUMENTO + PDF) */}
            <div
              onClick={() => setActiveDocModal('pedigree')}
              className="w-full p-4 sm:p-5 rounded-[14px] bg-arena/70 hover:bg-arena border border-linea flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4 text-left flex-1">
                <div className="w-11 h-11 rounded-[10px] bg-[#9E2A2B] text-niebla flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 stroke-[1.75]" />
                </div>
                <div>
                  <h3 className="text-[17px] font-semibold text-tinta">
                    {lang === 'es'
                      ? 'Registro genealógico'
                      : 'Genealogical Registry'}
                  </h3>
                  <p className="text-[14px] text-tinta-diluida">
                    {lang === 'es'
                      ? `Nombre del ejemplar y árbol genealógico KFPS${horse.registrationNumber ? ` (Reg. #${horse.registrationNumber})` : ''}`
                      : `Horse name and KFPS pedigree tree${horse.registrationNumber ? ` (Reg. #${horse.registrationNumber})` : ''}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center shrink-0">
                <span className="inline-flex items-center gap-2 px-4 py-2.5 bg-polder text-niebla text-[11px] font-semibold uppercase tracking-[0.16em] rounded-[8px] hover:opacity-90">
                  <span>
                    {lang === 'es' ? 'Ver registro' : 'View registry'}
                  </span>
                </span>
              </div>
            </div>

            {/* Row 2: Ficha técnica (un solo botón limpio, sin repetir VER FICHA + PDF) */}
            <div
              onClick={() => setActiveDocModal('tech_sheet')}
              className="w-full p-4 sm:p-5 rounded-[14px] bg-arena/70 hover:bg-arena border border-linea flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4 text-left flex-1">
                <div className="w-12 h-12 rounded-[10px] bg-niebla border border-linea overflow-hidden shrink-0">
                  <img
                    src={encodeURI(horse.coverPhoto)}
                    alt={horse.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-[17px] font-semibold text-tinta">
                    {horse.name} ·{' '}
                    {lang === 'es' ? 'Ficha técnica' : 'Technical Sheet'}
                  </h3>
                  <p className="text-[14px] text-tinta-diluida">
                    {lang === 'es'
                      ? 'Información completa del ejemplar, fotografía principal, características y genealogía'
                      : 'Complete horse information, main photograph, characteristics and pedigree'}
                  </p>
                </div>
              </div>

              <div className="flex items-center shrink-0">
                <span className="inline-flex items-center gap-2 px-4 py-2.5 bg-polder text-niebla text-[11px] font-semibold uppercase tracking-[0.16em] rounded-[8px] hover:opacity-90">
                  <span>
                    {lang === 'es' ? 'Ver ficha técnica' : 'View technical sheet'}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Complementary Accordions (Revisión veterinaria, Cita privada, Envíos, Formas de pago) */}
          <div className="mt-6 border-t border-linea">
            {vetSummaryText && (
              <AccordionItem title={dict.horseDetail.accordions.vet}>
                <p>{vetSummaryText}</p>
              </AccordionItem>
            )}
            <AccordionItem title={dict.horseDetail.accordions.visit}>
              <p>{dict.horseDetail.accordions.visitBody}</p>
            </AccordionItem>
            <AccordionItem title={dict.horseDetail.accordions.shipping}>
              <p>{dict.horseDetail.accordions.shippingBody}</p>
            </AccordionItem>
            {!isStud && (
              <AccordionItem title={dict.horseDetail.accordions.payment}>
                <p>{dict.horseDetail.accordions.paymentBody}</p>
              </AccordionItem>
            )}
          </div>
        </Reveal>

        {/* =================================================================
            10. DARK GREEN CLOSING CTA CARD ("¿Te interesa este ejemplar?")
            ================================================================= */}
        <Reveal className="pt-8">
          {isSold ? (
            <div className="bg-arena border border-linea rounded-[20px] p-8 text-center flex flex-col items-center gap-4">
              <p className="text-[18px] font-medium text-tinta">
                {dict.horseDetail.soldMessage}
              </p>
              <SecondaryButton href={`/${lang}/ejemplares`}>
                {dict.horseDetail.soldCta}
              </SecondaryButton>
            </div>
          ) : (
            <div className="bg-polder text-niebla rounded-[20px] p-7 sm:p-10 shadow-sm">
              <h2 className="text-[26px] sm:text-[32px] font-bold text-niebla leading-tight">
                {lang === 'es'
                  ? '¿Le interesa este ejemplar?'
                  : 'Interested in this horse?'}
              </h2>
              <p className="mt-3 text-[16px] sm:text-[17px] text-niebla/85 leading-relaxed max-w-2xl">
                {isStud
                  ? lang === 'es'
                    ? 'El servicio de maquila se cotiza según modalidad (monta directa, semen refrigerado o congelado). Nuestro equipo puede asesorarle y enviarle la genealogía completa.'
                    : 'Breeding service is quoted by modality (live cover, cooled or frozen semen). Our team can advise you and send the complete pedigree.'
                  : lang === 'es'
                    ? 'El precio se proporciona bajo solicitud. Nuestro equipo puede asesorarle y coordinar una presentación privada en Zapotlanejo o enviarle el expediente completo por WhatsApp.'
                    : 'Price is provided upon request. Our team can advise you and coordinate a private presentation in Zapotlanejo or send you the complete file via WhatsApp.'}
              </p>

              <button
                type="button"
                data-whatsapp-cta="true"
                onClick={() =>
                  triggerWhatsApp({
                    intent: isStud ? 'stud' : 'horse',
                    horses: [
                      {
                        name: horse.name,
                        code: horse.code,
                        sire: horse.sire,
                      },
                    ],
                    ctaPosition: 'ficha_bottom_card_primary',
                  })
                }
                className="mt-6 w-full h-[56px] rounded-[12px] bg-niebla text-tinta hover:bg-arena font-semibold text-[14px] sm:text-[15px] uppercase tracking-[0.14em] transition-colors flex items-center justify-center gap-2.5"
              >
                <WhatsAppIcon className="w-4 h-4 text-polder shrink-0" />
                <span>
                  {lang === 'es'
                    ? 'SOLICITAR INFORMACIÓN'
                    : 'REQUEST INFORMATION'}
                </span>
              </button>

              <div className="mt-5 pt-4 border-t border-niebla/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[13px] text-niebla/80">
                <span>
                  {lang === 'es'
                    ? `Atención comercial · WhatsApp Oficial ${settings.officialWhatsAppDisplay}`
                    : `Commercial Concierge · Official WhatsApp ${settings.officialWhatsAppDisplay}`}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    triggerWhatsApp({
                      intent: isStud ? 'stud' : 'visit',
                      horses: [
                        {
                          name: horse.name,
                          code: horse.code,
                          sire: horse.sire,
                        },
                      ],
                      ctaPosition: 'ficha_bottom_card_visit',
                    })
                  }
                  className="underline text-niebla hover:opacity-85 text-left sm:text-right"
                >
                  {isStud
                    ? dict.horseDetail.studSecondaryCta
                    : `${dict.horseDetail.primaryCtaPrefix} ${horse.name} →`}
                </button>
              </div>
            </div>
          )}

          <div className="mt-4 text-center">
            <DynamicScheduleMicrocopy lang={lang} settings={settings} />
          </div>
        </Reveal>
      </div>

      {/* Photo Lightbox Modal */}
      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          className="fixed inset-0 z-50 bg-tinta/90 flex items-center justify-center p-4 sm:p-10 cursor-zoom-out"
        >
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            aria-label={dict.nav.close}
            className="absolute top-6 right-6 p-2.5 rounded-full bg-niebla/15 text-niebla hover:bg-niebla/25"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={encodeURI(lightboxUrl)}
            alt={horse.name}
            className="max-w-full max-h-[88vh] object-contain rounded-[12px]"
          />
        </div>
      )}

      {/* Official Document Viewer Modal (Registro Genealógico KFPS / Ficha Técnica) */}
      {activeDocModal && (
        <div
          className="fixed inset-0 z-50 bg-tinta/75 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveDocModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[860px] max-h-[88vh] bg-niebla border border-tinta rounded-[18px] overflow-hidden flex flex-col justify-between shadow-2xl"
          >
            {/* Top Toolbar */}
            <div className="bg-polder text-niebla px-5 sm:px-7 py-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3.5">
                <img
                  src="/brand/Logotipo_Cuadra_Imperial_Loy_isotipo_degradado.svg"
                  alt="Cuadra Imperial Loy"
                  className="w-9 h-9 object-contain shrink-0"
                />
                <div>
                  <h3 className="text-[16px] font-semibold text-niebla leading-tight">
                    {horse.name}{' '}
                    <span className="text-champagne font-normal">
                      ·{' '}
                      {activeDocModal === 'pedigree'
                        ? lang === 'es'
                          ? 'Registro Genealógico KFPS'
                          : 'KFPS Genealogical Registry'
                        : lang === 'es'
                          ? 'Ficha Técnica Oficial'
                          : 'Official Technical Sheet'}
                    </span>
                  </h3>
                  {horse.registrationNumber && (
                    <p className="text-[11px] uppercase tracking-[0.18em] text-niebla/75">
                      REG. KFPS #{horse.registrationNumber}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <a
                  href={`/api/horses/${horse.slug}/pdf?type=${activeDocModal === 'pedigree' ? 'registro' : 'ficha'
                    }&lang=${lang}&download=1`}
                  download={`${horse.name} - ${activeDocModal === 'pedigree' ? 'Registro Genealogico' : 'Ficha Tecnica'}.pdf`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-niebla text-tinta text-[11px] font-semibold uppercase tracking-[0.16em] rounded-[8px] hover:bg-arena transition-colors"
                >
                  <span>
                    {lang === 'es' ? 'Descargar PDF' : 'Download PDF'}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => setActiveDocModal(null)}
                  aria-label={dict.nav.close}
                  className="p-2 text-niebla/80 hover:text-niebla"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Clean Custom Content Area */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-niebla">
              {activeDocModal === 'pedigree' ? (
                /* =========================================================
                   REGISTRO GENEALÓGICO: ONLY NAME + PRESTIGIOUS FAMILY TREE
                   ========================================================= */
                <div className="border-2 border-polder rounded-[16px] p-6 sm:p-9 bg-arena/40">
                  <div className="text-center pb-6 border-b border-linea">
                    <p className="text-[11px] uppercase tracking-[0.26em] text-bronce font-semibold">
                      KONINKLIJKE VERENIGING HET FRIESCH PAARDEN-STAMBOEK (KFPS)
                    </p>
                    <h2 className="mt-2 font-display-split font-bold text-[38px] sm:text-[48px] text-tinta uppercase leading-none">
                      {horse.name}
                    </h2>
                    {horse.registrationNumber && (
                      <p className="mt-2 text-[13px] uppercase tracking-[0.18em] text-polder font-semibold tabular-specs">
                        {lang === 'es'
                          ? `REGISTRO KFPS #${horse.registrationNumber}`
                          : `KFPS REGISTRY #${horse.registrationNumber}`}
                      </p>
                    )}
                  </div>

                  {/* Prestigious 3-Column Genealogical Tree */}
                  <div className="mt-8">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-tinta-diluida text-center mb-6 font-semibold">
                      {lang === 'es'
                        ? 'ÁRBOL GENEALÓGICO DIRECTO · LINAJE VERIFICADO'
                        : 'DIRECT PEDIGREE TREE · VERIFIED BLOODLINE'}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      {/* Column 1: Subject Horse */}
                      <div className="md:col-span-4 bg-polder text-niebla border-2 border-champagne rounded-[14px] p-5 text-center shadow-sm">
                        <span className="block text-[10px] uppercase tracking-[0.22em] text-champagne font-semibold">
                          {lang === 'es' ? 'EJEMPLAR' : 'HORSE'}
                        </span>
                        <strong className="block font-display-split font-bold text-[28px] text-niebla uppercase leading-tight mt-1">
                          {horse.name}
                        </strong>
                        {horse.registrationNumber && (
                          <span className="block text-[12px] text-niebla/80 mt-1 tabular-specs">
                            Reg. #{horse.registrationNumber}
                          </span>
                        )}
                      </div>

                      {/* Column 2: Sire & Dam */}
                      <div className="md:col-span-4 flex flex-col gap-4">
                        <div className="bg-niebla border border-polder/40 rounded-[14px] p-5 shadow-sm">
                          <span className="block text-[10px] uppercase tracking-[0.2em] text-bronce font-semibold">
                            {lang === 'es'
                              ? 'PADRE (LINAJE PATERNO)'
                              : 'SIRE (PATERNAL LINE)'}
                          </span>
                          <strong className="block text-[19px] font-semibold text-tinta mt-1">
                            {horse.sire || '—'}
                          </strong>
                        </div>

                        <div className="bg-niebla border border-polder/40 rounded-[14px] p-5 shadow-sm">
                          <span className="block text-[10px] uppercase tracking-[0.2em] text-bronce font-semibold">
                            {lang === 'es'
                              ? 'MADRE (LINAJE MATERNO)'
                              : 'DAM (MATERNAL LINE)'}
                          </span>
                          <strong className="block text-[18px] font-semibold text-tinta mt-1">
                            {horse.dam || '—'}
                          </strong>
                        </div>
                      </div>

                      {/* Column 3: Maternal Grandsire (Damsire) */}
                      <div className="md:col-span-4 flex flex-col justify-end">
                        <div className="bg-niebla border border-bronce/40 rounded-[14px] p-5 shadow-sm">
                          <span className="block text-[10px] uppercase tracking-[0.2em] text-bronce font-semibold">
                            {lang === 'es'
                              ? 'ABUELO MATERNO DESTACADO'
                              : 'FEATURED MATERNAL GRANDSIRE'}
                          </span>
                          <strong className="block text-[18px] font-semibold text-tinta mt-1">
                            {horse.damsire || '—'}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* =========================================================
                   FICHA TÉCNICA: ALL HORSE INFORMATION + PHOTO + GENEALOGY
                   ========================================================= */
                <div className="space-y-7">
                  {/* Top Identity + Main Photo */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center pb-6 border-b border-linea">
                    <div className="sm:col-span-5 aspect-[4/3] rounded-[14px] overflow-hidden bg-arena border border-linea">
                      <img
                        src={encodeURI(horse.coverPhoto)}
                        alt={horse.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="sm:col-span-7 space-y-2.5">
                      <span className="inline-block px-3 py-1 rounded-full bg-arena text-bronce text-[11px] uppercase tracking-[0.16em] font-semibold">
                        {statusText}
                      </span>
                      <h2 className="font-display-split font-bold text-[36px] sm:text-[42px] text-tinta uppercase leading-none">
                        {horse.name}
                      </h2>
                      <p className="text-[12.5px] uppercase tracking-[0.15em] text-bronce font-semibold tabular-specs">
                        {horse.registrationNumber
                          ? `REG. KFPS #${horse.registrationNumber}`
                          : `ID ${horse.code}`}{' '}
                        · FRISÓN KFPS · {nationalityLabel}
                      </p>
                      <p className="text-[15px] text-tinta leading-relaxed pt-1">
                        {descriptionText}
                      </p>
                    </div>
                  </div>

                  {/* All Key Characteristics */}
                  <div>
                    <h4 className="text-[14px] uppercase tracking-[0.18em] text-bronce font-semibold mb-3.5">
                      {lang === 'es'
                        ? 'Características principales'
                        : 'Key Characteristics'}
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {mainCharacteristicCards.map((item) => (
                        <div
                          key={item.label}
                          className="bg-arena rounded-[12px] p-3.5"
                        >
                          <span className="block text-[12px] text-tinta-diluida">
                            {item.label}
                          </span>
                          <strong className="block text-[16px] font-semibold text-tinta mt-0.5 tabular-specs">
                            {item.value}
                          </strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Complete Genealogy & Registry Table */}
                  <div>
                    <h4 className="text-[14px] uppercase tracking-[0.18em] text-bronce font-semibold mb-3.5">
                      {lang === 'es'
                        ? 'Genealogía y registro completo'
                        : 'Complete Genealogy & Registry'}
                    </h4>
                    <div className="bg-arena/50 border border-linea rounded-[14px] overflow-hidden divide-y divide-linea">
                      {genealogyTableRows.map((row) => (
                        <div
                          key={row.field}
                          className="grid grid-cols-12 px-4 py-3 text-[14px] items-baseline gap-2"
                        >
                          <div className="col-span-5 text-tinta-diluida">
                            {row.field}
                          </div>
                          <div className="col-span-7 text-tinta font-medium tabular-specs">
                            {row.info}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Action Bar */}
            <div className="bg-arena/70 border-t border-linea px-5 sm:px-7 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <span className="text-[13px] text-tinta-diluida">
                {lang === 'es'
                  ? '¿Desea recibir el expediente directamente en su WhatsApp?'
                  : 'Would you like to receive the file directly on WhatsApp?'}
              </span>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setActiveDocModal(null);
                    openDossierDrawer(horse);
                  }}
                  className="px-4 py-2 bg-polder text-niebla text-[11px] font-semibold uppercase tracking-[0.18em] rounded-[8px] hover:opacity-90"
                >
                  {lang === 'es'
                    ? 'Solicitar por WhatsApp'
                    : 'Request via WhatsApp'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 60% Scroll Discreet Bottom Dossier Bar (Sección 7.4 - no modal) */}
      {showDossierBar && !dossierBarDismissed && !isSold && (
        <div className="hidden lg:block fixed bottom-0 left-0 right-0 z-30 bg-arena border-t border-linea py-3.5 px-8">
          <div className="gallery-container flex items-center justify-between gap-6">
            <p className="text-[14px] text-tinta">
              {dict.horseDetail.dossierScrollBar.questionPrefix}{' '}
              <strong>{horse.name}</strong>
              {dict.horseDetail.dossierScrollBar.questionSuffix}
            </p>
            <div className="flex items-center gap-4 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowDossierBar(false);
                  openDossierDrawer(horse);
                }}
                className="px-4 py-2 border border-tinta text-[11px] uppercase tracking-[0.18em] text-tinta hover:bg-tinta/5 rounded-[2px]"
              >
                {dict.horseDetail.dossierScrollBar.acceptBtn}
              </button>
              <button
                type="button"
                onClick={() => {
                  setDossierBarDismissed(true);
                  setShowDossierBar(false);
                }}
                className="text-[12px] text-tinta-diluida hover:text-tinta"
              >
                {dict.horseDetail.dossierScrollBar.dismissBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STICKY MOBILE CTA BAR */}
      {!isSold && (
        <div
          data-mobile-sticky="true"
          className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-niebla border-t border-linea p-3 grid grid-cols-2 gap-3"
        >
          <PrimaryButton
            showArrow={false}
            className="w-full !h-[46px] !px-3"
            onClick={() =>
              triggerWhatsApp({
                intent: isStud ? 'stud' : 'visit',
                horses: [
                  { name: horse.name, code: horse.code, sire: horse.sire },
                ],
                ctaPosition: 'mobile_sticky_visit',
              })
            }
          >
            {dict.horseDetail.mobileSticky.bookVisit}
          </PrimaryButton>
          <SecondaryButton
            isWhatsAppCta={true}
            className="w-full !h-[46px] !px-3"
            onClick={() =>
              triggerWhatsApp({
                intent: isStud ? 'stud' : 'horse',
                horses: [
                  { name: horse.name, code: horse.code, sire: horse.sire },
                ],
                ctaPosition: 'mobile_sticky_whatsapp',
              })
            }
          >
            {dict.horseDetail.mobileSticky.whatsapp}
          </SecondaryButton>
        </div>
      )}
    </div>
  );
}
