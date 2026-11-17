'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bookmark, Menu, X } from 'lucide-react';
import { useGallery } from '@/context/GalleryContext';

export function Header() {
  const {
    lang,
    dict,
    selectedHorses,
    setSelectionDrawerOpen,
  } = useGallery();
  const router = useRouter();
  const pathname = usePathname() || `/${lang}`;
  const [optimisticPath, setOptimisticPath] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    setOptimisticPath(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Eagerly prefetch all primary navigation routes so menu switching is instant
  useEffect(() => {
    const routes = [
      `/${lang}`,
      `/${lang}/ejemplares`,
      `/${lang}/cuadra-y-sementales`,
      `/${lang}/la-cuadra`,
      `/${lang}/garantia`,
      `/${lang}/preguntas`,
      `/${lang}/cita-privada`,
      `/${lang}/contacto`,
    ];
    routes.forEach((r) => {
      try {
        router.prefetch(r);
      } catch {
        // ignore
      }
    });
  }, [lang, router]);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 24);
      if (currentY > 140 && currentY > lastScrollY.current + 8) {
        setHidden(true);
      } else if (currentY < lastScrollY.current - 8 || currentY <= 80) {
        setHidden(false);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const switchLangHref = (targetLang: 'es' | 'en') => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments[0] === 'es' || segments[0] === 'en') {
      segments[0] = targetLang;
      return '/' + segments.join('/');
    }
    return `/${targetLang}`;
  };

  const navLinks = [
    { href: `/${lang}/ejemplares`, label: dict.nav.horses },
    { href: `/${lang}/cuadra-y-sementales`, label: dict.nav.stallions },
    { href: `/${lang}/la-cuadra`, label: dict.nav.stable },
    { href: `/${lang}/garantia`, label: dict.nav.guarantee },
    { href: `/${lang}/preguntas`, label: dict.nav.faq },
  ];

  const currentPath = optimisticPath || pathname;

  return (
    <>
      <header
        style={{ backgroundColor: '#211915' }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-out bg-[#211915] text-[#F4F2ED] border-b border-white/10 ${
          hidden && !mobileMenuOpen ? '-translate-y-full' : 'translate-y-0'
        } ${scrolled ? 'py-3 shadow-md' : 'py-3.5'}`}
      >
        {/* Subtle 1px Golden Hairline matching the official logo */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C6B28A]/45 to-transparent pointer-events-none" />

        {/* Instant Top Progress Indicator on Menu Click */}
        {optimisticPath && optimisticPath !== pathname && (
          <div className="
            absolute top-0 left-0 right-0 h-[2px] bg-[#C6B28A] animate-pulse
          " />
        )}

        <div className="gallery-container flex items-center justify-between gap-4">
          {/* Official Golden Logo housed on Café Cuero / Ébano Profundo (#211915) */}
          <Link
            href={`/${lang}`}
            prefetch={true}
            onClick={() => setOptimisticPath(`/${lang}`)}
            className="flex items-center shrink-0"
            aria-label="Cuadra Imperial Loy"
          >
            <img
              src="/brand/Logotipo_Cuadra_Imperial_Loy_horizontal_degradado.svg"
              alt="Cuadra Imperial Loy"
              className="h-9 md:h-11 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav
            aria-label="Main navigation"
            className="hidden xl:flex items-center gap-7"
          >
            {navLinks.map((item) => {
              const isActive =
                currentPath === item.href ||
                currentPath.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  onClick={() => setOptimisticPath(item.href)}
                  className={`relative py-1 text-[12.5px] uppercase tracking-[0.15em] transition-colors duration-150 ${
                    isActive
                      ? 'text-[#C6B28A] font-semibold'
                      : 'text-[#F4F2ED]/85 hover:text-[#F4F2ED]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 right-0 h-[1.5px] bg-[#C6B28A] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right actions: Visual Selection Icon, Language Switcher, Book Visit CTA */}
          <div className="hidden lg:flex items-center gap-5">
            <button
              type="button"
              onClick={() => setSelectionDrawerOpen(true)}
              aria-label={`${dict.nav.selection} (${selectedHorses.length})`}
              title={`${dict.nav.selection} (${selectedHorses.length})`}
              className="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-[#F4F2ED] hover:text-[#C6B28A] transition-colors"
            >
              <Bookmark
                className="w-4 h-4 stroke-[1.75]"
                fill={selectedHorses.length > 0 ? 'currentColor' : 'none'}
              />
              {selectedHorses.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#C6B28A] text-[#181816] text-[10px] font-bold flex items-center justify-center tabular-specs">
                  {selectedHorses.length}
                </span>
              )}
            </button>

            <div
              className="flex items-center gap-2 text-[12px] uppercase tracking-[0.18em]"
              aria-label="Language selector"
            >
              <Link
                href={switchLangHref('es')}
                prefetch={true}
                onClick={() => setOptimisticPath(switchLangHref('es'))}
                className={
                  lang === 'es'
                    ? 'text-[#C6B28A] font-semibold'
                    : 'text-[#F4F2ED]/70 hover:text-[#F4F2ED]'
                }
              >
                ES
              </Link>
              <span className="text-[#F4F2ED]/30">|</span>
              <Link
                href={switchLangHref('en')}
                prefetch={true}
                onClick={() => setOptimisticPath(switchLangHref('en'))}
                className={
                  lang === 'en'
                    ? 'text-[#C6B28A] font-semibold'
                    : 'text-[#F4F2ED]/70 hover:text-[#F4F2ED]'
                }
              >
                EN
              </Link>
            </div>

            <Link
              href={`/${lang}/cita-privada`}
              prefetch={true}
              onClick={() => setOptimisticPath(`/${lang}/cita-privada`)}
              className="inline-flex items-center justify-center h-[42px] px-5 bg-[#F4F2ED] text-[#181816] text-[11.5px] font-semibold uppercase tracking-[0.15em] rounded-full hover:bg-[#C6B28A] transition-colors"
            >
              {dict.nav.bookVisit}
            </Link>
          </div>

          {/* Mobile Controls */}
          <div className="flex lg:hidden items-center gap-3">
            <button
              type="button"
              onClick={() => setSelectionDrawerOpen(true)}
              aria-label={`${dict.nav.selection} (${selectedHorses.length})`}
              className="relative inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/10 text-[#C6B28A]"
            >
              <Bookmark
                className="w-4 h-4 stroke-[1.75]"
                fill={selectedHorses.length > 0 ? 'currentColor' : 'none'}
              />
              {selectedHorses.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-[#C6B28A] text-[#181816] text-[9.5px] font-bold flex items-center justify-center tabular-specs">
                  {selectedHorses.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? dict.nav.close : dict.nav.menu}
              className="p-2 text-niebla"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 stroke-[1.5]" />
              ) : (
                <Menu className="w-6 h-6 stroke-[1.5]" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Clean Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-polder text-niebla pt-24 pb-10 px-6 flex flex-col justify-between overflow-y-auto lg:hidden">
          <nav className="flex flex-col gap-4 pt-4">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="font-display-split font-bold text-[36px] leading-tight uppercase text-niebla border-b border-white/10 pb-3.5"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={`/${lang}/contacto`}
              onClick={() => setMobileMenuOpen(false)}
              className="font-display-split font-bold text-[36px] leading-tight uppercase text-niebla border-b border-white/10 pb-3.5"
            >
              {dict.nav.contact}
            </Link>
          </nav>

          <div className="pt-8 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-[11px] uppercase tracking-[0.2em] text-champagne font-semibold">
                IDIOMA / LANGUAGE
              </span>
              <div className="flex items-center gap-3 text-[13px] uppercase tracking-[0.18em]">
                <Link
                  href={switchLangHref('es')}
                  onClick={() => setMobileMenuOpen(false)}
                  className={
                    lang === 'es' ? 'text-champagne font-semibold' : 'text-niebla/70'
                  }
                >
                  ESPAÑOL
                </Link>
                <span className="text-niebla/40">·</span>
                <Link
                  href={switchLangHref('en')}
                  onClick={() => setMobileMenuOpen(false)}
                  className={
                    lang === 'en' ? 'text-champagne font-semibold' : 'text-niebla/70'
                  }
                >
                  ENGLISH
                </Link>
              </div>
            </div>

            <Link
              href={`/${lang}/cita-privada`}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full h-[52px] bg-niebla text-tinta rounded-xl flex items-center justify-center text-[12px] font-semibold uppercase tracking-[0.16em]"
            >
              {dict.nav.bookPrivateVisit}
            </Link>

            <p className="text-[12px] text-niebla/65 text-center">
              {dict.nav.mobileFooter}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
