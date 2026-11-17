'use client';

import React from 'react';
import Link from 'next/link';
import { useGallery } from '@/context/GalleryContext';
import { getDynamicScheduleStatus } from '@/lib/schedule';
import { WhatsAppIcon } from '@/components/ui/Primitives';

export function Footer() {
  const { lang, dict, settings, triggerWhatsApp } = useGallery();
  const scheduleStatus = getDynamicScheduleStatus(lang, settings);

  return (
    <footer className="relative bg-polder text-niebla pt-20 pb-14 border-t border-white/10">
      {/* Subtle 1px Golden Hairline matching the official logo */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C6B28A]/45 to-transparent pointer-events-none" />
      <div className="gallery-container">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          {/* Brand Column (5 cols) — Golden Logo over Deep Pólder Green */}
          <div className="md:col-span-5 flex flex-col gap-5">
            <Link href={`/${lang}`} className="inline-block w-fit">
              <img
                src="/brand/Logotipo_Cuadra_Imperial_Loy_horizontal_degradado.svg"
                alt="Cuadra Imperial Loy"
                className="h-12 w-auto"
              />
            </Link>
            <p className="text-[16px] text-niebla/90 max-w-sm leading-relaxed">
              {dict.footer.tagline}
            </p>
            <p className="text-[12px] uppercase tracking-[0.18em] text-champagne font-medium">
              {dict.footer.originLine}
            </p>
          </div>

          {/* Navigation Column (3 cols) */}
          <div className="md:col-span-3 flex flex-col gap-3">
            <p className="text-[11px] uppercase tracking-[0.22em] text-champagne font-semibold mb-1">
              {dict.footer.columns.navigation}
            </p>
            <Link
              href={`/${lang}/ejemplares`}
              className="text-[15px] text-niebla/75 hover:text-niebla transition-colors"
            >
              {dict.footer.links.horses}
            </Link>
            <Link
              href={`/${lang}/cuadra-y-sementales`}
              className="text-[15px] text-niebla/75 hover:text-niebla transition-colors"
            >
              {dict.footer.links.stallions}
            </Link>
            <Link
              href={`/${lang}/la-cuadra`}
              className="text-[15px] text-niebla/75 hover:text-niebla transition-colors"
            >
              {dict.footer.links.stable}
            </Link>
            <Link
              href={`/${lang}/garantia`}
              className="text-[15px] text-niebla/75 hover:text-niebla transition-colors"
            >
              {dict.footer.links.guarantee}
            </Link>
            <Link
              href={`/${lang}/cita-privada`}
              className="text-[15px] text-niebla/75 hover:text-niebla transition-colors"
            >
              {dict.footer.links.privateVisit}
            </Link>
            <Link
              href={`/${lang}/preguntas`}
              className="text-[15px] text-niebla/75 hover:text-niebla transition-colors"
            >
              {dict.footer.links.faq}
            </Link>
            <Link
              href={`/${lang}#en-la-pista`}
              className="text-[15px] text-niebla/75 hover:text-niebla transition-colors"
            >
              {dict.footer.links.videos}
            </Link>
            <Link
              href={`/${lang}/contacto`}
              className="text-[15px] text-niebla/75 hover:text-niebla transition-colors"
            >
              {dict.footer.links.contact}
            </Link>
          </div>

          {/* Contact & Social Column (4 cols) */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-champagne font-semibold">
              {dict.footer.columns.contact}
            </p>
            <div>
              <button
                type="button"
                onClick={() =>
                  triggerWhatsApp({
                    intent: 'general',
                    ctaPosition: 'footer_whatsapp',
                  })
                }
                className="inline-flex items-center gap-2 text-[17px] font-semibold text-niebla hover:text-champagne transition-colors tabular-specs"
              >
                <WhatsAppIcon className="w-4 h-4 text-champagne shrink-0" />
                <span>WhatsApp {settings.officialWhatsAppDisplay}</span>
              </button>
              <p className="text-[12px] text-niebla/65 mt-1">
                {scheduleStatus.trustLine}
              </p>
            </div>

            <div className="text-[14px] text-niebla/75">
              <p>{scheduleStatus.fullScheduleText}</p>
              <a
                href={`mailto:${settings.officialEmail}`}
                className="hover:text-champagne transition-colors block mt-1"
              >
                {settings.officialEmail}
              </a>
            </div>

            <div className="pt-2">
              <p className="text-[11px] uppercase tracking-[0.22em] text-champagne font-semibold mb-3">
                {dict.footer.columns.social}
              </p>
              <div className="flex items-center gap-3">
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  title="Instagram"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/15 text-niebla/85 hover:text-champagne hover:border-champagne hover:bg-white/10 transition-all flex items-center justify-center"
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
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/15 text-niebla/85 hover:text-champagne hover:border-champagne hover:bg-white/10 transition-all flex items-center justify-center"
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
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/15 text-niebla/85 hover:text-champagne hover:border-champagne hover:bg-white/10 transition-all flex items-center justify-center"
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

        {/* Bottom Legal Line */}
        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[13px] text-niebla/65">
          <p>{dict.footer.copyright}</p>
          <div className="flex flex-wrap items-center gap-6">
            <Link
              href={`/${lang}/privacidad`}
              className="hover:text-niebla transition-colors"
            >
              {dict.footer.privacy}
            </Link>
            <Link
              href={`/${lang}/terminos`}
              className="hover:text-niebla transition-colors"
            >
              {dict.footer.terms}
            </Link>
            <Link
              href="/admin"
              className="hover:text-niebla transition-colors opacity-70"
            >
              {dict.footer.admin}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
