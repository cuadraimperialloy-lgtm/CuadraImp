'use client';

import React, { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
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

// Helper to clean parent names removing parentheses: "Wolter 513 (AA)" -> "Wolter 513"
const cleanSireName = (sire: string | null | undefined): string => {
  if (!sire) return '';
  return sire.replace(/\s*\([^)]*\)/g, '').trim();
};

export function CatalogView() {
  const { lang, dict, horses, settings, triggerWhatsApp } = useGallery();

  const [searchQuery, setSearchQuery] = useState('');
  const [sireFilter, setSireFilter] = useState('all');
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

  // List of unique sires formatted without parentheses
  const availableSires = useMemo(() => {
    const set = new Set<string>();
    saleHorses.forEach((h) => {
      const clean = cleanSireName(h.sire);
      if (clean) set.add(clean);
    });
    return Array.from(set).sort();
  }, [saleHorses]);

  const filteredHorses = useMemo(() => {
    const list = saleHorses.filter((h) => {
      if (originFilter !== 'all' && h.origin !== originFilter) return false;
      if (sexFilter !== 'all' && h.sex !== sexFilter) return false;
      if (onlyFullPaper && !h.fullPaper) return false;
      if (onlyWithVideo && !h.mainVideo) return false;
      if (statusFilter !== 'all' && h.status !== statusFilter) return false;

      // Filter by Sire / Padre without parentheses
      if (sireFilter !== 'all') {
        const cleanH = cleanSireName(h.sire);
        if (cleanH !== sireFilter) return false;
      }

      // Search by Horse Name, Code, Sire & Dam without parentheses
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim().replace(/[()]/g, '');
        const nameMatch = h.name.toLowerCase().includes(q);
        const codeMatch = h.code.toLowerCase().includes(q);
        const sireClean = cleanSireName(h.sire).toLowerCase();
        const sireMatch = sireClean.includes(q);
        const damClean = (h.dam || '').toLowerCase().replace(/[()]/g, '');
        const damsireClean = cleanSireName(h.damsire).toLowerCase();
        const damMatch = damClean.includes(q) || damsireClean.includes(q);
        if (!nameMatch && !codeMatch && !sireMatch && !damMatch) return false;
      }

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
    sireFilter,
    searchQuery,
    onlyFullPaper,
    onlyWithVideo,
    statusFilter,
    sortBy,
  ]);

  const hasActiveFilters =
    originFilter !== 'all' ||
    sexFilter !== 'all' ||
    sireFilter !== 'all' ||
    Boolean(searchQuery.trim()) ||
    onlyFullPaper ||
    onlyWithVideo ||
    statusFilter !== 'all' ||
    sortBy !== 'curated';

  const clearFilters = () => {
    setSearchQuery('');
    setSireFilter('all');
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
              {/* Subtle 1px Golden Hairline matching the official logo */}
              <div className="w-24 h-[1px] bg-gradient-to-r from-[#C6B28A]/80 via-[#C6B28A]/40 to-transparent my-4" />

              <p className="text-[17px] text-tinta-diluida max-w-prose leading-relaxed">
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
              <div className="relative bg-polder text-niebla rounded-2xl p-5 flex items-center gap-4 border border-[#C6B28A]/25 shadow-sm overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C6B28A]/45 to-transparent pointer-events-none" />
                <img
                  src="/brand/Logotipo_Cuadra_Imperial_Loy_horizontal_degradado.svg"
                  alt="Cuadra Imperial Loy"
                  className="h-9 sm:h-10 w-auto object-contain"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <div className="gallery-container">
        {/* Desktop Clean Filter Bar */}
        <div className="hidden lg:flex flex-wrap items-center justify-between gap-4 py-3.5 px-5 bg-arena rounded-2xl mb-10 border border-linea">
          <div className="flex flex-wrap items-center gap-4 xl:gap-5">
            {/* Search Input for Horse, Sire, Dam */}
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-tinta-diluida absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'es' ? 'Buscar ejemplar o padre...' : 'Search horse or sire...'}
                className="pl-8 pr-7 py-1.5 bg-niebla border border-linea rounded-full text-[12px] text-tinta placeholder:text-tinta-diluida/70 focus:border-tinta outline-none w-[190px] xl:w-[220px]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-tinta-diluida hover:text-tinta"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Sire / Padre Filter (sin paréntesis) */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-[0.16em] text-tinta-diluida">
                {lang === 'es' ? 'Padre' : 'Sire'}:
              </span>
              <select
                value={sireFilter}
                onChange={(e) => setSireFilter(e.target.value)}
                aria-label={lang === 'es' ? 'Filtrar por padre' : 'Filter by sire'}
                className="bg-transparent text-[13px] font-medium text-tinta border-b border-linea pb-0.5 focus:border-tinta outline-none max-w-[140px] truncate"
              >
                <option value="all">{lang === 'es' ? 'Todos los padres' : 'All Sires'}</option>
                {availableSires.map((sire) => (
                  <option key={sire} value={sire}>
                    {sire}
                  </option>
                ))}
              </select>
            </div>

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

                {/* Mobile Search Input */}
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.18em] text-tinta-diluida mb-2">
                    {lang === 'es' ? 'Búsqueda de ejemplar o padre' : 'Search horse or sire'}
                  </label>
                  <div className="relative flex items-center">
                    <Search className="w-4 h-4 text-tinta-diluida absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={lang === 'es' ? 'Ej. Yde, Wolter, Tiede...' : 'E.g. Yde, Wolter, Tiede...'}
                      className="w-full h-11 pl-9 pr-3 bg-niebla border border-linea text-[14px] text-tinta outline-none"
                    />
                  </div>
                </div>

                {/* Mobile Sire Filter */}
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.18em] text-tinta-diluida mb-2">
                    {lang === 'es' ? 'Padre (Linaje KFPS)' : 'Sire (KFPS Line)'}
                  </label>
                  <select
                    value={sireFilter}
                    onChange={(e) => setSireFilter(e.target.value)}
                    className="w-full h-11 px-3 bg-niebla border border-linea text-[14px]"
                  >
                    <option value="all">{lang === 'es' ? 'Todos los padres' : 'All Sires'}</option>
                    {availableSires.map((sire) => (
                      <option key={sire} value={sire}>
                        {sire}
                      </option>
                    ))}
                  </select>
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

