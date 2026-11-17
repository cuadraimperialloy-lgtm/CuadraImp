'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Volume2, VolumeX, Play } from 'lucide-react';
import { useGallery } from '@/context/GalleryContext';
import {
  AccordionItem,
  DynamicScheduleMicrocopy,
  Eyebrow,
  GalleryLink,
  PrimaryButton,
  SecondaryButton,
  SplitHeading,
  StatusTag,
} from '@/components/ui/Primitives';
import { Reveal } from '@/components/ui/MotionPrimitives';
import { HorseCard } from '@/components/ui/HorseCard';

const HERO_SHOWCASE = [
  {
    name: 'Yde fan de Kamp',
    code: 'YDE',
    slug: 'yde',
    tagEs: 'Wolter 513 (AA) × Eise 489 (Sport-Elite AAA) · 1.72 m · Full Paper',
    tagEn: 'Wolter 513 (AA) × Eise 489 (Sport-Elite AAA) · 1.72 m · Full Paper',
    photo: '/images/horses/Yde/Yde_1.jpg',
    video: '/images/horses/Yde/Yde_Trote.mp4',
  },
  {
    name: 'Xavi fan Veldzicht',
    code: 'XAV',
    slug: 'xavi',
    tagEs: 'Wolter 513 (AA) × Fabe 348 (Sport Pref) · Full Paper',
    tagEn: 'Wolter 513 (AA) × Fabe 348 (Sport Pref) · Full Paper',
    photo: '/images/horses/Xavi/Xavi_1.jpg',
    video: '/images/horses/Xavi/Xavi_1.mp4',
  },
  {
    name: 'Wilco WT fan de Boerdam',
    code: 'WIL',
    slug: 'wilco',
    tagEs: 'Tiede 501 (Sport AAA) × Alwin 469 (Sport Pref AAA) · Ster · Full Paper',
    tagEn: 'Tiede 501 (Sport AAA) × Alwin 469 (Sport Pref AAA) · Ster · Full Paper',
    photo: '/images/horses/Wilco/Wilco_1.jpg',
    video: '/images/horses/Wilco/Wilco_Trote.mp4',
  },
  {
    name: 'Aylan',
    code: 'AYL',
    slug: 'aylan',
    tagEs: 'Hilbrand 525 (Sport AAA) × Hette 481 (Sport AAA) · 1.65 m · 2e premie',
    tagEn: 'Hilbrand 525 (Sport AAA) × Hette 481 (Sport AAA) · 1.65 m · 2e premie',
    photo: '/images/horses/Aylan/Aylan_1.jpg',
    video: '/images/horses/Aylan/Aylan_Trote.mp4',
  },
];

