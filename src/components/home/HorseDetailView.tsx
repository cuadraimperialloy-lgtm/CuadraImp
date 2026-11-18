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
      : '';

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
      label: lang === 'es' ? 'Nacionalidad' : 'Nationality',
      value:
        horse.origin === 'Holanda'
          ? lang === 'es'
            ? 'Europeo'
            : 'European'
          : lang === 'es'
            ? 'Nacional'
            : 'National',
    },
    ...(horse.fullPaper === true
      ? [
        {
          label: lang === 'es' ? 'Full Paper' : 'Full Paper',
          value: lang === 'es' ? 'Sí' : 'Yes',
        },
      ]
      : []),
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

  // Presentation rows organized cleanly by line (renglón por renglón)
  const presentationRows: Array<{ label: string; value: string }> = [
    {
      label: lang === 'es' ? 'Raza y origen' : 'Breed & Origin',
      value:
        lang === 'es'
          ? `Frisón ${horse.origin === 'Holanda' ? 'europeo' : 'nacional'} · ${sexText}`
          : `Friesian (${horse.origin === 'Holanda' ? 'European' : 'National'}) · ${sexText}`,
    },
    ...(horse.registrationNumber
      ? [
          {
            label: lang === 'es' ? 'Registro oficial' : 'Official Registry',
            value: `KFPS #${horse.registrationNumber}`,
          },
        ]
      : []),
    ...(horse.birthDate
      ? [
          {
            label: lang === 'es' ? 'Fecha de nacimiento' : 'Date of Birth',
            value: `${horse.birthDate}${ageText ? ` (${ageText})` : ''}`,
          },
        ]
      : []),
    ...(horse.heightM
      ? [
          {
            label: lang === 'es' ? 'Alzada' : 'Height',
            value: `${horse.heightM.toFixed(2)} m`,
          },
        ]
      : []),
    ...(horse.fullPaper === true
      ? [
          {
            label: 'Certificación',
            value:
              lang === 'es'
                ? 'Full Paper (Línea materna completa)'
                : 'Full Paper (Direct maternal line)',
          },
        ]
      : []),
    ...(horse.awards && horse.awards.length > 0
      ? [
          {
            label: lang === 'es' ? 'Premios y títulos' : 'Awards & Titles',
            value: horse.awards.join(' · '),
          },
        ]
      : []),
    ...(horse.sire
      ? [
          {
            label: lang === 'es' ? 'Padre (Sire)' : 'Sire',
            value: horse.sire,
          },
        ]
      : []),
    ...(horse.dam
      ? [
          {
            label: lang === 'es' ? 'Madre (Dam)' : 'Dam',
            value: horse.dam,
          },
        ]
      : []),
    ...(horse.damsire
      ? [
          {
            label: lang === 'es' ? 'Abuelo materno' : 'Maternal Grandsire',
            value: horse.damsire,
          },
        ]
      : []),
    ...(horse.microchip
      ? [
          {
            label: 'Microchip',
            value:
              formatMaskedMicrochip(horse.microchip) ||
              `•••• ${horse.microchip}`,
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
    ...(horse.fullPaper === true
      ? [
        {
          field: lang === 'es' ? 'Certificación KFPS' : 'KFPS Certification',
          info: lang === 'es' ? 'Full Paper (Línea Materna Completa)' : 'Full Paper (Direct Maternal Line)',
        },
      ]
      : []),
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
          field: lang === 'es' ? 'Microchip' : 'Microchip',
          info: formatMaskedMicrochip(horse.microchip) || `•••• ${horse.microchip}`,
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
  ];

  // Helper sub-blocks for modular Mobile vs Desktop (Shopify PDP layout)
  const renderHeroPhoto = (isDesktop = false) => (
    <div
      onClick={() => setLightboxUrl(horse.coverPhoto)}
      className={`relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-arena cursor-zoom-in border border-linea shadow-sm ${
        isDesktop ? 'mb-0' : 'mb-7'
      }`}
    >
      <img
        src={encodeURI(horse.coverPhoto)}
        alt={horse.name}
        loading="eager"
        className="w-full h-full object-contain bg-arena transition-transform duration-700 hover:scale-[1.015]"
      />
      {isSold && (
        <div className="pointer-events-none absolute inset-0 bg-[#141413]/30 flex items-center justify-center z-10">
          <div className="px-7 py-3 rounded-full bg-[#181816]/85 backdrop-blur-md border border-[#C6B28A]/60 shadow-xl flex items-center gap-3.5">
            <span className="w-5 h-[1px] bg-[#C6B28A]/80" />
            <span className="text-[12.5px] sm:text-[14px] font-medium tracking-[0.32em] uppercase text-[#F4F2ED] leading-none">
              {lang === 'es' ? 'EJEMPLAR VENDIDO' : 'SOLD'}
            </span>
            <span className="w-5 h-[1px] bg-[#C6B28A]/80" />
          </div>
        </div>
      )}
      {/* Subtle bottom-left official brand logo seal */}
      <div className="absolute bottom-4 left-4 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-tinta/85 backdrop-blur-md inline-flex items-center justify-center z-10 border border-[#C6B28A]/40 shadow-md">
        <img
          src="/brand/Logotipo_Cuadra_Imperial_Loy_isotipo_degradado.svg"
          alt="Cuadra Imperial Loy"
          className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
        />
      </div>
    </div>
  );

  const renderGallery = (isDesktop = false) => (
    <div className={isDesktop ? 'pt-2' : 'py-8 border-b border-linea'}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`font-semibold text-tinta ${isDesktop ? 'text-[20px]' : 'text-[22px]'}`}>
          {lang === 'es' ? 'Galería de fotografías' : 'Photo Gallery'}
        </h2>
        <span className="text-[11.5px] uppercase tracking-[0.18em] text-tinta-diluida tabular-specs">
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
    </div>
  );

  const renderVideo = (isDesktop = false) => (
    horse.mainVideo ? (
      <div className={isDesktop ? 'pt-2' : 'py-8 border-b border-linea'}>
        <h2 className={`font-semibold text-tinta mb-4 ${isDesktop ? 'text-[20px]' : 'text-[22px]'}`}>
          {lang === 'es' ? 'Presentación en video' : 'Video Presentation'}
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
          <div className="pointer-events-none absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-tinta/85 backdrop-blur-md text-niebla inline-flex items-center gap-2 border border-[#C6B28A]/40 shadow-md">
            <Play className="w-3.5 h-3.5 fill-current text-champagne" />
            <img
              src="/brand/Logotipo_Cuadra_Imperial_Loy_isotipo_degradado.svg"
              alt="Cuadra Imperial Loy"
              className="w-4 h-4 object-contain"
            />
          </div>
        </div>

        <p className="mt-2.5 text-[13.5px] text-tinta-diluida">
          {lang === 'es'
            ? 'Presentación en movimiento · Video original integrado desde el expediente.'
            : 'Presentation in motion · Original video integrated from the horse’s file.'}
        </p>
      </div>
    ) : null
  );


  const renderTitleAndActions = (isDesktop = false) => (
    <div className={isDesktop ? 'pb-5 border-b border-linea' : 'pb-7 border-b border-linea'}>
      <div className="flex flex-col gap-3">
        <div>
          <h1 className={`font-display-split font-bold text-tinta uppercase tracking-tight leading-[0.98] ${
            isDesktop ? 'text-[36px] xl:text-[44px]' : 'text-[42px] sm:text-[56px]'
          }`}>
            {horse.name}
          </h1>
          <p className="mt-2 text-[12.5px] sm:text-[13.5px] uppercase tracking-[0.15em] text-bronce font-semibold tabular-specs">
            {horse.registrationNumber
              ? `${horse.registrationNumber}`
              : `ID ${horse.code}`}{' '}
            · FRISÓN KFPS · {nationalityLabel}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          {horse.fullPaper && (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#EFE9DC] text-[#756242] border border-[#D8CCB4] text-[11.5px] font-semibold">
              Full Paper · KFPS
            </span>
          )}
          {horse.awards && horse.awards.length > 0 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#EFE9DC] text-[#756242] border border-[#D8CCB4] text-[11.5px] font-semibold">
              {horse.awards.join(' · ')}
            </span>
          )}
          <span
            className={`inline-flex items-center px-3.5 py-1 rounded-full text-[11.5px] font-medium ${
              isSold
                ? 'bg-[#181816] text-[#C6B28A] border border-[#C6B28A]/40 uppercase tracking-[0.16em]'
                : 'bg-[#EFEAE2] text-[#211915] border border-[#DDD5C7] font-semibold'
            }`}
          >
            {statusText}
          </span>
        </div>
      </div>

      {/* Quick Action Bar */}
      {!isSold && (
        <div className={`mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 ${isDesktop ? 'flex-col sm:flex-row' : ''}`}>
          <PrimaryButton
            className="flex-1 justify-center !text-[12.5px] sm:!text-[13px] !tracking-[0.12em]"
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
                ? `Solicitar información`
                : `Request information`}
          </PrimaryButton>

          <SecondaryButton
            isWhatsAppCta={true}
            className="flex-1 justify-center !text-[12.5px] sm:!text-[13px] !tracking-[0.12em]"
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
  );

  const renderPresentation = (isDesktop = false) => (
    <div className={isDesktop ? 'py-5 border-b border-linea' : 'py-8 border-b border-linea'}>
      <h2 className={`font-semibold text-tinta mb-4 ${isDesktop ? 'text-[18px]' : 'text-[22px]'}`}>
        {lang === 'es' ? 'Presentación' : 'Presentation'}
      </h2>

      <div className="space-y-2.5">
        {presentationRows.map((row) => (
          <div
            key={row.label}
            className="flex items-start gap-2.5 text-[14.5px] sm:text-[15.5px] leading-relaxed"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#C6B28A] shrink-0 mt-2" />
            <span className="font-semibold text-tinta shrink-0">
              {row.label}:
            </span>
            <span className="text-tinta/90 tabular-specs">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCharacteristics = (isDesktop = false) => (
    <div className={isDesktop ? 'py-5 border-b border-linea' : 'py-8 border-b border-linea'}>
      <h2 className={`font-semibold text-tinta mb-4 ${isDesktop ? 'text-[18px]' : 'text-[22px]'}`}>
        {lang === 'es'
          ? 'Características principales'
          : 'Key Characteristics'}
      </h2>
      <div className={`grid gap-3 ${isDesktop ? 'grid-cols-2 xl:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4'}`}>
        {mainCharacteristicCards.map((item) => (
          <div
            key={item.label}
            className={`bg-arena rounded-xl flex flex-col justify-between gap-1 ${
              isDesktop ? 'p-3.5' : 'p-4 sm:p-5 rounded-2xl'
            }`}
          >
            <span className="text-[12px] text-tinta-diluida leading-none">
              {item.label}
            </span>
            <strong className={`font-semibold text-tinta tabular-specs leading-snug ${
              isDesktop ? 'text-[15.5px]' : 'text-[17px] sm:text-[19px]'
            }`}>
              {item.value}
            </strong>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGenealogy = (isDesktop = false) => (
    <div className={isDesktop ? 'py-5 border-b border-linea' : 'py-8 border-b border-linea'}>
      <h2 className={`font-semibold text-tinta mb-4 ${isDesktop ? 'text-[18px]' : 'text-[22px]'}`}>
        {lang === 'es' ? 'Genealogía y registro' : 'Genealogy & Registry'}
      </h2>

      <div className="bg-arena/50 border border-linea rounded-[14px] overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-3 bg-arena border-b border-linea text-[12px] font-semibold text-tinta">
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
              className="grid grid-cols-12 px-4 py-2.5 text-[14px] items-baseline gap-2"
            >
              <div className="col-span-5 text-tinta-diluida text-[12.5px]">
                {row.field}
              </div>
              <div className="col-span-7 text-tinta font-medium tabular-specs text-[13.5px]">
                {row.info}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Pedigree Diagram */}
      {(horse.sire || horse.dam || horse.damsire) && (
        <div className="mt-4 bg-arena/70 border border-linea rounded-[14px] p-4">
          <p className="text-[10.5px] uppercase tracking-[0.2em] text-tinta-diluida mb-3">
            {lang === 'es'
              ? 'ÁRBOL GENEALÓGICO DIRECTO · KFPS'
              : 'DIRECT PEDIGREE TREE · KFPS'}
          </p>
          <div className={`grid gap-2.5 items-stretch ${isDesktop ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
            <div className="bg-niebla border border-tinta p-3 rounded-[10px]">
              <span className="block text-[9.5px] uppercase tracking-[0.18em] text-tinta-diluida">
                {lang === 'es' ? 'EJEMPLAR' : 'HORSE'}
              </span>
              <strong className="font-display-split font-bold text-[22px] text-tinta leading-none">
                {horse.name}
              </strong>
              {horse.registrationNumber && (
                <span className="block text-[11px] text-tinta-diluida mt-0.5 tabular-specs">
                  Reg. {horse.registrationNumber}
                </span>
              )}
            </div>

            <div className="bg-niebla border border-linea p-3 rounded-[10px]">
              <span className="block text-[9.5px] uppercase tracking-[0.18em] text-tinta-diluida">
                {lang === 'es' ? 'PADRE (SIRE)' : 'SIRE'}
              </span>
              <strong className="text-[14.5px] font-semibold text-tinta block mt-0.5">
                {horse.sire || '—'}
              </strong>
            </div>

            <div className="bg-niebla border border-linea p-3 rounded-[10px] flex flex-col gap-1.5">
              <div>
                <span className="block text-[9.5px] uppercase tracking-[0.18em] text-tinta-diluida">
                  {lang === 'es' ? 'MADRE (DAM)' : 'DAM'}
                </span>
                <strong className="text-[14px] font-semibold text-tinta block">
                  {horse.dam || '—'}
                </strong>
              </div>
              {horse.damsire && (
                <div className="pt-1.5 border-t border-linea">
                  <span className="block text-[9.5px] uppercase tracking-[0.18em] text-tinta-diluida">
                    {lang === 'es'
                      ? 'ABUELO MATERNO (DAMSIRE)'
                      : 'DAMSIRE'}
                  </span>
                  <strong className="text-[13px] font-medium text-tinta block">
                    {horse.damsire}
                  </strong>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderDocumentation = (isDesktop = false) => (
    <div className={isDesktop ? 'py-5 border-b border-linea' : 'py-8 border-b border-linea'}>
      <h2 className={`font-semibold text-tinta mb-4 ${isDesktop ? 'text-[18px]' : 'text-[22px]'}`}>
        {lang === 'es' ? 'Documentación' : 'Documentation'}
      </h2>

      <div className="flex flex-col gap-3">
        {/* Row 1: Registro Genealógico */}
        <div
          onClick={() => setActiveDocModal('pedigree')}
          className="w-full p-3.5 sm:p-4 rounded-[12px] bg-arena/70 hover:bg-arena border border-linea flex items-center justify-between gap-3 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3 text-left min-w-0">
            <div className="w-10 h-10 rounded-[8px] bg-[#9E2A2B] text-niebla flex items-center justify-center shrink-0">
              <FileText className="w-4.5 h-4.5 stroke-[1.75]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-[15px] font-semibold text-tinta truncate">
                {lang === 'es'
                  ? 'Registro genealógico'
                  : 'Genealogical Registry'}
              </h3>
              <p className="text-[12px] text-tinta-diluida truncate">
                KFPS · {horse.registrationNumber ? `Reg. #${horse.registrationNumber}` : 'Pedigree Tree'}
              </p>
            </div>
          </div>

          <span className="inline-flex items-center px-3 py-1.5 bg-polder text-niebla text-[10.5px] font-semibold uppercase tracking-[0.14em] rounded-[6px] shrink-0">
            {lang === 'es' ? 'Ver' : 'View'}
          </span>
        </div>

        {/* Row 2: Ficha Técnica */}
        <div
          onClick={() => setActiveDocModal('tech_sheet')}
          className="w-full p-3.5 sm:p-4 rounded-[12px] bg-arena/70 hover:bg-arena border border-linea flex items-center justify-between gap-3 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3 text-left min-w-0">
            <div className="w-10 h-10 rounded-[8px] bg-niebla border border-linea overflow-hidden shrink-0">
              <img
                src={encodeURI(horse.coverPhoto)}
                alt={horse.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h3 className="text-[15px] font-semibold text-tinta truncate">
                {horse.name} · {lang === 'es' ? 'Ficha técnica' : 'Tech Sheet'}
              </h3>
              <p className="text-[12px] text-tinta-diluida truncate">
                {lang === 'es' ? 'Expediente y características' : 'Full horse specs'}
              </p>
            </div>
          </div>

          <span className="inline-flex items-center px-3 py-1.5 bg-polder text-niebla text-[10.5px] font-semibold uppercase tracking-[0.14em] rounded-[6px] shrink-0">
            {lang === 'es' ? 'Ver' : 'View'}
          </span>
        </div>
      </div>

      {/* Accordions */}
      <div className="mt-4 border-t border-linea">
        {vetSummaryText && (
          <AccordionItem title={dict.horseDetail.accordions.vet}>
            <p className="text-[14px] text-tinta/90 leading-relaxed">{vetSummaryText}</p>
          </AccordionItem>
        )}
        <AccordionItem title={dict.horseDetail.accordions.visit}>
          <p className="text-[14px] text-tinta/90 leading-relaxed">{dict.horseDetail.accordions.visitBody}</p>
        </AccordionItem>
        <AccordionItem title={dict.horseDetail.accordions.shipping}>
          <p className="text-[14px] text-tinta/90 leading-relaxed">{dict.horseDetail.accordions.shippingBody}</p>
        </AccordionItem>
        {!isStud && (
          <AccordionItem title={dict.horseDetail.accordions.payment}>
            <p className="text-[14px] text-tinta/90 leading-relaxed">{dict.horseDetail.accordions.paymentBody}</p>
          </AccordionItem>
        )}
      </div>
    </div>
  );

  const renderClosingCta = (isDesktop = false) => (
    <div className={isDesktop ? 'pt-4' : 'pt-8'}>
      {isSold ? (
        <div className="bg-arena border border-linea rounded-[16px] p-6 text-center flex flex-col items-center gap-3">
          <p className="text-[16px] font-medium text-tinta">
            {dict.horseDetail.soldMessage}
          </p>
          <SecondaryButton href={`/${lang}/ejemplares`}>
            {dict.horseDetail.soldCta}
          </SecondaryButton>
        </div>
      ) : (
        <div className={`bg-polder text-niebla rounded-[16px] shadow-sm ${isDesktop ? 'p-6' : 'p-7 sm:p-10'}`}>
          <h2 className={`font-bold text-niebla leading-tight ${isDesktop ? 'text-[22px]' : 'text-[26px] sm:text-[32px]'}`}>
            {lang === 'es'
              ? '¿Le interesa este ejemplar?'
              : 'Interested in this horse?'}
          </h2>
          <p className={`mt-2 text-niebla/85 leading-relaxed ${isDesktop ? 'text-[14px]' : 'text-[16px] sm:text-[17px] max-w-2xl'}`}>
            {isStud
              ? lang === 'es'
                ? 'El servicio de maquila se cotiza según modalidad (monta directa, semen refrigerado o congelado).'
                : 'Breeding service is quoted by modality (live cover, cooled or frozen semen).'
              : lang === 'es'
                ? 'El precio se proporciona bajo solicitud. Nuestro equipo puede asesorarle y coordinar una presentación privada en Zapotlanejo o enviarle el expediente completo por WhatsApp.'
                : 'Price is provided upon request. Our team can advise you and coordinate a private presentation in Zapotlanejo.'}
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
            className="mt-4 w-full h-[50px] rounded-[10px] bg-niebla text-tinta hover:bg-arena font-semibold text-[13.5px] uppercase tracking-[0.14em] transition-colors flex items-center justify-center gap-2"
          >
            <WhatsAppIcon className="w-4 h-4 text-polder shrink-0" />
            <span>
              {lang === 'es'
                ? 'SOLICITAR INFORMACIÓN'
                : 'REQUEST INFORMATION'}
            </span>
          </button>

          <div className="mt-4 pt-3 border-t border-niebla/15 flex flex-col gap-2 text-[12px] text-niebla/80">
            <span>
              {lang === 'es'
                ? `Atención comercial · WhatsApp ${settings.officialWhatsAppDisplay}`
                : `Commercial Concierge · WhatsApp ${settings.officialWhatsAppDisplay}`}
            </span>
          </div>
        </div>
      )}

      <div className="mt-3 text-center">
        <DynamicScheduleMicrocopy lang={lang} settings={settings} />
      </div>
    </div>
  );

  return (
    <div className="bg-niebla text-tinta pt-24 pb-28 lg:pb-24">
      {/* Top Breadcrumb + Save Bar (Spanning container) */}
      <div className="max-w-[960px] lg:max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 mb-5">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center justify-between text-[12px] uppercase tracking-[0.18em] text-tinta-diluida"
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
      </div>

      {/* =====================================================================
          1. MOBILE VIEW (< lg): 100% UNTOUCHED LINEAR FLOW (User's preferred layout)
          ===================================================================== */}
      <div className="lg:hidden max-w-[960px] mx-auto px-4 sm:px-6">
        <Reveal delay={0.02}>{renderHeroPhoto(false)}</Reveal>
        <Reveal delay={0.05}>{renderTitleAndActions(false)}</Reveal>
        <Reveal>{renderPresentation(false)}</Reveal>
        <Reveal>{renderCharacteristics(false)}</Reveal>
        <Reveal>{renderGallery(false)}</Reveal>
        <Reveal>{renderGenealogy(false)}</Reveal>
        {horse.mainVideo && <Reveal>{renderVideo(false)}</Reveal>}
        <Reveal>{renderDocumentation(false)}</Reveal>
        <Reveal>{renderClosingCta(false)}</Reveal>
      </div>

      {/* =====================================================================
          2. DESKTOP VIEW (>= lg): SHOPIFY COCO PDP 2-COLUMN LUXURY LAYOUT
             Left Column: Media (Hero Photo + Photo Gallery + Video Presentation)
             Right Column: Sticky Information (Title, CTAs, Specs, Docs, Accordions)
          ===================================================================== */}
      <div className="hidden lg:block max-w-[1360px] mx-auto px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-12 gap-10 xl:gap-14 items-start">
          {/* LEFT COLUMN: Media Stream (7 cols / ~58%) */}
          <div className="col-span-7 space-y-8">
            <Reveal delay={0.02}>{renderHeroPhoto(true)}</Reveal>
            <Reveal delay={0.05}>{renderGallery(true)}</Reveal>
            {horse.mainVideo && <Reveal delay={0.08}>{renderVideo(true)}</Reveal>}
          </div>

          {/* RIGHT COLUMN: Product Information (5 cols / ~42%) */}
          <div className="col-span-5 space-y-6">
            <Reveal delay={0.02}>{renderTitleAndActions(true)}</Reveal>
            <Reveal delay={0.06}>{renderCharacteristics(true)}</Reveal>
            <Reveal delay={0.08}>{renderPresentation(true)}</Reveal>
            <Reveal delay={0.10}>{renderDocumentation(true)}</Reveal>
            <Reveal delay={0.12}>{renderGenealogy(true)}</Reveal>
            <Reveal delay={0.14}>{renderClosingCta(true)}</Reveal>
          </div>
        </div>
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
                      <div className="pt-2 space-y-1.5">
                        {presentationRows.slice(0, 5).map((row) => (
                          <div key={row.label} className="text-[13.5px] text-tinta flex items-baseline gap-2">
                            <span className="w-1 h-1 rounded-full bg-[#C6B28A] shrink-0" />
                            <span className="font-semibold">{row.label}:</span>
                            <span className="text-tinta/85">{row.value}</span>
                          </div>
                        ))}
                      </div>
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
