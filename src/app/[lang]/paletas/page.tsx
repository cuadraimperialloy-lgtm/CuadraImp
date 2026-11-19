'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const GOLD_VARIANTS = [
  {
    id: '1A',
    badge: 'VARIANTE 1A · RECOMENDADA (ESTILO ROLEX / HERMÈS)',
    title: '1A · Escudo Dorado Original + Micro-Acento Champagne Piedra (#C6B28A)',
    description:
      'El logotipo conserva su degradado dorado oficial (#E8CB7C → #D4B160 → #B08532) posado sobre el bloque Verde Pólder Profundo (#1C2E24). Para acompañarlo sin saturar la página, se usa un tono Champagne Piedra Desaturado (#C6B28A sobre oscuro / #7D6B4A sobre claro) al 35% de saturación únicamente en micro-detalles: subtítulo bajo el escudo, etiqueta Full Paper KFPS y número de registro. Cero botones dorados.',
    logoFilter: 'none',
    kickerOnGreen: '#C6B28A',
    dividerOnGreen: '#C6B28A',
    metaText: '#7D6B4A',
    kfpsPillBg: '#EFE9DC',
    kfpsPillText: '#756242',
    kfpsPillBorder: '#D8CCB4',
    accentLabel: 'Champagne Satinado',
    accentHex: '#C6B28A',
    accentRole: 'Subtítulo en verde y micro-detalles KFPS',
  },
  {
    id: '1B',
    badge: 'VARIANTE 1B · MINIMALISMO PURO',
    title: '1B · El Logotipo como Única Joya (UI 100% Mineral sin más dorado)',
    description:
      'El escudo oficial de Cuadra Imperial Loy es literalmente el único elemento dorado en toda la página, enmarcado dentro del bloque Verde Pólder Profundo (#1C2E24). Todo el resto de la interfaz se mantiene 100% en tonos minerales neutros: Piedra Caliza (#F4F2ED), Arena Suave (#EAE6DF), Gris Piedra (#6E6A63) y Salvia (#DCE8E0).',
    logoFilter: 'none',
    kickerOnGreen: 'rgba(244, 242, 237, 0.75)',
    dividerOnGreen: 'rgba(244, 242, 237, 0.22)',
    metaText: '#6E6A63',
    kfpsPillBg: '#EAE6DF',
    kfpsPillText: '#181816',
    kfpsPillBorder: '#DCD6CC',
    accentLabel: 'Gris Piedra Mineral',
    accentHex: '#6E6A63',
    accentRole: 'Cero dorado en la UI (solo en el escudo)',
  },
  {
    id: '1C',
    badge: 'VARIANTE 1C · ORO SUAVIZADO',
    title: '1C · Escudo y Acentos Suavizados a Champagne Arena Mate (#C9B796)',
    description:
      'Si prefieres que incluso el propio logotipo tenga menos brillo amarillo en pantalla, suavizamos un 25% la saturación del escudo hacia un tono Champagne Arena Mate (#C9B796), integrándolo de forma ultrasuave con el fondo Piedra Caliza (#F4F2ED) y el Verde Pólder (#1C2E24).',
    logoFilter: 'saturate(0.62) brightness(1.06)',
    kickerOnGreen: '#C9B796',
    dividerOnGreen: '#C9B796',
    metaText: '#786D58',
    kfpsPillBg: '#ECE7DD',
    kfpsPillText: '#6B604C',
    kfpsPillBorder: '#D5CBB8',
    accentLabel: 'Champagne Arena Mate',
    accentHex: '#C9B796',
    accentRole: 'Escudo y micro-acentos desaturados',
  },
];

const PROPOSALS = [
  {
    id: 'propuesta-1',
    tag: 'PROPUESTA 01 · SELECCIONADA',
    name: 'Piedra Caliza & Verde Pólder Profundo',
    subtitle:
      'Minimalismo Ecuestre Limpio · Lienzo Piedra Caliza (#F4F2ED), Tarjetas Arena Suave (#EAE6DF) y Bloques en Verde Pólder (#1C2E24)',
    colors: {
      canvas: '#F4F2ED',
      surface: '#EAE6DF',
      accentBlock: '#181816',
      accentBlockText: '#F4F2ED',
      textPrimary: '#181816',
      textSecondary: '#6E6A63',
      border: '#E0DBD1',
      pillBg: '#DCEBE2',
      pillText: '#1C4A31',
    },
  },
  {
    id: 'propuesta-2',
    tag: 'OPCIÓN 02 · QUIET LUXURY MONOCROMÁTICO',
    name: 'Greige Cashmere & Ébano Mate',
    subtitle:
      'Ultra-Minimalista y Desaturado · Tonos Lino, Arena Seda y Negro Carbón Mate',
    colors: {
      canvas: '#EFECE6',
      surface: '#E4DFD5',
      accentBlock: '#181715',
      accentBlockText: '#EFECE6',
      textPrimary: '#181715',
      textSecondary: '#6E685F',
      border: '#D8D2C7',
      pillBg: '#DCD6CA',
      pillText: '#181715',
    },
  },
  {
    id: 'propuesta-3',
    tag: 'OPCIÓN 03 · GALERÍA EDITORIAL 50 / 50',
    name: 'Carbón Mate & Lino Crudo',
    subtitle:
      'Alternancia Limpia de Secciones en Carbón Mate (#161615) y Secciones en Lino Crudo (#F5F3EE)',
    colors: {
      canvas: '#F5F3EE',
      surface: '#EBE8E0',
      accentBlock: '#161615',
      accentBlockText: '#F5F3EE',
      textPrimary: '#161615',
      textSecondary: '#706C65',
      border: '#E2DED5',
      pillBg: '#DCEBE2',
      pillText: '#1C4A31',
    },
  },
];