export function HomeView() {
  const router = useRouter();
  const { lang, dict, horses, settings, triggerWhatsApp } = useGallery();
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);
  const [heroSlideIdx, setHeroSlideIdx] = useState(0);
  const [showHeroVideo, setShowHeroVideo] = useState(false);
  const [heroMuted, setHeroMuted] = useState(true);

  const saleHorses = horses
    .filter((h) => h.type === 'sale' && h.status !== 'sold')
    .slice(0, 6);
  const studHorses = horses.filter((h) => h.type === 'stud');
  const videoHorses = horses
    .filter((h) => Boolean(h.mainVideo) && h.mainVideo?.endsWith('.mp4'))
    .slice(0, 4);

  const [selectedCinemaHorseId, setSelectedCinemaHorseId] = useState<string>(
    videoHorses[0]?.id || ''
  );
  const [cinemaPlaying, setCinemaPlaying] = useState(false);

  const activeHero = HERO_SHOWCASE[heroSlideIdx] || HERO_SHOWCASE[0];
  const activeCinemaHorse =
    videoHorses.find((h) => h.id === selectedCinemaHorseId) || videoHorses[0];

  const toggleHeroSound = () => {
    if (!heroVideoRef.current) return;
    const nextMuted = !heroMuted;
    heroVideoRef.current.muted = nextMuted;
    setHeroMuted(nextMuted);
  };

  const previewFaqs = [
    dict.faqPage.items[0],
    dict.faqPage.items[1],
    dict.faqPage.items[6],
    dict.faqPage.items[8],
  ].filter(Boolean);

  return (
    <div className="bg-niebla text-tinta overflow-hidden">
      {/* =====================================================================
          01 · HERO FULL SCREEN (100svh · Video en trote llamativo sin exceso de texto)
          ===================================================================== */}
      <section className="relative w-full min-h-[100svh] flex flex-col justify-end bg-polder text-niebla overflow-hidden">
        {/* Background Video Layer (16:9 Full-Frame Trotting Horse, Head Never Cropped) */}
        <div className="absolute inset-0 z-0">
          <video
            ref={heroVideoRef}
            src="/images/hero-trote.mp4"
            poster="/images/hero-trote-poster.jpg"
            autoPlay
            loop
            muted={heroMuted}
            playsInline
            className="w-full h-full object-cover object-center"
          />

          {/* Subtle Bottom Vignette Only — Keeps the Trotting Horse Clear & Unobstructed */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F1914]/85 via-[#0F1914]/15 to-transparent pointer-events-none" />
        </div>

        {/* Minimal Editorial Impulse Overlay at Bottom */}
        <div className="gallery-container relative z-10 pb-12 lg:pb-16 pt-32 w-full">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-start"
            >
              <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-champagne font-semibold mb-3">
                <span className="w-6 h-[1px] bg-champagne" />
                <span>FRISONES KFPS · PAÍSES BAJOS</span>
              </span>

              <h1 className="font-display-split font-bold uppercase text-niebla text-[36px] sm:text-[50px] lg:text-[60px] leading-[1.02] tracking-[-0.01em]">
                {dict.home.hero.titleStrong}{' '}
                <span className="text-champagne">{dict.home.hero.titleLight}</span>
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-wrap items-center gap-3 shrink-0"
            >
              <a
                href="#coleccion"
                className="inline-flex items-center justify-center h-[52px] px-8 rounded-full bg-niebla text-polder font-semibold text-[12px] uppercase tracking-[0.18em] hover:bg-champagne hover:text-tinta transition-all duration-300 shadow-lg"
              >
                {dict.home.hero.secondaryCta}
              </a>

              <button
                type="button"
                onClick={() =>
                  triggerWhatsApp({
                    intent: 'visit',
                    ctaPosition: 'home_hero_primary',
                  })
                }
                className="inline-flex items-center justify-center h-[52px] px-6 rounded-full bg-[#18120F]/70 backdrop-blur-md border border-[#C6B28A]/35 text-niebla font-semibold text-[12px] uppercase tracking-[0.16em] hover:bg-white/20 transition-all duration-300"
              >
                {dict.home.hero.primaryCta}
              </button>
            </motion.div>
          </div>
        </div>

        {/* Subtle 1px Golden Hairline matching the official logo */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C6B28A]/45 to-transparent pointer-events-none" />
      </section>

      {/* =====================================================================
          02 · COLECCIÓN DE EJEMPLARES DISPONIBLES
          ===================================================================== */}
      <section id="coleccion" className="py-16 lg:py-24 bg-arena/45">
        <div className="gallery-container">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <Eyebrow className="mb-2">
                  {dict.home.collection.eyebrow}
                </Eyebrow>
                <SplitHeading
                  as="h2"
                  size="h2"
                  strong={dict.home.collection.titleStrong}
                  light={dict.home.collection.titleLight}
                />
              </div>
              <GalleryLink href={`/${lang}/ejemplares`}>
                {dict.home.collection.viewAllBtn} →
              </GalleryLink>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {saleHorses.map((horse, index) => (
              <HorseCard
                key={horse.id}
                horse={horse}
                index={index}
                priority={index < 2}
              />
            ))}
          </div>

          <Reveal className="mt-12 flex justify-center">
            <SecondaryButton href={`/${lang}/ejemplares`}>
              {dict.home.collection.viewAllBtn}
            </SecondaryButton>
          </Reveal>
        </div>
      </section>

      {/* =====================================================================
          03 · SEMENTALES PARA MAQUILA (Yente, Wilco y Xavi)
          ===================================================================== */}
      <section className="py-16 lg:py-24 bg-niebla">
        <div className="gallery-container">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <Eyebrow className="mb-2">
                  {dict.home.stallions.eyebrow}
                </Eyebrow>
                <SplitHeading
                  as="h2"
                  size="h2"
                  strong={dict.home.stallions.titleStrong}
                  light={dict.home.stallions.titleLight}
                />
              </div>
              <p className="text-[16px] text-tinta-diluida max-w-md">
                {dict.home.stallions.body}
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {studHorses.map((stallion, idx) => (
              <Reveal key={stallion.id} delay={idx * 0.08}>
                <div
                  onClick={() =>
                    router.push(`/${lang}/ejemplares/${stallion.slug}`)
                  }
                  className="bg-arena rounded-2xl h-full flex flex-col justify-between p-5 sm:p-6 cursor-pointer hover:shadow-sm transition-shadow"
                >
                  <div>
                    <div className="flex items-center justify-between pb-3">
                      <StatusTag label={dict.home.stallions.studOnlyTag} />
                      {stallion.awards.length > 0 ? (
                        <span className="px-3 py-1 rounded-full bg-[#EFE9DC] text-[#756242] border border-[#D8CCB4] text-[11px] font-semibold">
                          {stallion.awards[0]}
                        </span>
                      ) : stallion.fullPaper ? (
                        <span className="px-3 py-1 rounded-full bg-[#EFE9DC] text-[#756242] border border-[#D8CCB4] text-[11px] font-semibold">
                          Full Paper
                        </span>
                      ) : null}
                    </div>

                    <div className="block aspect-[4/3] bg-niebla overflow-hidden rounded-xl">
                      <img
                        src={encodeURI(stallion.coverPhoto)}
                        alt={stallion.name}
                        loading="lazy"
                        className="w-full h-full object-contain bg-niebla hover:scale-[1.015] transition-transform duration-500"
                      />
                    </div>

                    <div className="pt-5">
                      <h3 className="font-display-split font-bold text-[28px] text-tinta uppercase">
                        {stallion.name}
                      </h3>
                      <p className="text-[14px] text-tinta-diluida mt-2 leading-relaxed">
                        {lang === 'es'
                          ? stallion.bloodlineEs
                          : stallion.bloodlineEn}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-linea flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerWhatsApp({
                          intent: 'stud',
                          horses: [
                            {
                              name: stallion.name,
                              code: stallion.code,
                              sire: stallion.sire,
                            },
                          ],
                          ctaPosition: `home_stud_${stallion.code}`,
                        });
                      }}
                      className="text-[12px] uppercase tracking-[0.15em] text-polder font-semibold hover:underline"
                    >
                      {dict.home.stallions.cta} →
                    </button>
                    <span className="text-[12px] text-tinta-diluida hover:text-tinta">
                      {dict.system.viewHorse}
                    </span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          04 · VIDEOS EN LA PISTA (Sección limpia en Café Cuero / Ébano)
          ===================================================================== */}
      {activeCinemaHorse && (
        <section id="en-la-pista" className="relative py-16 lg:py-24 bg-polder text-niebla">
          {/* Subtle Top & Bottom Gold Hairlines */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C6B28A]/45 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C6B28A]/45 to-transparent pointer-events-none" />
          <div className="gallery-container">
            <Reveal>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-champagne font-semibold mb-2">
                    {dict.home.videos.eyebrow}
                  </p>
                  <h2 className="font-display-split h2-fluid font-bold text-niebla">
                    {dict.home.videos.titleStrong}{' '}
                    <span className="text-champagne">
                      {dict.home.videos.titleLight}
                    </span>
                  </h2>
                </div>
                <p className="text-[16px] text-niebla/80">
                  {dict.home.videos.body}
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8">
                <div className="rounded-3xl bg-white/[0.06] border border-white/10 p-4 sm:p-5">
                  <div className="aspect-[4/3] w-full bg-black/40 overflow-hidden rounded-2xl">
                    {cinemaPlaying && activeCinemaHorse.mainVideo ? (
                      <video
                        key={activeCinemaHorse.id}
                        src={encodeURI(activeCinemaHorse.mainVideo)}
                        poster={encodeURI(
                          activeCinemaHorse.videoPoster ||
                            activeCinemaHorse.coverPhoto
                        )}
                        controls
                        autoPlay
                        playsInline
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setCinemaPlaying(true)}
                        className="w-full h-full relative group"
                      >
                        <img
                          src={encodeURI(
                            activeCinemaHorse.videoPoster ||
                              activeCinemaHorse.coverPhoto
                          )}
                          alt={activeCinemaHorse.name}
                          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.015]"
                        />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/35 transition-colors">
                          <span className="w-16 h-16 rounded-full bg-niebla text-polder flex items-center justify-center shadow-lg">
                            <Play className="w-6 h-6 ml-0.5 fill-current" />
                          </span>
                        </span>
                      </button>
                    )}
                  </div>

                  <div className="pt-4 mt-2 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="font-display-split font-bold text-[28px] text-niebla">
                        {activeCinemaHorse.name}
                      </span>
                      {activeCinemaHorse.sire && (
                        <span className="ml-3 text-[13.5px] text-champagne">
                          {dict.horseDetail.sirePrefix} {activeCinemaHorse.sire}
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/${lang}/ejemplares/${activeCinemaHorse.slug}`}
                      className="text-[12px] uppercase tracking-[0.16em] text-champagne font-semibold hover:underline"
                    >
                      {dict.system.viewHorse}
                    </Link>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col gap-3">
                {videoHorses.map((horse) => {
                  const isSelected = horse.id === activeCinemaHorse.id;
                  return (
                    <button
                      key={horse.id}
                      type="button"
                      onClick={() => {
                        setSelectedCinemaHorseId(horse.id);
                        setCinemaPlaying(true);
                      }}
                      className={`p-3.5 border text-left flex items-center gap-4 transition-all rounded-2xl ${
                        isSelected
                          ? 'bg-white/15 border-champagne'
                          : 'bg-white/[0.04] border-white/10 hover:border-white/25'
                      }`}
                    >
                      <div className="w-20 aspect-[4/3] bg-black/40 rounded-xl shrink-0 overflow-hidden">
                        <img
                          src={encodeURI(horse.videoPoster || horse.coverPhoto)}
                          alt={horse.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-display-split font-bold text-[22px] text-niebla leading-tight">
                          {horse.name}
                        </p>
                        {horse.sire && (
                          <p className="text-[12px] text-niebla/70 mt-0.5">
                            {horse.sire}
                          </p>
                        )}
                      </div>
                      <Play className="w-4 h-4 text-champagne shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          05 · LA CITA PRIVADA EN ZAPOTLANEJO + ESTANCIA IMPERIAL LOY
          ===================================================================== */}
      <section className="py-16 lg:py-24 bg-niebla">
        <div className="gallery-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <Reveal className="lg:col-span-6 flex flex-col items-start">
              <Eyebrow className="mb-2">
                {dict.home.privateVisit.eyebrow}
              </Eyebrow>
              <SplitHeading
                as="h2"
                size="h2"
                strong={dict.home.privateVisit.titleStrong}
                light={dict.home.privateVisit.titleLight}
              />
              <p className="mt-4 text-[17px] text-tinta-diluida leading-relaxed">
                {dict.home.privateVisit.body}
              </p>

              <ul className="mt-6 w-full bg-arena divide-y divide-linea px-6 rounded-2xl">
                {dict.home.privateVisit.bullets.map((bullet, i) => (
                  <li
                    key={i}
                    className="py-3.5 text-[15.5px] text-tinta flex items-center gap-3"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-polder shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col items-start gap-2">
                <PrimaryButton
                  href={`/${lang}/cita-privada`}
                  isWhatsAppCta={false}
                >
                  {dict.home.privateVisit.cta}
                </PrimaryButton>
              </div>
            </Reveal>

            <Reveal delay={0.1} className="lg:col-span-6">
              <div className="bg-arena rounded-3xl p-5 sm:p-6">
                <div className="flex items-center justify-between pb-3 mb-3">
                  <span className="text-[16px] font-semibold text-tinta">
                    {dict.home.privateVisit.estanciaTitle}
                  </span>
                  <StatusTag label={dict.home.privateVisit.estanciaBadge} />
                </div>
                <div className="w-full bg-niebla overflow-hidden rounded-2xl">
                  <img
                    src={encodeURI('/images/Estancia Imperial Loy Render.jpeg')}
                    alt={`${dict.home.privateVisit.estanciaTitle} — ${dict.home.privateVisit.estanciaBadge}`}
                    loading="lazy"
                    className="w-full h-auto object-contain block bg-niebla"
                  />
                </div>
                <p className="mt-3 text-[13px] text-tinta-diluida">
                  {dict.home.privateVisit.estanciaCaption}
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* =====================================================================
          06 · PREGUNTAS FRECUENTES
          ===================================================================== */}
      <section className="py-16 lg:py-24 bg-arena/45">
        <div className="gallery-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <Reveal className="lg:col-span-5">
              <Eyebrow className="mb-2">{dict.home.faqPreview.eyebrow}</Eyebrow>
              <SplitHeading
                as="h2"
                size="h2"
                strong={dict.home.faqPreview.titleStrong}
                light={dict.home.faqPreview.titleLight}
              />
              <div className="mt-6">
                <GalleryLink href={`/${lang}/preguntas`}>
                  {dict.home.faqPreview.viewAllLink}
                </GalleryLink>
              </div>
            </Reveal>

            <Reveal delay={0.08} className="lg:col-span-7">
              <div className="bg-niebla rounded-3xl px-7 py-4">
                {previewFaqs.map((faq, idx) => (
                  <AccordionItem
                    key={idx}
                    title={faq.q}
                    defaultOpen={idx === 0}
                  >
                    <p>{faq.a}</p>
                  </AccordionItem>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
