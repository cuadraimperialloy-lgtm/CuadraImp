'use client';

import React, { useMemo, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { useGallery } from '@/context/GalleryContext';
import {
  Eyebrow,
  PrimaryButton,
  SecondaryButton,
  SplitHeading,
} from '@/components/ui/Primitives';
import {
  AnimatedLine,
  ArchitecturalFrame,
  Reveal,
} from '@/components/ui/MotionPrimitives';
import { HorseCard } from '@/components/ui/HorseCard';
import { formatHorseSex, getHorseAgeMonths } from '@/lib/utils';
import type { HorseOrigin, HorseSex, HorseStatus } from '@/types';

type SortOption = 'curated' | 'youngest' | 'oldest' | 'tallest';

export function CatalogView() {
  const { lang, dict, horses, settings, triggerWhatsApp } = useGallery();

  const [originFilter, setOriginFilter] = useState<'all' | HorseOrigin>('all');
  const [sexFilter, setSexFilter] = useState<'all' | HorseSex>('all');
  const [onlyFullPaper, setOnlyFullPaper] = useState(false);
  const [onlyWithVideo, setOnlyWithVideo] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | HorseStatus>('all');
  const [sortBy, setSortBy] = useState<SortOption>('curated');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const saleHorses = useMemo(
    () => horses.filter((h) => h.type === 'sale'),
    [horses]
  );

  const filteredHorses = useMemo(() => {
    const list = saleHorses.filter((h) => {
      if (originFilter !== 'all' && h.origin !== originFilter) return false;
      if (sexFilter !== 'all' && h.sex !== sexFilter) return false;
      if (onlyFullPaper && !h.fullPaper) return false;
      if (onlyWithVideo && !h.mainVideo) return false;
      if (statusFilter !== 'all' && h.status !== statusFilter) return false;
      return true;
    });

    const sorted = [...list];
    if (sortBy === 'curated') {
      sorted.sort((a, b) => a.sortOrder - b.sortOrder);
    } else if (sortBy === 'youngest') {
      sorted.sort((a, b) => {
        const mA = getHorseAgeMonths(a.birthDate) ?? 9999;
        const mB = getHorseAgeMonths(b.birthDate) ?? 9999;
        return mA - mB;
      });
    } else if (sortBy === 'oldest') {
      sorted.sort((a, b) => {
        const mA = getHorseAgeMonths(a.birthDate) ?? -1;
        const mB = getHorseAgeMonths(b.birthDate) ?? -1;
        return mB - mA;
      });
    } else if (sortBy === 'tallest') {
      sorted.sort((a, b) => (b.heightM ?? 0) - (a.heightM ?? 0));
    }

    return sorted;
  }, [
    saleHorses,
    originFilter,
    sexFilter,
    onlyFullPaper,
    onlyWithVideo,
    statusFilter,
    sortBy,
  ]);

  const hasActiveFilters =
    originFilter !== 'all' ||
    sexFilter !== 'all' ||
    onlyFullPaper ||
    onlyWithVideo ||
    statusFilter !== 'all' ||
    sortBy !== 'curated';

  const clearFilters = () => {
    setOriginFilter('all');
    setSexFilter('all');
    setOnlyFullPaper(false);
    setOnlyWithVideo(false);
    setStatusFilter('all');
    setSortBy('curated');
  };

  return (
    <div className="bg-niebla text-tinta pb-24">
      {/* CLEAN MINIMALIST CATALOG BANNER */}
      <section className="relative bg-arena/60 pt-28 pb-14 mb-10 overflow-hidden">
        <div className="gallery-container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <Reveal className="lg:col-span-8">
              <Eyebrow className="mb-3">{dict.catalog.eyebrow}</Eyebrow>
              <SplitHeading
                as="h1"
                size="hero"
                strong={dict.catalog.titleStrong}
                light={dict.catalog.titleLight}
              />
              <p className="mt-5 text-[17px] text-tinta-diluida max-w-prose leading-relaxed">
                {dict.catalog.description}
              </p>
              {settings.showCatalogStartingPrice && (
                <p className="mt-3 text-[13px] uppercase tracking-[0.18em] text-bronce font-semibold tabular-specs">
                  {lang === 'es'
                    ? `Ejemplares desde $${settings.catalogStartingPriceMxn.toLocaleString('es-MX')} MXN`
                    : `Horses starting at $${settings.catalogStartingPriceMxn.toLocaleString('en-US')} MXN`}
                </p>
              )}
            </Reveal>

            <Reveal delay={0.12} className="lg:col-span-4 flex lg:justify-end">
              <div className="bg-polder text-niebla rounded-2xl p-5 flex items-center gap-4">
                <img
                  src="/brand/Logotipo_Cuadra_Imperial_Loy_isotipo_degradado.svg"
                  alt=""
                  aria-hidden="true"
                  className="w-11 h-11 object-contain"
                />
                <div className="text-[11px] uppercase tracking-[0.18em] leading-relaxed">
                  <div className="text-champagne font-semibold">EQUINE COLLECTION · KFPS</div>
                  <div className="text-niebla/80">{saleHorses.length} EJEMPLARES REGISTRADOS</div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <div className="gallery-container">
        {/* Desktop Clean Filter Bar */}
        <div className="hidden lg:flex flex-wrap items-center justify-between gap-4 py-4 px-5 bg-arena rounded-2xl mb-10">
          <div className="flex flex-wrap items-center gap-5">
            {/* Origin */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-[0.16em] text-tinta-diluida">
                {dict.catalog.filters.origin}:
              </span>
              <select
                value={originFilter}
                onChange={(e) =>
                  setOriginFilter(e.target.value as 'all' | HorseOrigin)
                }
                aria-label={dict.catalog.filters.origin}
                className="bg-transparent text-[13px] font-medium text-tinta border-b border-linea pb-0.5 focus:border-tinta outline-none"
              >
                <option value="all">{dict.catalog.filters.originAll}</option>
                <option value="Holanda">{dict.system.origin.Holanda}</option>
                <option value="Nacional">{dict.system.origin.Nacional}</option>
              </select>
            </div>

            {/* Sex */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-[0.16em] text-tinta-diluida">
                {dict.catalog.filters.sex}:
              </span>
              <select
                value={sexFilter}
                onChange={(e) =>
                  setSexFilter(e.target.value as 'all' | HorseSex)
                }
                aria-label={dict.catalog.filters.sex}
                className="bg-transparent text-[13px] font-medium text-tinta border-b border-linea pb-0.5 focus:border-tinta outline-none"
              >
                <option value="all">{dict.catalog.filters.sexAll}</option>
                <option value="entero">{formatHorseSex('entero', lang)}</option>
                <option value="potro">{formatHorseSex('potro', lang)}</option>
                <option value="yegua">{formatHorseSex('yegua', lang)}</option>
              </select>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-[0.16em] text-tinta-diluida">
                {dict.catalog.filters.status}:
              </span>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as 'all' | HorseStatus)
                }
                aria-label={dict.catalog.filters.status}
                className="bg-transparent text-[13px] font-medium text-tinta border-b border-linea pb-0.5 focus:border-tinta outline-none"
              >
                <option value="all">{dict.catalog.filters.statusAll}</option>
                <option value="available">{dict.system.status.available}</option>
                <option value="en_route">{dict.system.status.en_route}</option>
                <option value="reserved">{dict.system.status.reserved}</option>
                <option value="sold">{dict.system.status.sold}</option>
              </select>
            </div>

            {/* Full Paper Toggle */}
            <button
              type="button"
              onClick={() => setOnlyFullPaper((v) => !v)}
              className={`px-3.5 py-1.5 text-[11px] uppercase tracking-[0.15em] font-semibold rounded-full transition-colors ${
                onlyFullPaper
                  ? 'bg-polder text-niebla'
                  : 'bg-niebla text-tinta-diluida hover:text-tinta'
              }`}
            >
              {dict.catalog.filters.fullPaper}
            </button>

            {/* With Video Toggle */}
            <button
              type="button"
              onClick={() => setOnlyWithVideo((v) => !v)}
              className={`px-3.5 py-1.5 text-[11px] uppercase tracking-[0.15em] font-semibold rounded-full transition-colors ${
                onlyWithVideo
                  ? 'bg-polder text-niebla'
                  : 'bg-niebla text-tinta-diluida hover:text-tinta'
              }`}
            >
              {dict.catalog.filters.withVideo}
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-[11px] uppercase tracking-[0.16em] text-bronce font-semibold underline"
              >
                {dict.catalog.filters.clear}
              </button>
            )}
          </div>

          {/* Right side: Count & Sort */}
          <div className="flex items-center gap-6">
            <span className="text-[12px] uppercase tracking-[0.18em] text-tinta-diluida tabular-specs">
              {filteredHorses.length}{' '}
              {filteredHorses.length === 1
                ? dict.catalog.countSingular
                : dict.catalog.countPlural}
            </span>

            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-[0.18em] text-tinta-diluida">
                {dict.catalog.filters.sort}:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label={dict.catalog.filters.sort}
                className="bg-transparent text-[13px] text-tinta border-b border-linea pb-0.5 focus:border-tinta outline-none"
              >
                <option value="curated">
                  {dict.catalog.filters.sortOptions.curated}
                </option>
                <option value="youngest">
                  {dict.catalog.filters.sortOptions.youngest}
                </option>
                <option value="oldest">
                  {dict.catalog.filters.sortOptions.oldest}
                </option>
                <option value="tallest">
                  {dict.catalog.filters.sortOptions.tallest}
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Mobile Filter Trigger Bar */}
        <div className="flex lg:hidden items-center justify-between py-4 border-t border-b border-linea mb-8">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.18em] text-tinta"
          >
            <SlidersHorizontal className="w-4 h-4 stroke-[1.25]" />
            <span>{dict.catalog.filters.mobileFilterBtn}</span>
          </button>
          <span className="text-[12px] uppercase tracking-[0.18em] text-tinta-diluida tabular-specs">
            {filteredHorses.length}{' '}
            {filteredHorses.length === 1
              ? dict.catalog.countSingular
              : dict.catalog.countPlural}
          </span>
        </div>

        {/* Mobile Filters Drawer */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 bg-tinta/25 flex justify-end lg:hidden">
            <div
              className="flex-1"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <div className="w-full max-w-[360px] bg-niebla border-l border-linea h-full p-6 flex flex-col justify-between overflow-y-auto">
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-linea pb-4">
                  <span className="eyebrow">
                    {dict.catalog.filters.mobileFilterBtn}
                  </span>
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(false)}
                    className="p-1 text-tinta"
                  >
                    <X className="w-5 h-5 stroke-[1.25]" />
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.18em] text-tinta-diluida mb-2">
                    {dict.catalog.filters.origin}
                  </label>
                  <select
                    value={originFilter}
                    onChange={(e) =>
                      setOriginFilter(e.target.value as 'all' | HorseOrigin)
                    }
                    className="w-full h-11 px-3 bg-niebla border border-linea text-[14px]"
                  >
                    <option value="all">{dict.catalog.filters.originAll}</option>
                    <option value="Holanda">{dict.system.origin.Holanda}</option>
                    <option value="Nacional">
                      {dict.system.origin.Nacional}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.18em] text-tinta-diluida mb-2">
                    {dict.catalog.filters.sex}
                  </label>
                  <select
                    value={sexFilter}
                    onChange={(e) =>
                      setSexFilter(e.target.value as 'all' | HorseSex)
                    }
                    className="w-full h-11 px-3 bg-niebla border border-linea text-[14px]"
                  >
                    <option value="all">{dict.catalog.filters.sexAll}</option>
                    <option value="entero">
                      {formatHorseSex('entero', lang)}
                    </option>
                    <option value="potro">
                      {formatHorseSex('potro', lang)}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.18em] text-tinta-diluida mb-2">
                    {dict.catalog.filters.status}
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value as 'all' | HorseStatus)
                    }
                    className="w-full h-11 px-3 bg-niebla border border-linea text-[14px]"
                  >
                    <option value="all">{dict.catalog.filters.statusAll}</option>
                    <option value="available">
                      {dict.system.status.available}
                    </option>
                    <option value="en_route">
                      {dict.system.status.en_route}
                    </option>
                    <option value="reserved">
                      {dict.system.status.reserved}
                    </option>
                    <option value="sold">{dict.system.status.sold}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.18em] text-tinta-diluida mb-2">
                    {dict.catalog.filters.sort}
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-full h-11 px-3 bg-niebla border border-linea text-[14px]"
                  >
                    <option value="curated">
                      {dict.catalog.filters.sortOptions.curated}
                    </option>
                    <option value="youngest">
                      {dict.catalog.filters.sortOptions.youngest}
                    </option>
                    <option value="oldest">
                      {dict.catalog.filters.sortOptions.oldest}
                    </option>
                    <option value="tallest">
                      {dict.catalog.filters.sortOptions.tallest}
                    </option>
                  </select>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-2.5 text-[14px] text-tinta">
                    <input
                      type="checkbox"
                      checked={onlyFullPaper}
                      onChange={(e) => setOnlyFullPaper(e.target.checked)}
                      className="accent-polder"
                    />
                    <span>{dict.catalog.filters.fullPaper}</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-[14px] text-tinta">
                    <input
                      type="checkbox"
                      checked={onlyWithVideo}
                      onChange={(e) => setOnlyWithVideo(e.target.checked)}
                      className="accent-polder"
                    />
                    <span>{dict.catalog.filters.withVideo}</span>
                  </label>
                </div>
              </div>

              <div className="pt-6 border-t border-linea flex gap-3">
                <SecondaryButton
                  className="flex-1 !h-[44px] !px-3"
                  onClick={clearFilters}
                >
                  {dict.catalog.filters.clear}
                </SecondaryButton>
                <PrimaryButton
                  showArrow={false}
                  isWhatsAppCta={false}
                  className="flex-1 !h-[44px] !px-3"
                  onClick={() => setMobileFiltersOpen(false)}
                >
                  OK ({filteredHorses.length})
                </PrimaryButton>
              </div>
            </div>
          </div>
        )}

        {/* Horses Grid or Empty State */}
        {filteredHorses.length === 0 ? (
          <div className="py-20 text-center max-w-lg mx-auto flex flex-col items-center gap-6">
            <p className="text-[17px] text-tinta-diluida">
              {dict.catalog.emptyState}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <PrimaryButton
                onClick={() =>
                  triggerWhatsApp({
                    intent: 'general',
                    ctaPosition: 'catalog_empty_state',
                  })
                }
              >
                {dict.catalog.emptyCta}
              </PrimaryButton>
              {hasActiveFilters && (
                <SecondaryButton onClick={clearFilters}>
                  {dict.catalog.filters.clear}
                </SecondaryButton>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
            {filteredHorses.map((horse, idx) => (
              <HorseCard
                key={horse.id}
                horse={horse}
                priority={idx < 4}
                index={idx}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

