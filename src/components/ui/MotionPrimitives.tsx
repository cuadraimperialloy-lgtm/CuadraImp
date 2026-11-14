'use client';

import React from 'react';
import { motion } from 'framer-motion';

const GALLERY_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Scroll-triggered reveal with smooth vertical translation and opacity.
 */
export function Reveal({
  children,
  delay = 0,
  y = 10,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0.01, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px' }}
      transition={{
        duration: 0.32,
        delay: Math.min(delay, 0.12),
        ease: GALLERY_EASE,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Clean minimalist hairline divider without decorative nodes.
 */
export function AnimatedLine({
  className = '',
  delay = 0,
}: {
  className?: string;
  showNodes?: boolean;
  delay?: number;
}) {
  return (
    <div className={`relative w-full flex items-center ${className}`}>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.9, delay, ease: GALLERY_EASE }}
        className="h-[1px] w-full bg-linea origin-left"
      />
    </div>
  );
}

/**
 * Minimalist rounded container card (Finca Sanro / Equine Collection style).
 * Zero corner brackets, zero rivets, soft organic volume.
 */
export function ArchitecturalFrame({
  children,
  className = '',
  innerClassName = '',
}: {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  accentCorners?: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl bg-arena p-5 sm:p-7 transition-colors duration-300 ${className}`}
    >
      <div className={innerClassName}>{children}</div>
    </div>
  );
}

/**
 * Minimalist Stud Seal with the Golden Crest housed inside a Pólder Green circle
 */
export function EquestrianSeal({
  labelTop = 'CUADRA IMPERIAL LOY',
  labelBottom = 'ZAPOTLANEJO · JALISCO',
  className = '',
}: {
  labelTop?: string;
  labelBottom?: string;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-3.5 px-4 py-2.5 bg-arena rounded-full ${className}`}
    >
      <div className="w-9 h-9 rounded-full bg-polder flex items-center justify-center shrink-0">
        <img
          src="/brand/Logotipo_Cuadra_Imperial_Loy_isotipo_degradado.svg"
          alt=""
          aria-hidden="true"
          className="w-5 h-5 object-contain"
        />
      </div>
      <div className="leading-tight pr-2">
        <div className="text-[11px] uppercase tracking-[0.18em] text-tinta font-semibold">
          {labelTop}
        </div>
        <div className="text-[10px] uppercase tracking-[0.16em] text-bronce font-medium">
          {labelBottom}
        </div>
      </div>
    </div>
  );
}

/**
 * Clean minimalist icon badge in Deep Pólder Green with Champagne stroke
 */
export function GeometricEmblem({
  variant,
}: {
  variant: 'shield' | 'seal' | 'crosshair' | 'compass';
}) {
  return (
    <div className="w-11 h-11 rounded-xl bg-polder flex items-center justify-center">
      {variant === 'shield' && (
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 stroke-champagne fill-none stroke-[1.4]"
        >
          <path d="M12 3L4 6.5V12C4 16.8 7.4 20.8 12 22C16.6 20.8 20 16.8 20 12V6.5L12 3Z" />
          <path d="M12 7V17M8.5 11.5H15.5" />
        </svg>
      )}
      {variant === 'seal' && (
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 stroke-champagne fill-none stroke-[1.4]"
        >
          <circle cx="12" cy="12" r="8.5" />
          <polygon points="12,6.5 16.5,12 12,17.5 7.5,12" />
        </svg>
      )}
      {variant === 'crosshair' && (
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 stroke-champagne fill-none stroke-[1.4]"
        >
          <circle cx="12" cy="12" r="7" />
          <path d="M12 2V6M12 18V22M2 12H6M18 12H22" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      )}
      {variant === 'compass' && (
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 stroke-champagne fill-none stroke-[1.4]"
        >
          <rect x="4" y="4" width="16" height="16" rx="3" />
          <path d="M4 12H20M12 4V20" />
        </svg>
      )}
    </div>
  );
}
