'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGallery } from '@/context/GalleryContext';
import {
  AccordionItem,
  DynamicScheduleMicrocopy,
  Eyebrow,
  PrimaryButton,
  SecondaryButton,
  SplitHeading,
  StatusTag,
} from '@/components/ui/Primitives';
import { Reveal } from '@/components/ui/MotionPrimitives';
import { buildWhatsAppMessage } from '@/lib/whatsapp';

function CleanPageHeader({
  eyebrow,
  titleStrong,
  titleLight,
  subtitle,
}: {
  eyebrow: string;
  titleStrong: string;
  titleLight: string;
  subtitle?: string;
}) {
  return (
    <section className="bg-arena/65 border-b border-linea pt-28 pb-12 mb-12">
      <div className="gallery-container">
        <Reveal className="max-w-3xl">
          <Eyebrow className="mb-2.5 text-bronce">{eyebrow}</Eyebrow>
          <SplitHeading
            as="h1"
            size="h1"
            strong={titleStrong}
            light={titleLight}
          />
          {subtitle && (
            <p className="mt-4 text-[17px] text-tinta-diluida max-w-prose leading-relaxed">
              {subtitle}
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}

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

/* ==========================================================================
   SEMENTALES (/cuadra-y-sementales) — Solo los sementales reales, sin pasos inventados
   ========================================================================== */
export function StallionsView() {
  const router = useRouter();
  const { lang, dict, horses, triggerWhatsApp } = useGallery();

  const studHorses = useMemo(
    () => horses.filter((h) => h.type === 'stud'),
    [horses]
  );

  return (
    <div className="bg-niebla text-tinta pb-24">
      <CleanPageHeader
        eyebrow={dict.stallionsPage.eyebrow}
        titleStrong={dict.stallionsPage.titleStrong}
        titleLight={dict.stallionsPage.titleLight}
        subtitle={dict.stallionsPage.description}
      />

      <div className="gallery-container space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
          {studHorses.map((stallion, sIdx) => (
            <Reveal key={stallion.id} delay={sIdx * 0.08}>
              <div
                onClick={() =>
                  router.push(`/${lang}/ejemplares/${stallion.slug}`)
                }
                className="h-full flex flex-col justify-between bg-arena rounded-2xl p-5 sm:p-6 cursor-pointer hover:shadow-sm transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <StatusTag label={dict.stallionsPage.studOnlyTag} />
                    {(stallion.fullPaper || stallion.awards.length > 0) && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#EFE9DC] text-[#756242] border border-[#D8CCB4] text-[11px] font-semibold">
                        {stallion.awards.length > 0
                          ? `Full Paper · ${stallion.awards.join(' · ')}`
                          : 'Full Paper · KFPS'}
                      </span>
                    )}
                  </div>

                  <div className="block aspect-[4/3] bg-niebla rounded-xl overflow-hidden">
                    <img
                      src={encodeURI(stallion.coverPhoto)}
                      alt={stallion.name}
                      className="w-full h-full object-contain bg-arena hover:scale-[1.02] transition-transform duration-500"
                    />
                  </div>

                  <div className="pt-5">
                    <h2 className="font-display-split font-bold text-[30px] text-tinta">
                      {stallion.name}
                    </h2>
                    {stallion.sire && (
                      <p className="text-[14px] text-tinta-diluida mt-1">
                        {dict.horseDetail.sirePrefix} {stallion.sire}
                      </p>
                    )}
                    {stallion.heightM && (
                      <p className="text-[14px] text-tinta-diluida tabular-specs mt-0.5">
                        {stallion.heightM.toFixed(2)} m
                      </p>
                    )}
                    <p className="text-[14.5px] text-tinta-diluida mt-3 leading-relaxed">
                      {lang === 'es'
                        ? stallion.bloodlineEs
                        : stallion.bloodlineEn}
                    </p>
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-linea flex flex-col gap-3">
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="w-full"
                  >
                    <PrimaryButton
                      className="w-full"
                      onClick={() =>
                        triggerWhatsApp({
                          intent: 'stud',
                          horses: [
                            {
                              name: stallion.name,
                              code: stallion.code,
                              sire: stallion.sire,
                            },
                          ],
                          ctaPosition: `stallions_card_${stallion.code}`,
                        })
                      }
                    >
                      {dict.stallionsPage.quoteBtn}
                    </PrimaryButton>
                  </div>

                  <span className="text-center text-[12px] font-semibold uppercase tracking-[0.15em] text-bronce hover:text-tinta transition-colors pt-1">
                    {dict.system.viewHorse}
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Real Estancia Imperial Loy Render & 3 Data Cards from cuadraimperialloy.com */}
        <Reveal className="bg-arena rounded-3xl p-7 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-5">
            <Eyebrow className="text-bronce">
              {lang === 'es'
                ? 'LA CUADRA · ZAPOTLANEJO, JALISCO'
                : 'THE STABLE · ZAPOTLANEJO, JALISCO'}
            </Eyebrow>
            <h2 className="font-display-split font-bold text-[34px] text-tinta leading-tight uppercase">
              {dict.home.privateVisit.estanciaTitle}
            </h2>
            <p className="text-[15.5px] text-tinta-diluida leading-relaxed">
              {dict.stablePage.p1}
            </p>
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-niebla rounded-xl p-3.5">
                <span className="block text-[10px] uppercase tracking-[0.16em] text-tinta-diluida">
                  {lang === 'es' ? 'Ubicación' : 'Location'}
                </span>
                <strong className="text-[14px] font-semibold text-tinta block mt-1">
                  Zapotlanejo, Jal.
                </strong>
              </div>
              <div className="bg-niebla rounded-xl p-3.5">
                <span className="block text-[10px] uppercase tracking-[0.16em] text-tinta-diluida">
                  {lang === 'es' ? 'Desde GDL' : 'From GDL'}
                </span>
                <strong className="text-[14px] font-semibold text-tinta block mt-1 tabular-specs">
                  38 minutos
                </strong>
              </div>
              <div className="bg-niebla rounded-xl p-3.5">
                <span className="block text-[10px] uppercase tracking-[0.16em] text-tinta-diluida">
                  {lang === 'es' ? 'Atención' : 'Visits'}
                </span>
                <strong className="text-[14px] font-semibold text-tinta block mt-1">
                  {lang === 'es' ? 'Cita Privada' : 'By Appointment'}
                </strong>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="relative rounded-2xl overflow-hidden bg-niebla">
              <img
                src={encodeURI('/images/Estancia Imperial Loy Render.jpeg')}
                alt="Render arquitectónico de Estancia Imperial Loy en Zapotlanejo, Jalisco"
                className="w-full h-auto object-contain block bg-niebla"
              />
              <div className="px-4 py-2.5 bg-polder text-niebla flex items-center justify-between text-[11px] uppercase tracking-[0.16em]">
                <span className="text-champagne font-semibold">
                  {dict.home.privateVisit.estanciaBadge}
                </span>
                <span>Ayotlán, Jal.</span>
              </div>
            </div>
            <p className="mt-2.5 text-[13px] text-tinta-diluida">
              {dict.home.privateVisit.estanciaCaption}
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

/* ==========================================================================
   GARANTÍA Y ENVÍOS (/garantia) — Conciso, sin zonas ni servicios inventados
   ========================================================================== */
export function GuaranteeView() {
  const { lang, dict, settings, triggerWhatsApp } = useGallery();

  return (
    <div className="bg-niebla text-tinta pb-24">
      <CleanPageHeader
        eyebrow={dict.guaranteePage.eyebrow}
        titleStrong={dict.guaranteePage.titleStrong}
        titleLight={dict.guaranteePage.titleLight}
        subtitle={dict.guaranteePage.subtitle}
      />

      <div className="gallery-container space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dict.guaranteePage.pillars.map((pillar, idx) => (
            <Reveal key={idx} delay={idx * 0.08}>
              <div className="h-full bg-arena rounded-2xl p-6 sm:p-7 flex flex-col justify-between gap-4">
                <div>
                  <span className="text-[12px] font-semibold uppercase tracking-[0.18em] text-bronce tabular-specs">
                    0{idx + 1}
                  </span>
                  <h2 className="text-[20px] font-semibold text-tinta mt-2">
                    {pillar.title}
                  </h2>
                  <p className="text-[15.5px] text-tinta-diluida leading-relaxed mt-2.5">
                    {pillar.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="bg-polder text-niebla rounded-3xl p-8 sm:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.2em] text-champagne font-semibold mb-2">
              {dict.guaranteePage.shipping.eyebrow}
            </p>
            <h2 className="font-display-split font-bold text-[32px] sm:text-[38px] text-niebla leading-tight uppercase">
              {dict.guaranteePage.shipping.titleStrong}{' '}
              <span className="font-light text-champagne">
                {dict.guaranteePage.shipping.titleLight}
              </span>
            </h2>
            <p className="mt-3 text-[16px] text-niebla/85 leading-relaxed">
              {dict.guaranteePage.shipping.body}
            </p>
          </div>
          <div className="shrink-0 flex flex-col items-start lg:items-end gap-2">
            <button
              type="button"
              onClick={() =>
                triggerWhatsApp({
                  intent: 'shipping',
                  ctaPosition: 'guarantee_shipping_quote',
                })
              }
              className="h-[52px] px-7 bg-niebla text-tinta hover:bg-arena font-semibold text-[12px] uppercase tracking-[0.16em] rounded-xl transition-colors"
            >
              {dict.guaranteePage.shipping.cta}
            </button>
            <DynamicScheduleMicrocopy
              lang={lang}
              settings={settings}
              className="!text-niebla/70"
            />
          </div>
        </Reveal>
      </div>
    </div>
  );
}

/* ==========================================================================
   CITA PRIVADA (/cita-privada)
   ========================================================================== */
export function PrivateVisitView() {
  const { lang, dict, horses, settings, triggerWhatsApp } = useGallery();

  const eligibleHorses = useMemo(
    () =>
      horses.filter(
        (h) => h.status === 'available' || h.status === 'en_route'
      ),
    [horses]
  );

  const [name, setName] = useState('');
  const [lada, setLada] = useState('+52');
  const [phone, setPhone] = useState('');
  const [selectedHorseSlugs, setSelectedHorseSlugs] = useState<string[]>([]);
  const [undecided, setUndecided] = useState(false);
  const [preferredDay, setPreferredDay] = useState('');
  const [partySize, setPartySize] = useState('2');
  const [bringingVet, setBringingVet] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [error, setError] = useState('');

  const chosenHorses = useMemo(
    () => eligibleHorses.filter((h) => selectedHorseSlugs.includes(h.slug)),
    [eligibleHorses, selectedHorseSlugs]
  );

  const toggleHorseSlug = (slug: string) => {
    setUndecided(false);
    setSelectedHorseSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const livePreviewMessage = useMemo(() => {
    return buildWhatsAppMessage({
      intent: 'visit',
      horses: undecided
        ? []
        : chosenHorses.map((h) => ({
            name: h.name,
            code: h.code,
            sire: h.sire,
          })),
      lang,
      fields: {
        name: name.trim() || undefined,
        preferredDay: preferredDay || undefined,
        partySize: partySize || undefined,
        bringingVetOrTrainer: bringingVet,
      },
      page: `/${lang}/cita-privada`,
    });
  }, [
    undecided,
    chosenHorses,
    lang,
    name,
    preferredDay,
    partySize,
    bringingVet,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return;
    if (!name.trim() || !phone.trim() || !privacyAccepted) {
      setError(dict.system.fieldError);
      return;
    }
    setError('');

    await triggerWhatsApp({
      intent: 'visit',
      horses: undecided
        ? []
        : chosenHorses.map((h) => ({
            name: h.name,
            code: h.code,
            sire: h.sire,
          })),
      fields: {
        name: name.trim(),
        whatsapp: `${lada} ${phone.trim()}`,
        preferredDay: preferredDay || undefined,
        partySize: partySize || undefined,
        bringingVetOrTrainer: bringingVet,
      },
      ctaPosition: 'private_visit_form',
    });
  };

  return (
    <div className="bg-niebla text-tinta pb-24">
      <CleanPageHeader
        eyebrow={dict.privateVisitPage.eyebrow}
        titleStrong={dict.privateVisitPage.titleStrong}
        titleLight={dict.privateVisitPage.titleLight}
        subtitle={dict.privateVisitPage.subtitle}
      />

      <div className="gallery-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-7 bg-arena/65 rounded-2xl p-6 sm:p-8 space-y-6"
            noValidate
          >
            <input
              type="text"
              name="website_url"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[12px] uppercase tracking-[0.14em] text-tinta-diluida mb-2">
                  {dict.privateVisitPage.form.nameLabel}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={dict.privateVisitPage.form.namePlaceholder}
                  className="w-full h-[48px] px-4 bg-niebla border border-linea text-[15px] text-tinta focus:border-polder outline-none rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[12px] uppercase tracking-[0.14em] text-tinta-diluida mb-2">
                  {dict.privateVisitPage.form.whatsappLabel}
                </label>
                <div className="flex gap-2">
                  <select
                    value={lada}
                    onChange={(e) => setLada(e.target.value)}
                    aria-label="Lada"
                    className="h-[48px] px-3 bg-niebla border border-linea text-[14px] text-tinta focus:border-polder outline-none rounded-xl tabular-specs"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={dict.privateVisitPage.form.whatsappPlaceholder}
                    className="flex-1 h-[48px] px-4 bg-niebla border border-linea text-[15px] text-tinta focus:border-polder outline-none rounded-xl tabular-specs"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[12px] uppercase tracking-[0.14em] text-tinta-diluida mb-2.5">
                {dict.privateVisitPage.form.horsesLabel}
              </label>
              <div className="flex flex-wrap gap-2">
                {eligibleHorses.map((h) => {
                  const active = selectedHorseSlugs.includes(h.slug);
                  return (
                    <button
                      key={h.slug}
                      type="button"
                      onClick={() => toggleHorseSlug(h.slug)}
                      className={`px-3.5 py-2 text-[13px] rounded-xl border transition-colors ${
                        active
                          ? 'border-polder bg-polder text-niebla font-medium'
                          : 'border-linea bg-niebla text-tinta hover:border-tinta/40'
                      }`}
                    >
                      {h.name}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => {
                    setUndecided((v) => !v);
                    setSelectedHorseSlugs([]);
                  }}
                  className={`px-3.5 py-2 text-[13px] rounded-xl border transition-colors ${
                    undecided
                      ? 'border-polder bg-polder text-niebla font-medium'
                      : 'border-linea bg-niebla text-tinta-diluida hover:border-tinta/40'
                  }`}
                >
                  {dict.privateVisitPage.form.undecidedOption}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
              <div className="sm:col-span-8">
                <label className="block text-[12px] uppercase tracking-[0.14em] text-tinta-diluida mb-2.5">
                  {dict.privateVisitPage.form.preferredDayLabel}
                </label>
                <div className="flex flex-wrap gap-2">
                  {dict.privateVisitPage.form.dayChips.map((chip) => {
                    const active = preferredDay === chip;
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setPreferredDay(active ? '' : chip)}
                        className={`px-3.5 py-2 text-[12px] rounded-xl border transition-colors ${
                          active
                            ? 'border-polder bg-polder text-niebla font-medium'
                            : 'border-linea bg-niebla text-tinta-diluida hover:border-tinta/40'
                        }`}
                      >
                        {chip}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[12px] uppercase tracking-[0.14em] text-tinta-diluida mb-2.5">
                  {dict.privateVisitPage.form.partySizeLabel}
                </label>
                <select
                  value={partySize}
                  onChange={(e) => setPartySize(e.target.value)}
                  className="w-full h-[46px] px-3.5 bg-niebla border border-linea text-[15px] text-tinta focus:border-polder outline-none rounded-xl tabular-specs"
                >
                  {['1', '2', '3', '4', '5+'].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <label className="flex items-start gap-3 text-[14px] text-tinta cursor-pointer">
                <input
                  type="checkbox"
                  checked={bringingVet}
                  onChange={(e) => setBringingVet(e.target.checked)}
                  className="mt-1 accent-polder"
                />
                <span>{dict.privateVisitPage.form.vetCheckbox}</span>
              </label>

              <label className="flex items-start gap-3 text-[14px] text-tinta cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  className="mt-1 accent-polder"
                />
                <span>
                  {dict.privateVisitPage.form.privacyCheckbox} (
                  <Link
                    href={`/${lang}/privacidad`}
                    className="underline text-tinta-diluida hover:text-tinta"
                  >
                    {dict.dossierDrawer.privacyLink}
                  </Link>
                  )
                </span>
              </label>
            </div>

            <div className="bg-niebla p-4 rounded-xl border border-linea">
              <p className="text-[11px] uppercase tracking-[0.16em] text-bronce font-semibold mb-1.5">
                {dict.privateVisitPage.form.messagePreviewLabel}
              </p>
              <p className="text-[14px] text-tinta leading-relaxed">
                {livePreviewMessage}
              </p>
            </div>

            {error && (
              <p className="text-[14px] text-tinta font-medium">{error}</p>
            )}

            <div className="flex flex-col items-start gap-2.5">
              <PrimaryButton type="submit">
                {dict.privateVisitPage.form.submitCta}
              </PrimaryButton>
              <p className="text-[13px] text-tinta-diluida">
                {dict.privateVisitPage.form.microcopy}
              </p>
              <DynamicScheduleMicrocopy lang={lang} settings={settings} />
            </div>
          </form>

          <aside className="lg:col-span-5 bg-arena rounded-2xl p-7 space-y-6">
            <div>
              <Eyebrow className="mb-2 text-bronce">
                {dict.privateVisitPage.rightColumn.eyebrow}
              </Eyebrow>
              <h2 className="font-display-split font-bold text-[30px] text-tinta">
                {dict.privateVisitPage.rightColumn.locationTitle}
              </h2>
              <p className="text-[14px] text-tinta-diluida mt-1">
                {dict.privateVisitPage.rightColumn.locationSub}
              </p>
            </div>

            <ul className="divide-y divide-linea border-t border-b border-linea">
              {dict.privateVisitPage.rightColumn.features.map((feat, i) => (
                <li
                  key={i}
                  className="py-3.5 text-[15px] text-tinta flex items-center justify-between gap-4"
                >
                  <span>{feat}</span>
                  <span className="text-[11px] text-bronce font-semibold tabular-specs">
                    0{i + 1}
                  </span>
                </li>
              ))}
            </ul>

            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-tinta-diluida mb-1">
                {dict.privateVisitPage.rightColumn.scheduleLabel}
              </p>
              <p className="text-[14px] text-tinta">
                {dict.contactPage.scheduleValue}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   PREGUNTAS (/preguntas)
   ========================================================================== */
export function FaqView() {
  const { lang, dict, settings, triggerWhatsApp } = useGallery();

  return (
    <div className="bg-niebla text-tinta pb-24">
      <CleanPageHeader
        eyebrow={dict.faqPage.eyebrow}
        titleStrong={dict.faqPage.titleStrong}
        titleLight={dict.faqPage.titleLight}
        subtitle={dict.faqPage.subtitle}
      />

      <div className="gallery-container">
        <div className="max-w-4xl">
          {dict.faqPage.items.map((item, idx) => (
            <AccordionItem key={idx} title={item.q} defaultOpen={idx < 2}>
              <p>{item.a}</p>
            </AccordionItem>
          ))}
        </div>

        <Reveal className="mt-12">
          <div className="p-8 bg-arena rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h2 className="text-[21px] font-semibold text-tinta">
                {dict.faqPage.closingTitle}
              </h2>
              <DynamicScheduleMicrocopy
                lang={lang}
                settings={settings}
                className="mt-1"
              />
            </div>
            <PrimaryButton
              onClick={() =>
                triggerWhatsApp({
                  intent: 'general',
                  ctaPosition: 'faq_page_bottom',
                })
              }
            >
              {dict.faqPage.closingCta}
            </PrimaryButton>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

/* ==========================================================================
   LA CUADRA (/la-cuadra) — Con el render completo de Estancia Imperial Loy y los 3 datos clave
   ========================================================================== */
export function StableView() {
  const { lang, dict, settings } = useGallery();

  return (
    <div className="bg-niebla text-tinta pb-24">
      <CleanPageHeader
        eyebrow={dict.stablePage.eyebrow}
        titleStrong={dict.stablePage.titleStrong}
        titleLight={dict.stablePage.titleLight}
      />

      <div className="gallery-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <Reveal className="lg:col-span-6 space-y-5">
            <p className="text-[19px] leading-[1.65] text-tinta">
              {dict.stablePage.p1}
            </p>
            <p className="text-[16.5px] leading-[1.65] text-tinta-diluida">
              {dict.stablePage.p2}
            </p>

            {/* 3 Real Data Cards from cuadraimperialloy.com */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-arena rounded-xl p-4">
                <span className="block text-[10px] uppercase tracking-[0.16em] text-tinta-diluida">
                  {lang === 'es' ? 'Ubicación' : 'Location'}
                </span>
                <strong className="text-[15px] font-semibold text-tinta block mt-1">
                  Zapotlanejo, Jal.
                </strong>
              </div>
              <div className="bg-arena rounded-xl p-4">
                <span className="block text-[10px] uppercase tracking-[0.16em] text-tinta-diluida">
                  {lang === 'es' ? 'Desde GDL' : 'From GDL'}
                </span>
                <strong className="text-[15px] font-semibold text-tinta block mt-1 tabular-specs">
                  38 minutos
                </strong>
              </div>
              <div className="bg-arena rounded-xl p-4">
                <span className="block text-[10px] uppercase tracking-[0.16em] text-tinta-diluida">
                  {lang === 'es' ? 'Atención' : 'Visits'}
                </span>
                <strong className="text-[15px] font-semibold text-tinta block mt-1">
                  {lang === 'es' ? 'Cita Privada' : 'By Appointment'}
                </strong>
              </div>
            </div>

            <div className="pt-3 flex flex-col items-start gap-2.5">
              <PrimaryButton
                href={`/${lang}/cita-privada`}
                isWhatsAppCta={false}
              >
                {dict.stablePage.closingCta}
              </PrimaryButton>
              <DynamicScheduleMicrocopy lang={lang} settings={settings} />
            </div>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-6">
            <div className="bg-arena rounded-2xl p-4 sm:p-5">
              <div className="rounded-xl overflow-hidden bg-niebla">
                <img
                  src={encodeURI('/images/Estancia Imperial Loy Render.jpeg')}
                  alt="Render arquitectónico de Estancia Imperial Loy en Zapotlanejo, Jalisco"
                  className="w-full h-auto object-contain block bg-niebla"
                />
                <div className="px-4 py-3 bg-polder text-niebla flex items-center justify-between text-[11px] uppercase tracking-[0.16em]">
                  <span className="text-champagne font-semibold">
                    {dict.home.privateVisit.estanciaBadge}
                  </span>
                  <span>
                    {dict.home.privateVisit.estanciaTitle} · Ayotlán, Jal.
                  </span>
                </div>
              </div>
              <p className="mt-3 text-[13px] text-tinta-diluida">
                {dict.home.privateVisit.estanciaCaption}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   CONTACTO (/contacto)
   ========================================================================== */
export function ContactView() {
  const { lang, dict, settings, triggerWhatsApp } = useGallery();
  const [visitorLocalNote, setVisitorLocalNote] = useState<string | null>(null);

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz && tz !== 'America/Mexico_City') {
        const now = new Date();
        const localStr = now.toLocaleTimeString(
          lang === 'es' ? 'es-MX' : 'en-US',
          {
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short',
          }
        );
        setVisitorLocalNote(
          lang === 'es'
            ? `(Su hora local actual: ${localStr})`
            : `(Your current local time: ${localStr})`
        );
      }
    } catch {
      // ignore
    }
  }, [lang]);

  return (
    <div className="bg-niebla text-tinta pb-24">
      <CleanPageHeader
        eyebrow={dict.contactPage.eyebrow}
        titleStrong={dict.contactPage.titleStrong}
        titleLight={dict.contactPage.titleLight}
        subtitle={dict.contactPage.quote}
      />

      <div className="gallery-container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Reveal>
            <div className="h-full bg-arena rounded-2xl p-8 flex flex-col justify-between gap-8">
              <div>
                <Eyebrow className="mb-2 text-bronce">
                  {dict.contactPage.whatsappTitle}
                </Eyebrow>
                <p className="font-display-split font-bold text-[36px] text-tinta tabular-specs">
                  {settings.officialWhatsAppDisplay}
                </p>
                <p className="text-[16px] text-tinta-diluida mt-4 leading-relaxed">
                  {dict.contactPage.whatsappBody}
                </p>
              </div>

              <div className="flex flex-col items-start gap-2.5">
                <PrimaryButton
                  onClick={() =>
                    triggerWhatsApp({
                      intent: 'general',
                      ctaPosition: 'contact_page_primary',
                    })
                  }
                >
                  {dict.contactPage.whatsappCta}
                </PrimaryButton>
                <DynamicScheduleMicrocopy lang={lang} settings={settings} />
              </div>
            </div>
          </Reveal>

          <div className="bg-arena/50 rounded-2xl p-8 flex flex-col justify-between gap-6 divide-y divide-linea">
            <div>
              <p className="eyebrow mb-2 text-bronce">
                {dict.contactPage.scheduleTitle}
              </p>
              <p className="text-[16.5px] text-tinta">
                {dict.contactPage.scheduleValue}
              </p>
              {visitorLocalNote && (
                <p className="text-[13px] text-tinta-diluida mt-1">
                  {visitorLocalNote}
                </p>
              )}
            </div>

            <div className="pt-6">
              <p className="eyebrow mb-2 text-bronce">
                {dict.contactPage.locationTitle}
              </p>
              <p className="text-[16.5px] text-tinta">
                {dict.contactPage.locationValue}
              </p>
            </div>

            <div className="pt-6">
              <p className="eyebrow mb-2 text-bronce">
                {dict.contactPage.emailTitle}
              </p>
              <a
                href={`mailto:${settings.officialEmail}`}
                className="text-[16.5px] text-tinta underline"
              >
                {settings.officialEmail}
              </a>
            </div>

            <div className="pt-6">
              <p className="eyebrow mb-3 text-bronce">
                {dict.footer.columns.social}
              </p>
              <div className="flex items-center gap-3">
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  title="Instagram"
                  className="w-10 h-10 rounded-full bg-arena border border-linea text-tinta hover:bg-polder hover:text-champagne hover:border-polder transition-all flex items-center justify-center"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-[18px] h-[18px]"
                    aria-hidden="true"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
                <a
                  href={settings.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  title="TikTok"
                  className="w-10 h-10 rounded-full bg-arena border border-linea text-tinta hover:bg-polder hover:text-champagne hover:border-polder transition-all flex items-center justify-center"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-[17px] h-[17px]"
                    aria-hidden="true"
                  >
                    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
                  </svg>
                </a>
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  title="Facebook"
                  className="w-10 h-10 rounded-full bg-arena border border-linea text-tinta hover:bg-polder hover:text-champagne hover:border-polder transition-all flex items-center justify-center"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-[18px] h-[18px]"
                    aria-hidden="true"
                  >
                    <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5Z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   PRIVACIDAD Y TÉRMINOS (/privacidad, /terminos)
   ========================================================================== */
export function LegalView({ type }: { type: 'privacy' | 'terms' }) {
  const { dict } = useGallery();
  const data = type === 'privacy' ? dict.privacyPage : dict.termsPage;

  return (
    <div className="bg-niebla text-tinta pt-32 pb-24">
      <div className="gallery-container max-w-4xl">
        <div className="pb-12 border-b border-linea">
          <Eyebrow className="mb-3 text-bronce">{data.eyebrow}</Eyebrow>
          <SplitHeading
            as="h1"
            size="h1"
            strong={data.titleStrong}
            light={data.titleLight}
          />
        </div>

        <div className="py-12 space-y-10">
          {data.sections.map((sec, idx) => (
            <div key={idx} className="space-y-3">
              <h2 className="text-[20px] font-semibold text-tinta">
                {sec.title}
              </h2>
              <p className="text-[16px] text-tinta-diluida leading-relaxed max-w-prose">
                {sec.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
