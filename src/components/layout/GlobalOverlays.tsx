'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import QRCode from 'qrcode';
import Lenis from 'lenis';
import { X, Check, Copy } from 'lucide-react';
import { useGallery } from '@/context/GalleryContext';
import {
  DynamicScheduleMicrocopy,
  Eyebrow,
  GalleryLink,
  PrimaryButton,
  SecondaryButton,
  SplitHeading,
  WhatsAppIcon,
} from '@/components/ui/Primitives';
import {
  calculateHorseAge,
  formatDomaLevel,
  formatHorseSex,
} from '@/lib/utils';
import { buildWhatsAppLink } from '@/lib/whatsapp';

const COUNTRY_CODES = [
  { code: '+52', label: 'MX +52' },
  { code: '+1', label: 'US/CA +1' },
  { code: '+57', label: 'CO +57' },
  { code: '+502', label: 'GT +502' },
  { code: '+504', label: 'HN +504' },
  { code: '+506', label: 'CR +506' },
  { code: '+507', label: 'PA +507' },
  { code: '+34', label: 'ES +34' },
];

export function GlobalOverlays() {
  const {
    lang,
    dict,
    settings,
    // Selection
    selectedHorses,
    removeFromSelection,
    isSelectionDrawerOpen,
    setSelectionDrawerOpen,
    // Dossier
    dossierHorse,
    closeDossierDrawer,
    // WhatsApp
    activeWhatsAppSession,
    closeWhatsAppDrawer,
    triggerWhatsApp,
    // Toast & Cookies
    toastMessage,
    showToast,
    cookieConsent,
    acceptCookies,
    declineCookies,
  } = useGallery();

  // Initialize Lenis smooth scroll (respecting prefers-reduced-motion)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  // Floating WhatsApp pill visibility logic (Section 7.3)
  const [pastHero, setPastHero] = useState(false);
  const [otherCtaVisible, setOtherCtaVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setPastHero(window.scrollY > 560);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Optional URL preview trigger for QA / screenshots
    try {
      const params = new URLSearchParams(window.location.search);
      const preview = params.get('previewDrawer');
      if (preview === 'selection') {
        setSelectionDrawerOpen(true);
      } else if (preview === 'whatsapp') {
        triggerWhatsApp({
          intent: 'horse',
          horses: [{ name: 'Yde', code: 'YDE', sire: null }],
          ctaPosition: 'preview_drawer',
        });
      }
    } catch {
      // ignore
    }

    return () => window.removeEventListener('scroll', onScroll);
  }, [setSelectionDrawerOpen, triggerWhatsApp]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window))
      return;

    const visibleSet = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleSet.add(entry.target);
          } else {
            visibleSet.delete(entry.target);
          }
        });
        setOtherCtaVisible(visibleSet.size > 0);
      },
      { threshold: 0.1 }
    );

    const observeElements = () => {
      const targets = document.querySelectorAll(
        '[data-whatsapp-cta="true"], [data-mobile-sticky="true"]'
      );
      targets.forEach((el) => observer.observe(el));
    };

    observeElements();
    const mutObserver = new MutationObserver(() => {
      observeElements();
    });
    mutObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutObserver.disconnect();
    };
  }, []);

  // Desktop WhatsApp Drawer State
  const [editedMessage, setEditedMessage] = useState('');
  const [qrSvg, setQrSvg] = useState<string>('');
  const [copiedPhone, setCopiedPhone] = useState(false);

  useEffect(() => {
    if (activeWhatsAppSession) {
      setEditedMessage(activeWhatsAppSession.initialMessage);
    }
  }, [activeWhatsAppSession]);

  const liveWhatsAppLink = React.useMemo(() => {
    if (!activeWhatsAppSession) return '';
    return buildWhatsAppLink({
      intent: activeWhatsAppSession.intent,
      horses: activeWhatsAppSession.horses,
      lang,
      fields: activeWhatsAppSession.fields,
      page: activeWhatsAppSession.page,
      source: activeWhatsAppSession.source,
      folio: activeWhatsAppSession.folio,
      officialNumber: settings.officialWhatsApp,
      customMessageOverride: editedMessage,
    }).url;
  }, [activeWhatsAppSession, editedMessage, lang, settings.officialWhatsApp]);

  useEffect(() => {
    if (!liveWhatsAppLink) {
      setQrSvg('');
      return;
    }
    QRCode.toString(liveWhatsAppLink, {
      type: 'svg',
      margin: 1,
      color: {
        dark: '#181816',
        light: '#F4F2ED',
      },
    })
      .then((svg) => setQrSvg(svg))
      .catch(() => setQrSvg(''));
  }, [liveWhatsAppLink]);

  const handleCopyOfficialPhone = () => {
    navigator.clipboard?.writeText(settings.officialWhatsAppDisplay);
    setCopiedPhone(true);
    showToast(dict.system.numberCopied);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  // Dossier Form State
  const [dossierName, setDossierName] = useState('');
  const [dossierPurpose, setDossierPurpose] = useState('');
  const [dossierCity, setDossierCity] = useState('');
  const [dossierLada, setDossierLada] = useState('+52');
  const [dossierPhone, setDossierPhone] = useState('');
  const [dossierConsent, setDossierConsent] = useState(false);
  const [dossierError, setDossierError] = useState('');

  const handleDossierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dossierHorse) return;
    const hasPersonal =
      dossierName.trim().length > 0 || dossierPhone.trim().length > 0;
    if (hasPersonal && !dossierConsent) {
      setDossierError(dict.dossierDrawer.privacyRequiredError);
      return;
    }
    setDossierError('');
    const targetHorse = dossierHorse;
    closeDossierDrawer();
    await triggerWhatsApp({
      intent: 'dossier',
      horses: [
        {
          name: targetHorse.name,
          code: targetHorse.code,
          sire: targetHorse.sire,
        },
      ],
      fields: {
        name: dossierName.trim() || undefined,
        purpose: dossierPurpose || undefined,
        cityCountry: dossierCity.trim() || undefined,
        whatsapp: dossierPhone.trim()
          ? `${dossierLada} ${dossierPhone.trim()}`
          : undefined,
      },
      ctaPosition: 'dossier_drawer',
    });
  };

  // Active (non-sold) horses in selection
  const availableSelectedHorses = selectedHorses.filter(
    (h) => h.status !== 'sold'
  );
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const pathname = usePathname() || '';
  const isHorseDetail =
    pathname.includes('/ejemplares/') &&
    pathname.split('/').filter(Boolean).length >= 3;

  const anyDrawerOpen = Boolean(
    activeWhatsAppSession ||
      isSelectionDrawerOpen ||
      dossierHorse ||
      isCompareModalOpen
  );

  const showFloatingPill = !anyDrawerOpen;

  return (
    <>
      {/* 1. DESKTOP WHATSAPP CONCIERGE MODAL / DRAWER */}
      {activeWhatsAppSession && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center sm:justify-end bg-tinta/40 backdrop-blur-[2px] p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="WhatsApp"
        >
          <div
            className="fixed inset-0"
            onClick={closeWhatsAppDrawer}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-[440px] bg-niebla border border-linea rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            {/* Dark Pólder Green Concierge Header */}
            <div className="bg-polder text-niebla px-6 py-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="relative w-11 h-11 rounded-full bg-champagne/15 border border-champagne/40 flex items-center justify-center text-champagne shrink-0">
                  <WhatsAppIcon className="w-5 h-5" />
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#4FA870] ring-2 ring-polder"
                  />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-champagne font-semibold">
                    {dict.whatsappDrawer.eyebrow}
                  </p>
                  <h2 className="text-[17px] font-semibold text-niebla leading-tight">
                    Cuadra Imperial Loy
                  </h2>
                  <p className="text-[12px] text-niebla/75 tabular-specs">
                    {settings.officialWhatsAppDisplay}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeWhatsAppDrawer}
                aria-label={dict.nav.close}
                className="w-9 h-9 rounded-full bg-white/10 text-niebla/80 hover:text-niebla hover:bg-white/15 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Chat Bubble Editable Message */}
              <div className="bg-arena rounded-2xl p-4 border border-linea">
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="wa-message-preview"
                    className="text-[11px] uppercase tracking-[0.16em] text-bronce font-semibold"
                  >
                    {dict.whatsappDrawer.messagePreviewLabel}
                  </label>
                  <span className="text-[10px] uppercase tracking-[0.16em] text-tinta-diluida tabular-specs">
                    {dict.whatsappDrawer.folioLabel} {activeWhatsAppSession.folio}
                  </span>
                </div>
                <textarea
                  id="wa-message-preview"
                  rows={3}
                  value={editedMessage}
                  onChange={(e) => setEditedMessage(e.target.value)}
                  className="w-full bg-niebla border border-linea p-3 text-[14px] text-tinta leading-relaxed focus:border-polder outline-none rounded-xl resize-none"
                />
              </div>

              {/* Primary CTA: Open WhatsApp Directly */}
              <div className="flex flex-col gap-2">
                <a
                  href={liveWhatsAppLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-2.5 h-[52px] px-6 bg-polder text-niebla text-[12.5px] font-semibold uppercase tracking-[0.15em] rounded-xl transition-opacity hover:opacity-92 w-full shadow-sm"
                >
                  <WhatsAppIcon className="w-4 h-4 text-champagne shrink-0" />
                  <span>{dict.whatsappDrawer.openWebBtn}</span>
                  <span className="ml-1 text-champagne transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </a>
                <DynamicScheduleMicrocopy
                  lang={lang}
                  settings={settings}
                  className="text-center"
                />
              </div>

              {/* Compact QR Code Row for Desktop */}
              <div className="p-4 bg-arena/65 border border-linea rounded-2xl flex items-center gap-4">
                {qrSvg ? (
                  <div
                    className="w-24 h-24 bg-niebla p-2 border border-linea rounded-xl overflow-hidden shrink-0"
                    dangerouslySetInnerHTML={{ __html: qrSvg }}
                  />
                ) : (
                  <div className="w-24 h-24 bg-niebla border border-linea rounded-xl flex items-center justify-center text-[11px] text-tinta-diluida shrink-0">
                    QR
                  </div>
                )}
                <div className="text-left">
                  <p className="text-[12px] font-semibold text-tinta mb-1">
                    {lang === 'es'
                      ? 'Continuar desde su celular'
                      : 'Continue on your phone'}
                  </p>
                  <p className="text-[12px] text-tinta-diluida leading-relaxed">
                    {dict.whatsappDrawer.qrCaption}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer with Copy Number */}
            <div className="px-6 py-4 bg-arena/50 border-t border-linea flex items-center justify-between gap-3">
              <span className="text-[11px] uppercase tracking-[0.14em] text-tinta-diluida">
                {dict.whatsappDrawer.officialNumberLabel}:{' '}
                <strong className="text-tinta tabular-specs">
                  {settings.officialWhatsAppDisplay}
                </strong>
              </span>
              <button
                type="button"
                onClick={handleCopyOfficialPhone}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-niebla border border-linea text-[11px] uppercase tracking-[0.14em] text-tinta hover:border-tinta/40 rounded-lg transition-colors"
              >
                {copiedPhone ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-polder" />
                    <span>{dict.system.copied}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{dict.whatsappDrawer.copyNumberBtn}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. "MI SELECCIÓN" DRAWER (Sección 7.14) */}
      {isSelectionDrawerOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-tinta/25"
          role="dialog"
          aria-modal="true"
          aria-label={dict.selectionDrawer.titleStrong}
        >
          <div
            className="flex-1"
            onClick={() => setSelectionDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="w-full max-w-[460px] bg-niebla border-l border-linea h-full overflow-y-auto p-8 md:p-10 flex flex-col justify-between gap-8">
            <div>
              <div className="flex items-center justify-between border-b border-linea pb-5">
                <Eyebrow>{dict.selectionDrawer.eyebrow}</Eyebrow>
                <button
                  type="button"
                  onClick={() => setSelectionDrawerOpen(false)}
                  aria-label={dict.nav.close}
                  className="p-1.5 text-tinta-diluida hover:text-tinta"
                >
                  <X className="w-5 h-5 stroke-[1.25]" />
                </button>
              </div>

              <div className="pt-6">
                <SplitHeading
                  as="h2"
                  size="h3"
                  strong={dict.selectionDrawer.titleStrong}
                  light={dict.selectionDrawer.titleLight}
                />
              </div>

              {selectedHorses.length === 0 ? (
                <div className="py-16 flex flex-col items-start gap-6">
                  <p className="text-[16px] text-tinta-diluida">
                    {dict.selectionDrawer.emptyState}
                  </p>
                  <SecondaryButton
                    href={`/${lang}/ejemplares`}
                    onClick={() => setSelectionDrawerOpen(false)}
                  >
                    {dict.selectionDrawer.exploreBtn}
                  </SecondaryButton>
                </div>
              ) : (
                <ul className="mt-6 divide-y divide-linea border-t border-b border-linea">
                  {selectedHorses.map((horse) => {
                    const age = calculateHorseAge(horse.birthDate, lang);
                    const isSold = horse.status === 'sold';
                    return (
                      <li
                        key={horse.slug}
                        className="py-4 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <Link
                            href={`/${lang}/ejemplares/${horse.slug}`}
                            onClick={() => setSelectionDrawerOpen(false)}
                            className="w-16 h-20 bg-arena shrink-0 overflow-hidden block rounded-[2px]"
                          >
                            <img
                              src={encodeURI(horse.coverPhoto)}
                              alt={horse.name}
                              className="w-full h-full object-cover"
                            />
                          </Link>
                          <div>
                            <Link
                              href={`/${lang}/ejemplares/${horse.slug}`}
                              onClick={() => setSelectionDrawerOpen(false)}
                              className="font-display-split font-bold text-[22px] text-tinta"
                            >
                              {horse.name}
                            </Link>
                            <p className="text-[13px] text-tinta-diluida tabular-specs">
                              {[
                                horse.sire
                                  ? `${dict.selectionDrawer.sirePrefix} ${horse.sire}`
                                  : null,
                                age,
                                horse.heightM ? `${horse.heightM} m` : null,
                              ]
                                .filter(Boolean)
                                .join(' · ')}
                            </p>
                            {isSold && (
                              <p className="text-[11px] uppercase tracking-[0.14em] text-tinta-diluida mt-1">
                                {dict.selectionDrawer.soldNotice}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromSelection(horse.slug)}
                          className="text-[12px] uppercase tracking-[0.16em] text-tinta-diluida hover:text-tinta"
                        >
                          {dict.selectionDrawer.removeBtn}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {availableSelectedHorses.length > 0 && (
              <div className="border-t border-linea pt-6 flex flex-col gap-4">
                {selectedHorses.length >= 1 && (
                  <SecondaryButton
                    className="w-full"
                    isWhatsAppCta={false}
                    onClick={() => {
                      setSelectionDrawerOpen(false);
                      setIsCompareModalOpen(true);
                    }}
                  >
                    {lang === 'es'
                      ? `Comparar lado a lado (${selectedHorses.length})`
                      : `Compare side by side (${selectedHorses.length})`}
                  </SecondaryButton>
                )}

                <PrimaryButton
                  className="w-full"
                  onClick={() => {
                    setSelectionDrawerOpen(false);
                    triggerWhatsApp({
                      intent: 'selection',
                      horses: availableSelectedHorses.map((h) => ({
                        name: h.name,
                        code: h.code,
                        sire: h.sire,
                      })),
                      ctaPosition: 'selection_drawer_primary',
                    });
                  }}
                >
                  {dict.selectionDrawer.primaryCta}
                </PrimaryButton>

                <div className="text-center">
                  <GalleryLink
                    onClick={() => {
                      setSelectionDrawerOpen(false);
                      triggerWhatsApp({
                        intent: 'visit',
                        horses: availableSelectedHorses.map((h) => ({
                          name: h.name,
                          code: h.code,
                          sire: h.sire,
                        })),
                        ctaPosition: 'selection_drawer_visit',
                      });
                    }}
                  >
                    {dict.selectionDrawer.secondaryCta} →
                  </GalleryLink>
                </div>

                <DynamicScheduleMicrocopy
                  lang={lang}
                  settings={settings}
                  className="text-center"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2B. SIDE-BY-SIDE ARCHITECTURAL HORSE COMPARATOR */}
      {isCompareModalOpen && selectedHorses.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-tinta/40 flex items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={
            lang === 'es'
              ? 'Comparador de ejemplares'
              : 'Side-by-side horse comparison'
          }
        >
          <div className="w-full max-w-[1280px] max-h-[90vh] bg-niebla border border-tinta overflow-y-auto p-6 sm:p-10 rounded-[2px] flex flex-col gap-8">
            <div className="flex items-center justify-between border-b border-linea pb-5">
              <div>
                <Eyebrow>
                  {lang === 'es'
                    ? 'MESA DE COMPARACIÓN · ARCHIVO KFPS'
                    : 'COMPARISON TABLE · KFPS ARCHIVE'}
                </Eyebrow>
                <SplitHeading
                  as="h2"
                  size="h3"
                  strong={
                    lang === 'es' ? 'COMPARATIVA' : 'SIDE-BY-SIDE'
                  }
                  light={
                    lang === 'es' ? 'DE EJEMPLARES' : 'COMPARISON'
                  }
                />
              </div>
              <button
                type="button"
                onClick={() => setIsCompareModalOpen(false)}
                aria-label={dict.nav.close}
                className="p-2 text-tinta-diluida hover:text-tinta border border-linea"
              >
                <X className="w-5 h-5 stroke-[1.25]" />
              </button>
            </div>

            {/* Side-by-Side Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedHorses.map((horse, idx) => {
                const age = calculateHorseAge(horse.birthDate, lang);
                const sex = formatHorseSex(horse.sex, lang);
                const level = formatDomaLevel(horse.level, lang);
                return (
                  <div
                    key={horse.slug}
                    className="relative bg-arena border border-linea p-5 flex flex-col justify-between gap-5 rounded-[2px]"
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-linea pb-2.5 mb-3 text-[11px] uppercase tracking-[0.18em] text-tinta-diluida">
                        <span>
                          0{idx + 1} · {dict.system.origin[horse.origin]}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFromSelection(horse.slug)}
                          className="underline hover:text-tinta"
                        >
                          {dict.selectionDrawer.removeBtn}
                        </button>
                      </div>

                      <Link
                        href={`/${lang}/ejemplares/${horse.slug}`}
                        onClick={() => setIsCompareModalOpen(false)}
                        className="block aspect-[4/3] bg-niebla border border-linea overflow-hidden mb-4"
                      >
                        <img
                          src={encodeURI(horse.coverPhoto)}
                          alt={horse.name}
                          className="w-full h-full object-contain bg-arena"
                        />
                      </Link>

                      <h3 className="font-display-split font-bold text-[32px] text-tinta leading-none mb-4">
                        {horse.name}
                      </h3>

                      <dl className="divide-y divide-linea border-t border-b border-linea text-[13px] tabular-specs">
                        <div className="py-2 flex justify-between">
                          <dt className="text-tinta-diluida">
                            {dict.horseDetail.specs.age}
                          </dt>
                          <dd className="text-tinta font-medium">
                            {age || '—'}
                          </dd>
                        </div>
                        <div className="py-2 flex justify-between">
                          <dt className="text-tinta-diluida">
                            {dict.horseDetail.specs.height}
                          </dt>
                          <dd className="text-tinta font-medium">
                            {horse.heightM ? `${horse.heightM.toFixed(2)} m` : '—'}
                          </dd>
                        </div>
                        <div className="py-2 flex justify-between">
                          <dt className="text-tinta-diluida">
                            {dict.horseDetail.specs.sex}
                          </dt>
                          <dd className="text-tinta font-medium">
                            {sex || '—'}
                          </dd>
                        </div>
                        <div className="py-2 flex justify-between">
                          <dt className="text-tinta-diluida">
                            {lang === 'es' ? 'Padre (Sire)' : 'Sire'}
                          </dt>
                          <dd className="text-tinta font-medium">
                            {horse.sire || '—'}
                          </dd>
                        </div>
                        <div className="py-2 flex justify-between">
                          <dt className="text-tinta-diluida">
                            {lang === 'es'
                              ? 'Abuelo materno'
                              : 'Damsire'}
                          </dt>
                          <dd className="text-tinta font-medium">
                            {horse.damsire || '—'}
                          </dd>
                        </div>
                        <div className="py-2 flex justify-between">
                          <dt className="text-tinta-diluida">
                            {dict.horseDetail.specs.level}
                          </dt>
                          <dd className="text-tinta font-medium">
                            {level || '—'}
                          </dd>
                        </div>
                        {horse.fullPaper && (
                          <div className="py-2 flex justify-between">
                            <dt className="text-tinta-diluida">
                              {dict.horseDetail.specs.fullPaper}
                            </dt>
                            <dd className="text-tinta font-medium">
                              {dict.horseDetail.specs.yes}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>

                    <Link
                      href={`/${lang}/ejemplares/${horse.slug}`}
                      onClick={() => setIsCompareModalOpen(false)}
                      className="text-[12px] uppercase tracking-[0.18em] text-tinta underline text-center"
                    >
                      {dict.system.viewHorse}
                    </Link>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-linea pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <DynamicScheduleMicrocopy lang={lang} settings={settings} />
              <div className="flex flex-wrap items-center gap-4">
                <SecondaryButton
                  isWhatsAppCta={false}
                  onClick={() => setIsCompareModalOpen(false)}
                >
                  {dict.nav.close}
                </SecondaryButton>
                <PrimaryButton
                  onClick={() => {
                    setIsCompareModalOpen(false);
                    triggerWhatsApp({
                      intent: 'selection',
                      horses: availableSelectedHorses.map((h) => ({
                        name: h.name,
                        code: h.code,
                        sire: h.sire,
                      })),
                      ctaPosition: 'compare_modal_primary',
                    });
                  }}
                >
                  {dict.selectionDrawer.primaryCta}
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. EXPEDIENTE POR WHATSAPP DRAWER (Sección 7.5 - sustituye el modal bloqueante) */}
      {dossierHorse && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-tinta/25"
          role="dialog"
          aria-modal="true"
          aria-label={`${dict.dossierDrawer.titlePrefix} ${dossierHorse.name}`}
        >
          <div
            className="flex-1"
            onClick={closeDossierDrawer}
            aria-hidden="true"
          />
          <div className="w-full max-w-[480px] bg-niebla border-l border-linea h-full overflow-y-auto p-8 md:p-10 flex flex-col justify-between gap-8">
            <form onSubmit={handleDossierSubmit} className="flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-linea pb-5">
                <Eyebrow>{dict.dossierDrawer.eyebrow}</Eyebrow>
                <button
                  type="button"
                  onClick={closeDossierDrawer}
                  aria-label={dict.nav.close}
                  className="p-1.5 text-tinta-diluida hover:text-tinta"
                >
                  <X className="w-5 h-5 stroke-[1.25]" />
                </button>
              </div>

              <div>
                <SplitHeading
                  as="h2"
                  size="h3"
                  strong={dict.dossierDrawer.titlePrefix}
                  light={dossierHorse.name}
                />
                <p className="text-[15px] text-tinta-diluida mt-2">
                  {dict.dossierDrawer.description}
                </p>
              </div>

              {/* List only existing documents for this horse */}
              {dossierHorse.availableDocumentTypes.length > 0 && (
                <div className="bg-arena p-4 border border-linea">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-tinta-diluida mb-2">
                    {dict.dossierDrawer.availableDocsLabel}
                  </p>
                  <ul className="space-y-1 text-[14px] text-tinta">
                    {dossierHorse.availableDocumentTypes.map((docType) => (
                      <li key={docType}>
                        · {dict.dossierDrawer.docTypes[docType]}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Optional Name */}
              <div>
                <label className="block text-[12px] uppercase tracking-[0.16em] text-tinta-diluida mb-2">
                  {dict.dossierDrawer.nameLabel}
                </label>
                <input
                  type="text"
                  value={dossierName}
                  onChange={(e) => setDossierName(e.target.value)}
                  placeholder={dict.dossierDrawer.namePlaceholder}
                  className="w-full h-[46px] px-3.5 bg-niebla border border-linea text-[15px] text-tinta focus:border-tinta outline-none rounded-[2px]"
                />
              </div>

              {/* Optional Purpose Chips */}
              <div>
                <label className="block text-[12px] uppercase tracking-[0.16em] text-tinta-diluida mb-2">
                  {dict.dossierDrawer.purposeLabel}
                </label>
                <div className="flex flex-wrap gap-2">
                  {dict.dossierDrawer.purposeChips.map((chip) => {
                    const active = dossierPurpose === chip;
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() =>
                          setDossierPurpose(active ? '' : chip)
                        }
                        className={`px-3.5 py-2 text-[12px] uppercase tracking-[0.14em] border rounded-[2px] transition-colors ${active
                            ? 'border-tinta bg-tinta text-niebla'
                            : 'border-linea text-tinta-diluida hover:border-tinta'
                          }`}
                      >
                        {chip}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional City */}
              <div>
                <label className="block text-[12px] uppercase tracking-[0.16em] text-tinta-diluida mb-2">
                  {dict.dossierDrawer.cityLabel}
                </label>
                <input
                  type="text"
                  value={dossierCity}
                  onChange={(e) => setDossierCity(e.target.value)}
                  placeholder={dict.dossierDrawer.cityPlaceholder}
                  className="w-full h-[46px] px-3.5 bg-niebla border border-linea text-[15px] text-tinta focus:border-tinta outline-none rounded-[2px]"
                />
              </div>

              {/* Optional WhatsApp with Lada selector */}
              <div>
                <label className="block text-[12px] uppercase tracking-[0.16em] text-tinta-diluida mb-2">
                  {dict.dossierDrawer.whatsappLabel}
                </label>
                <div className="flex gap-2">
                  <select
                    value={dossierLada}
                    onChange={(e) => setDossierLada(e.target.value)}
                    aria-label="Lada"
                    className="h-[46px] px-3 bg-niebla border border-linea text-[14px] text-tinta focus:border-tinta outline-none rounded-[2px] tabular-specs"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={dossierPhone}
                    onChange={(e) => setDossierPhone(e.target.value)}
                    placeholder={dict.dossierDrawer.whatsappPlaceholder}
                    className="flex-1 h-[46px] px-3.5 bg-niebla border border-linea text-[15px] text-tinta focus:border-tinta outline-none rounded-[2px] tabular-specs"
                  />
                </div>
              </div>

              {/* Conditional Privacy Consent Checkbox (mandatory only if name or phone entered) */}
              {(dossierName.trim().length > 0 ||
                dossierPhone.trim().length > 0) && (
                  <label className="flex items-start gap-3 text-[13px] text-tinta cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dossierConsent}
                      onChange={(e) => setDossierConsent(e.target.checked)}
                      className="mt-1 accent-polder"
                    />
                    <span>
                      {dict.dossierDrawer.privacyConsent}* (
                      <Link
                        href={`/${lang}/privacidad`}
                        className="underline text-tinta-diluida hover:text-tinta"
                      >
                        {dict.dossierDrawer.privacyLink}
                      </Link>
                      )
                    </span>
                  </label>
                )}

              {dossierError && (
                <p className="text-[13px] text-tinta font-medium">
                  {dossierError}
                </p>
              )}

              <div className="pt-2 flex flex-col gap-2.5">
                <PrimaryButton type="submit" className="w-full">
                  {dict.dossierDrawer.submitCta}
                </PrimaryButton>
                <DynamicScheduleMicrocopy
                  lang={lang}
                  settings={settings}
                  className="text-center"
                />
              </div>

              <p className="text-[12px] text-tinta-diluida text-center border-t border-linea pt-4">
                {dict.dossierDrawer.footerNote}{' '}
                <Link
                  href={`/${lang}/privacidad`}
                  className="underline hover:text-tinta"
                >
                  {dict.dossierDrawer.privacyLink}
                </Link>
                .
              </p>
            </form>
          </div>
        </div>
      )}

      {/* 4. MODERN CIRCULAR WHATSAPP BUTTON (NO TEXT, NEVER OVERLAPPING) */}
      {showFloatingPill && (
        <button
          type="button"
          onClick={() =>
            triggerWhatsApp({
              intent: 'general',
              ctaPosition: 'floating_pill',
            })
          }
          aria-label="Contactar por WhatsApp"
          title="WhatsApp"
          className={`group fixed z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#1F8E55] text-white shadow-[0_8px_24px_rgba(31,142,85,0.4)] flex items-center justify-center transition-all duration-300 hover:scale-105 hover:bg-[#1a7a48] hover:shadow-[0_12px_28px_rgba(31,142,85,0.5)] right-5 sm:right-7 ${
            isHorseDetail ? 'bottom-24 lg:bottom-20' : 'bottom-6 sm:bottom-7'
          }`}
        >
          <WhatsAppIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white transition-transform duration-300 group-hover:scale-110" />
        </button>
      )}

      {/* 5. TOAST NOTIFICATION */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-6 z-50 bg-niebla border border-tinta px-5 py-3 text-[12px] uppercase tracking-[0.18em] text-tinta rounded-[2px]"
        >
          {toastMessage}
        </div>
      )}

      {/* 6. LFPDPPP MINIMAL COOKIE BANNER (Sección 7.3) */}
      {cookieConsent === null && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-niebla border-t border-linea py-4 px-6">
          <div className="gallery-container flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-[13px] text-tinta-diluida max-w-3xl">
              {dict.cookieBanner.text}{' '}
              <Link
                href={`/${lang}/privacidad`}
                className="underline text-tinta hover:opacity-80"
              >
                {dict.cookieBanner.privacyLink}
              </Link>
              .
            </p>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={declineCookies}
                className="px-4 py-2 border border-linea text-[11px] uppercase tracking-[0.18em] text-tinta-diluida hover:text-tinta rounded-[2px]"
              >
                {dict.cookieBanner.decline}
              </button>
              <button
                type="button"
                onClick={acceptCookies}
                className="px-4 py-2 border border-tinta text-[11px] uppercase tracking-[0.18em] text-tinta hover:bg-tinta/5 rounded-[2px]"
              >
                {dict.cookieBanner.accept}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

