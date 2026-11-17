'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getDynamicScheduleStatus } from '@/lib/schedule';
import type { Locale, SiteSettings } from '@/types';

export function Eyebrow({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={`eyebrow ${className}`}>{children}</p>;
}

export function SplitHeading({
  as: Tag = 'h2',
  strong,
  light,
  size = 'h2',
  className = '',
}: {
  as?: 'h1' | 'h2' | 'h3';
  strong: string;
  light?: string;
  size?: 'hero' | 'h1' | 'h2' | 'h3';
  className?: string;
}) {
  const sizeClass =
    size === 'hero'
      ? 'hero-fluid'
      : size === 'h1'
      ? 'h1-fluid'
      : size === 'h2'
      ? 'h2-fluid'
      : 'h3-fluid';
  return (
    <Tag className={`font-display-split font-bold text-tinta ${sizeClass} ${className}`}>
      <span>{strong}</span>
      {light ? (
        <>
          {' '}
          <span className="font-semibold text-bronce">{light}</span>
        </>
      ) : null}
    </Tag>
  );
}

export function WhatsAppIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12.031 2C6.508 2 2.023 6.485 2.023 12.008c0 1.766.461 3.49 1.337 5.01L2 22l5.122-1.343a9.974 9.974 0 0 0 4.909 1.292h.004c5.522 0 10.007-4.485 10.007-10.008 0-2.674-1.041-5.188-2.932-7.079A9.946 9.946 0 0 0 12.031 2Zm5.845 14.304c-.246.693-1.432 1.326-1.996 1.411-.513.077-1.184.109-1.911-.122-.441-.14-1.006-.328-1.729-.64-3.044-1.314-5.032-4.379-5.184-4.582-.152-.203-1.238-1.647-1.238-3.142 0-1.495.783-2.23 1.061-2.534.278-.304.606-.38.808-.38.202 0 .404.002.581.011.186.009.436-.071.682.521.246.593.839 2.052.913 2.204.076.152.126.329.025.532-.101.203-.151.329-.303.507-.152.177-.319.396-.455.532-.152.152-.31.316-.133.62.177.304.785 1.295 1.686 2.098 1.158 1.033 2.134 1.353 2.438 1.505.303.152.48.127.657-.076.177-.203.758-.887.96-1.191.202-.304.404-.253.682-.152.278.101 1.768.834 2.071.986.303.152.505.228.581.355.076.126.076.734-.17 1.427Z" />
    </svg>
  );
}

export function PrimaryButton({
  children,
  onClick,
  href,
  type = 'button',
  disabled = false,
  className = '',
  showArrow = true,
  isWhatsAppCta = true,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
  showArrow?: boolean;
  isWhatsAppCta?: boolean;
}) {
  const baseClasses =
    'group inline-flex items-center justify-center h-[52px] px-7 bg-polder text-niebla text-[12px] font-semibold uppercase tracking-[0.16em] rounded-xl transition-all duration-300 hover:opacity-92 disabled:opacity-50 select-none';

  const content = (
    <>
      <span>{children}</span>
      {showArrow && (
        <span
          aria-hidden="true"
          className="ml-2.5 inline-block text-champagne transition-transform duration-300 group-hover:translate-x-1"
        >
          →
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        data-whatsapp-cta={isWhatsAppCta ? 'true' : undefined}
        className={`${baseClasses} ${className}`}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      data-whatsapp-cta={isWhatsAppCta ? 'true' : undefined}
      className={`${baseClasses} ${className}`}
    >
      {content}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  href,
  type = 'button',
  disabled = false,
  className = '',
  isWhatsAppCta = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
  isWhatsAppCta?: boolean;
}) {
  const baseClasses =
    'group inline-flex items-center justify-center h-[52px] px-7 bg-arena text-tinta border border-tinta/15 text-[12px] font-semibold uppercase tracking-[0.16em] rounded-xl transition-colors duration-300 hover:bg-arena-profunda disabled:opacity-50 select-none';

  if (href) {
    return (
      <Link
        href={href}
        data-whatsapp-cta={isWhatsAppCta ? 'true' : undefined}
        className={`${baseClasses} ${className}`}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      data-whatsapp-cta={isWhatsAppCta ? 'true' : undefined}
      className={`${baseClasses} ${className}`}
    >
      {children}
    </button>
  );
}

export function GalleryLink({
  children,
  href,
  onClick,
  className = '',
  external = false,
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  external?: boolean;
}) {
  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`gallery-link text-[14px] tracking-[0.04em] ${className}`}
        >
          {children}
        </a>
      );
    }
    return (
      <Link
        href={href}
        className={`gallery-link text-[14px] tracking-[0.04em] ${className}`}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`gallery-link text-[14px] tracking-[0.04em] ${className}`}
    >
      {children}
    </button>
  );
}

export function StatusTag({
  label,
  className = '',
}: {
  label: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full bg-[#EFEAE2] text-[#211915] border border-[#DDD5C7] text-[11px] font-semibold tracking-[0.04em] ${className}`}
    >
      {label}
    </span>
  );
}

export function AccordionItem({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-linea">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full py-5 flex items-center justify-between text-left group"
      >
        <span className="text-[17px] font-semibold text-tinta pr-6">{title}</span>
        <span
          aria-hidden="true"
          className="text-[20px] font-light text-bronce group-hover:text-tinta select-none w-6 text-right"
        >
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <div className="pb-6 text-[16px] leading-[1.65] text-tinta-diluida max-w-prose">
          {children}
        </div>
      )}
    </div>
  );
}

export function DynamicScheduleMicrocopy({
  lang,
  settings,
  showFullTrustLine = true,
  className = '',
}: {
  lang: Locale;
  settings?: Pick<SiteSettings, 'timezone' | 'schedule' | 'closedHolidays'>;
  showFullTrustLine?: boolean;
  className?: string;
}) {
  const [text, setText] = useState<string>('');

  useEffect(() => {
    const status = getDynamicScheduleStatus(lang, settings, new Date());
    setText(showFullTrustLine ? status.trustLine : status.microcopy);
  }, [lang, settings, showFullTrustLine]);

  if (!text) {
    const fallback = getDynamicScheduleStatus(lang, settings);
    return (
      <p className={`text-[12px] text-tinta-diluida ${className}`}>
        {showFullTrustLine ? fallback.trustLine : fallback.microcopy}
      </p>
    );
  }

  return <p className={`text-[12px] text-tinta-diluida ${className}`}>{text}</p>;
}