export default function PalettesShowcasePage() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [goldIdx, setGoldIdx] = useState(0);

  const active = PROPOSALS[activeIdx];
  const gold = GOLD_VARIANTS[goldIdx];

  const swatches = [
    { label: '1. Piedra Caliza', hex: active.colors.canvas, role: 'Fondo Limpio Base (Cero Blanco)', darkText: true },
    { label: '2. Arena Suave', hex: active.colors.surface, role: 'Tarjetas Redondeadas Sin Bordes', darkText: true },
    { label: '3. Pólder Profundo', hex: active.colors.accentBlock, role: 'Estuche para el Escudo Dorado y CTA', darkText: false },
    { label: `4. ${gold.accentLabel}`, hex: gold.accentHex, role: gold.accentRole, darkText: goldIdx !== 1 },
    { label: '5. Carbón Mate', hex: active.colors.textPrimary, role: 'Tipografía Principal', darkText: false },
  ];

  return (
    <div
      style={{
        backgroundColor: active.colors.canvas,
        color: active.colors.textPrimary,
      }}
      className="min-h-screen pt-24 pb-24 transition-colors duration-500"
    >
      <div className="max-w-[1060px] mx-auto px-4 sm:px-8 space-y-8">
        {/* Top Control Panel: Gold Accent Variants for Proposal 1 */}
        <div
          style={{
            backgroundColor: '#181816',
            color: '#F4F2ED',
          }}
          className="p-6 sm:p-7 rounded-2xl space-y-5 shadow-lg"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-[11px] uppercase tracking-[0.22em] text-[#C6B28A] font-semibold block">
                PROPUESTA 01 · INTEGRACIÓN DEL LOGOTIPO DORADO OFICIAL
              </span>
              <h1 className="text-[22px] sm:text-[26px] font-bold tracking-tight mt-1">
                ¿Cómo convive el Escudo Dorado con el Minimalismo Limpio?
              </h1>
            </div>
            <a
              href="/Propuesta_Paletas_Cuadra_Imperial_Loy.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-full border border-white/25 text-[12px] font-semibold hover:bg-white/10 transition-all self-start md:self-auto"
            >
              Descargar PDF ↓
            </a>
          </div>

          {/* 3 Gold Variant Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {GOLD_VARIANTS.map((v, i) => {
              const isSelected = i === goldIdx;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setGoldIdx(i)}
                  style={{
                    backgroundColor: isSelected ? '#C6B28A' : 'rgba(255,255,255,0.05)',
                    color: isSelected ? '#181816' : '#F4F2ED',
                    borderColor: isSelected ? '#C6B28A' : 'rgba(255,255,255,0.14)',
                  }}
                  className="text-left p-4 rounded-xl border transition-all"
                >
                  <div className="text-[10px] uppercase tracking-[0.16em] font-bold opacity-80">
                    {v.badge}
                  </div>
                  <div className="text-[14px] font-bold mt-1 leading-snug">
                    {v.title.split('+')[0]}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Gold Variant Explanation */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-[14px] font-semibold text-[#C6B28A]">
              {gold.title}
            </div>
            <p className="text-[13px] text-white/80 mt-1.5 leading-relaxed">
              {gold.description}
            </p>
          </div>
        </div>

        {/* Swatches Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {swatches.map((sw) => (
            <div
              key={sw.label}
              style={{
                backgroundColor: sw.hex,
                color: sw.darkText ? '#181816' : '#F4F2ED',
                borderColor: active.colors.border,
              }}
              className="rounded-xl p-4 h-28 flex flex-col justify-between border shadow-sm"
            >
              <div>
                <div className="text-[13px] font-bold leading-tight">
                  {sw.label}
                </div>
                <div className="text-[11px] opacity-75 mt-1 leading-snug">{sw.role}</div>
              </div>
              <span className="text-[12px] font-mono font-semibold opacity-90">{sw.hex}</span>
            </div>
          ))}
        </div>

        {/* Live Minimalist Landing Preview with Official Golden Crest */}
        <div className="space-y-6 bg-[#F4F2ED] p-5 sm:p-8 rounded-3xl border border-black/5">
          {/* 1. Top Clean Brand Card with Official Golden Crest */}
          <div
            style={{
              backgroundColor: active.colors.accentBlock,
              color: active.colors.accentBlockText,
            }}
            className="rounded-2xl py-8 px-6 text-center flex flex-col items-center gap-2.5 transition-all"
          >
            <img
              src="/brand/Logotipo_Cuadra_Imperial_Loy_isotipo_degradado.svg"
              alt="Cuadra Imperial Loy Escudo Dorado Oficial"
              style={{ filter: gold.logoFilter }}
              className="w-16 h-16 object-contain transition-all duration-300"
            />
            <div className="text-[22px] sm:text-[26px] font-bold tracking-[0.16em] uppercase mt-1">
              CUADRA IMPERIAL LOY
            </div>
            <div
              style={{ backgroundColor: gold.dividerOnGreen }}
              className="w-10 h-[1px] my-0.5 transition-colors duration-300"
            />
            <div
              style={{ color: gold.kickerOnGreen }}
              className="text-[11px] uppercase tracking-[0.28em] font-semibold transition-colors duration-300"
            >
              EQUINE COLLECTION · KFPS ROYAL FRIESIAN
            </div>
          </div>

          {/* 2. Clean Rounded Photo (Zero corner brackets, zero clutter) */}
          <div
            style={{
              backgroundColor: active.colors.surface,
              borderColor: active.colors.border,
            }}
            className="rounded-2xl overflow-hidden border aspect-[4/3] relative"
          >
            <img
              src="/images/horses/Yde/Yde_1.jpg"
              alt="Yde fan de Kamp"
              className="w-full h-full object-contain"
            />
            <span className="absolute bottom-4 left-4 px-3.5 py-1.5 rounded-full bg-black/70 text-white text-[12px] inline-flex items-center gap-2">
              <span
                style={{ backgroundColor: gold.accentHex }}
                className="w-2 h-2 rounded-full inline-block"
              />
              cuadraimperialloy
            </span>
          </div>

          {/* 3. Clean Title + Status Pill + KFPS Predicate Pill */}
          <div className="flex flex-wrap items-start justify-between gap-4 pt-2">
            <div>
              <h2 className="text-[34px] sm:text-[42px] font-bold tracking-tight leading-none uppercase">
                YDE FAN DE KAMP
              </h2>
              <p
                style={{ color: gold.metaText }}
                className="text-[13px] uppercase tracking-[0.14em] font-semibold mt-2 transition-colors"
              >
                202301054 · FRISÓN KFPS · PAÍSES BAJOS
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                style={{
                  backgroundColor: gold.kfpsPillBg,
                  color: gold.kfpsPillText,
                  borderColor: gold.kfpsPillBorder,
                }}
                className="px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-all"
              >
                Full Paper · 2e premie
              </span>
              <span
                style={{
                  backgroundColor: active.colors.pillBg,
                  color: active.colors.pillText,
                }}
                className="px-4 py-1.5 rounded-full text-[13px] font-semibold"
              >
                Disponible
              </span>
            </div>
          </div>

          {/* 4. Minimalist Spec Cards (Soft rounded, zero borders) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[19px] font-semibold">
                Características principales
              </h3>
              <span
                style={{ color: gold.metaText }}
                className="text-[11px] uppercase tracking-[0.16em] font-semibold"
              >
                EXPEDIENTE VERIFICADO KFPS
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { k: 'Raza', v: 'Frisón KFPS' },
                { k: 'Edad', v: '3 años 7 meses' },
                { k: 'Sexo', v: 'Macho entero' },
                { k: 'Altura', v: '1.72 m' },
                { k: 'Padre (Sire)', v: 'Wolter 513' },
                { k: 'Abuelo Materno', v: 'Eise 489' },
              ].map((item) => (
                <div
                  key={item.k}
                  style={{ backgroundColor: active.colors.surface }}
                  className="rounded-xl p-4"
                >
                  <span
                    style={{ color: active.colors.textSecondary }}
                    className="text-[13px] block"
                  >
                    {item.k}
                  </span>
                  <strong className="text-[17px] font-semibold mt-0.5 block">
                    {item.v}
                  </strong>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Clean Bottom CTA Card */}
          <div
            style={{
              backgroundColor: active.colors.accentBlock,
              color: active.colors.accentBlockText,
            }}
            className="rounded-2xl p-7 sm:p-9 space-y-5"
          >
            <div>
              <h3 className="text-[24px] sm:text-[28px] font-bold">
                ¿Te interesa este ejemplar?
              </h3>
              <p className="text-[15px] opacity-80 mt-2 max-w-xl leading-relaxed">
                El precio se proporciona bajo solicitud. Nuestro equipo puede
                asesorarte y coordinar una presentación privada en Zapotlanejo.
              </p>
            </div>
            <Link
              href="/es/ejemplares/yde"
              style={{
                backgroundColor: active.colors.canvas,
                color: active.colors.textPrimary,
              }}
              className="w-full h-[52px] rounded-xl font-semibold text-[14px] uppercase tracking-[0.14em] flex items-center justify-center hover:opacity-95 transition-opacity"
            >
              SOLICITAR INFORMACIÓN
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
