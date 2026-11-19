'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bookmark } from 'lucide-react';
import type { PublicHorse } from '@/types';
import { useGallery } from '@/context/GalleryContext';
import {
  calculateHorseAge,
  formatHorseStatus,
} from '@/lib/utils';

export function HorseCard({
  horse,
  index = 0,
  priority = false,
}: {
  horse: PublicHorse;
  index?: number;
  priority?: boolean;
}) {
  const router = useRouter();
  const { lang, dict, isSelected, toggleSelection } = useGallery();
  const [hovered, setHovered] = useState(false);

  const saved = isSelected(horse.slug);
  const ageText = calculateHorseAge(horse.birthDate, lang);
  const statusText =
    horse.type === 'stud'
      ? dict.home.stallions.studOnlyTag
      : formatHorseStatus(horse.status, lang);

  const metaParts: string[] = [];
  if (horse.sire) {
    metaParts.push(
      horse.damsire
        ? `${horse.sire} × ${horse.damsire}`
        : `${dict.home.collection.sirePrefix} ${horse.sire}`
    );
  }
  if (ageText) {
    metaParts.push(ageText);
  }
  if (horse.heightM) {
    metaParts.push(`${horse.heightM.toFixed(2)} m`);
  }

  const detailHref = `/${lang}/ejemplares/${horse.slug}`;
  const primaryAlt =
    lang === 'es'
      ? horse.gallery[0]?.altEs || `${horse.name}, ejemplar frisón en Cuadra Imperial Loy`
      : horse.gallery[0]?.altEn || `${horse.name}, Friesian horse at Cuadra Imperial Loy`;

  const originCountry =
    horse.origin === 'Nacional'
      ? dict.system.origin.Nacional
      : dict.system.origin.Holanda;

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.7,
        delay: (index % 2) * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative flex flex-col bg-arena rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:shadow-sm cursor-pointer"
      onClick={() => router.push(detailHref)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* 4:3 Native Conformation Proportion — Clean Rounded Photo with Subtle Pill */}
      <Link
        href={detailHref}
        className="relative block w-full aspect-[4/3] bg-niebla overflow-hidden rounded-xl"
      >
        <img
          src={encodeURI(horse.coverPhoto)}
          alt={primaryAlt}
          loading={priority ? 'eager' : 'lazy'}
          className={`w-full h-full object-contain bg-niebla transition-all duration-700 ease-gallery ${
            hovered && horse.hoverPhoto
              ? 'opacity-0'
              : 'opacity-100 group-hover:scale-[1.015]'
          }`}
        />
        {horse.hoverPhoto && (
          <img
            src={encodeURI(horse.hoverPhoto)}
            alt={primaryAlt}
            loading="lazy"
            className={`absolute inset-0 w-full h-full object-contain bg-niebla transition-all duration-500 ease-gallery ${
              hovered ? 'opacity-100 scale-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Quiet-Luxury Editorial VENDIDO / SOLD Plaque when horse.status === 'sold' */}
        {horse.status === 'sold' && (
          <div className="pointer-events-none absolute inset-0 bg-[#141413]/30 flex items-center justify-center z-10">
            <div className="px-6 py-2.5 rounded-full bg-[#181816]/85 backdrop-blur-md border border-[#C6B28A]/60 shadow-lg flex items-center gap-3">
              <span className="w-4 h-[1px] bg-[#C6B28A]/80" />
              <span className="text-[11.5px] sm:text-[12.5px] font-medium tracking-[0.32em] uppercase text-[#F4F2ED] leading-none">
                {lang === 'es' ? 'VENDIDO' : 'SOLD'}
              </span>
              <span className="w-4 h-[1px] bg-[#C6B28A]/80" />
            </div>
          </div>
        )}

        {/* Subtle bottom-left official brand logo seal */}
        <span className="absolute bottom-3 left-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-tinta/85 backdrop-blur-md inline-flex items-center justify-center z-10 border border-[#C6B28A]/40 shadow-sm">
          <img
            src="/brand/Logotipo_Cuadra_Imperial_Loy_isotipo_degradado.svg"
            alt="Cuadra Imperial Loy"
            className="w-4 h-4 sm:w-4.5 sm:h-4.5 object-contain"
          />
        </span>
      </Link>

      {/* Clean Minimalist Card Body */}
      <div className="pt-5 flex flex-col gap-2.5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Link href={detailHref} className="block">
              <h3 className="font-display-split font-bold text-[34px] md:text-[38px] text-tinta tracking-tight leading-none uppercase">
                {horse.name}
              </h3>
            </Link>
            <p className="mt-1.5 text-[11.5px] uppercase tracking-[0.14em] text-bronce font-semibold tabular-specs">
              {horse.registrationNumber
                ? `${horse.registrationNumber}`
                : `ID ${horse.code}`}{' '}
              · FRISÓN KFPS · {originCountry}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {horse.fullPaper && (
              <span className="px-3 py-1 rounded-full bg-[#EFE9DC] text-[#756242] border border-[#D8CCB4] text-[11px] font-semibold">
                Full Paper
              </span>
            )}
            {horse.awards && horse.awards.length > 0 && (
              <span className="px-3 py-1 rounded-full bg-[#EFE9DC] text-[#756242] border border-[#D8CCB4] text-[11px] font-semibold">
                {horse.awards[0]}
              </span>
            )}
            <span
              className={`px-3.5 py-1 rounded-full text-[11px] font-medium ${
                horse.status === 'sold'
                  ? 'bg-[#181816] text-[#C6B28A] border border-[#C6B28A]/40 uppercase tracking-[0.16em]'
                  : 'bg-[#EFEAE2] text-[#181816] border border-[#DDD5C7] font-semibold'
              }`}
            >
              {statusText}
            </span>
          </div>
        </div>

        {metaParts.length > 0 && (
          <p className="text-[14.5px] text-tinta-diluida tabular-specs pt-0.5">
            {metaParts.join(' · ')}
          </p>
        )}

        {/* Clean Action Footer */}
        <div className="pt-3.5 mt-1 border-t border-linea flex items-center justify-between">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleSelection(horse);
            }}
            aria-label={`${saved ? dict.system.saved : dict.system.save} ${horse.name}`}
            className="inline-flex items-center gap-1.5 text-[11.5px] uppercase tracking-[0.16em] text-tinta-diluida hover:text-tinta transition-colors"
          >
            <Bookmark
              className="w-3.5 h-3.5 stroke-[1.5]"
              fill={saved ? 'currentColor' : 'none'}
            />
            <span>{saved ? dict.system.saved : dict.system.save}</span>
          </button>

          <Link
            href={detailHref}
            className="text-[12px] uppercase tracking-[0.16em] text-polder font-semibold inline-flex items-center gap-1.5 group-hover:translate-x-1 transition-transform duration-300"
          >
            <span>{dict.system.viewHorse}</span>
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
