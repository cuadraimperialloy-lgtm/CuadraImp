'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { usePathname } from 'next/navigation';
import type {
  Locale,
  PublicHorse,
  SiteSettings,
  WhatsAppIntent,
} from '@/types';
import {
  buildWhatsAppLink,
  type WhatsAppFields,
  type WhatsAppHorseRef,
} from '@/lib/whatsapp';
import { generateFolio } from '@/lib/utils';
import { getDictionary, type Dictionary } from '@/lib/i18n';

export interface TriggerWhatsAppInput {
  intent: WhatsAppIntent;
  horses?: WhatsAppHorseRef[];
  fields?: WhatsAppFields;
  ctaPosition: string;
  pageOverride?: string;
}

interface ActiveWhatsAppSession {
  folio: string;
  intent: WhatsAppIntent;
  horses: WhatsAppHorseRef[];
  fields: WhatsAppFields;
  page: string;
  source: string | null;
  initialMessage: string;
  url: string;
}

interface GalleryContextValue {
  lang: Locale;
  dict: Dictionary;
  horses: PublicHorse[];
  settings: SiteSettings;
  // Selection ("Mi selección")
  selectedSlugs: string[];
  selectedHorses: PublicHorse[];
  isSelected: (slug: string) => boolean;
  toggleSelection: (horse: PublicHorse) => void;
  removeFromSelection: (slug: string) => void;
  isSelectionDrawerOpen: boolean;
  setSelectionDrawerOpen: (open: boolean) => void;
  // Dossier lateral drawer
  dossierHorse: PublicHorse | null;
  openDossierDrawer: (horse: PublicHorse) => void;
  closeDossierDrawer: () => void;
  // WhatsApp Engine & Desktop Drawer
  triggerWhatsApp: (input: TriggerWhatsAppInput) => Promise<void>;
  activeWhatsAppSession: ActiveWhatsAppSession | null;
  closeWhatsAppDrawer: () => void;
  // Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
  // Cookie Consent
  cookieConsent: 'accepted' | 'declined' | null;
  acceptCookies: () => void;
  declineCookies: () => void;
}

const GalleryContext = createContext<GalleryContextValue | null>(null);

const SELECTION_STORAGE_KEY = 'cil_selection_v1';
const COOKIE_STORAGE_KEY = 'cil_cookie_consent_v1';
const UTM_STORAGE_KEY = 'cil_utm_v1';

export function GalleryProvider({
  children,
  lang,
  horses,
  settings,
}: {
  children: React.ReactNode;
  lang: Locale;
  horses: PublicHorse[];
  settings: SiteSettings;
}) {
  const pathname = usePathname();
  const dict = useMemo(() => getDictionary(lang), [lang]);

  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [isSelectionDrawerOpen, setSelectionDrawerOpen] = useState(false);
  const [dossierHorse, setDossierHorse] = useState<PublicHorse | null>(null);
  const [activeWhatsAppSession, setActiveWhatsAppSession] =
    useState<ActiveWhatsAppSession | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [cookieConsent, setCookieConsent] = useState<
    'accepted' | 'declined' | null
  >(null);

  // Hydrate selection & cookie consent & capture UTMs
  useEffect(() => {
    try {
      const rawSel = window.localStorage.getItem(SELECTION_STORAGE_KEY);
      if (rawSel) {
        const parsed = JSON.parse(rawSel);
        if (Array.isArray(parsed)) setSelectedSlugs(parsed);
      }
    } catch {
      // ignore storage errors
    }

    try {
      const savedConsent = window.localStorage.getItem(COOKIE_STORAGE_KEY);
      if (savedConsent === 'accepted' || savedConsent === 'declined') {
        setCookieConsent(savedConsent);
      }
    } catch {
      // ignore
    }

    try {
      const params = new URLSearchParams(window.location.search);
      const utmSource = params.get('utm_source');
      const utmMedium = params.get('utm_medium');
      const utmCampaign = params.get('utm_campaign');
      if (utmSource || utmMedium || utmCampaign) {
        window.sessionStorage.setItem(
          UTM_STORAGE_KEY,
          JSON.stringify({
            utmSource,
            utmMedium,
            utmCampaign,
            referrer: document.referrer || null,
          })
        );
      }
    } catch {
      // ignore
    }
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 2800);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const isSelected = useCallback(
    (slug: string) => selectedSlugs.includes(slug),
    [selectedSlugs]
  );

  const toggleSelection = useCallback(
    (horse: PublicHorse) => {
      setSelectedSlugs((prev) => {
        const exists = prev.includes(horse.slug);
        const next = exists
          ? prev.filter((s) => s !== horse.slug)
          : [...prev, horse.slug];
        try {
          window.localStorage.setItem(
            SELECTION_STORAGE_KEY,
            JSON.stringify(next)
          );
        } catch {
          // ignore
        }
        showToast(
          exists
            ? dict.system.removedFromSelection
            : `${horse.name} · ${dict.system.addedToSelection}`
        );
        return next;
      });
    },
    [dict, showToast]
  );

  const removeFromSelection = useCallback(
    (slug: string) => {
      setSelectedSlugs((prev) => {
        const next = prev.filter((s) => s !== slug);
        try {
          window.localStorage.setItem(
            SELECTION_STORAGE_KEY,
            JSON.stringify(next)
          );
        } catch {
          // ignore
        }
        return next;
      });
    },
    []
  );

  const selectedHorses = useMemo(
    () =>
      selectedSlugs
        .map((slug) => horses.find((h) => h.slug === slug))
        .filter((h): h is PublicHorse => Boolean(h)),
    [selectedSlugs, horses]
  );

  const openDossierDrawer = useCallback((horse: PublicHorse) => {
    setDossierHorse(horse);
  }, []);

  const closeDossierDrawer = useCallback(() => {
    setDossierHorse(null);
  }, []);

  const closeWhatsAppDrawer = useCallback(() => {
    setActiveWhatsAppSession(null);
  }, []);

  const acceptCookies = useCallback(() => {
    setCookieConsent('accepted');
    try {
      window.localStorage.setItem(COOKIE_STORAGE_KEY, 'accepted');
    } catch {
      // ignore
    }
  }, []);

  const declineCookies = useCallback(() => {
    setCookieConsent('declined');
    try {
      window.localStorage.setItem(COOKIE_STORAGE_KEY, 'declined');
    } catch {
      // ignore
    }
  }, []);

  const triggerWhatsApp = useCallback(
    async ({
      intent,
      horses: targetHorses = [],
      fields = {},
      ctaPosition,
      pageOverride,
    }: TriggerWhatsAppInput) => {
      const isMobile =
        typeof window !== 'undefined' &&
        (window.innerWidth < 768 ||
          /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent));
      const device: 'mobile' | 'desktop' = isMobile ? 'mobile' : 'desktop';
      const currentPage = pageOverride || pathname || `/${lang}`;

      let utmData: {
        utmSource?: string | null;
        utmMedium?: string | null;
        utmCampaign?: string | null;
        referrer?: string | null;
      } = {};
      try {
        const rawUtm = window.sessionStorage.getItem(UTM_STORAGE_KEY);
        if (rawUtm) utmData = JSON.parse(rawUtm);
      } catch {
        // ignore
      }

      const localFolio = generateFolio();
      let finalFolio = localFolio;

      // Register lead in CMS (< 800ms timeout fallback so it never blocks conversation)
      const payload = {
        folio: localFolio,
        intent,
        horseCodes: targetHorses.map((h) => h.code || h.name.slice(0, 3).toUpperCase()),
        horseNames: targetHorses.map((h) => h.name),
        page: currentPage,
        ctaPosition,
        lang,
        device,
        utmSource: utmData.utmSource || null,
        utmMedium: utmData.utmMedium || null,
        utmCampaign: utmData.utmCampaign || null,
        referrer: utmData.referrer || (typeof document !== 'undefined' ? document.referrer : null),
        name: fields.name || null,
        whatsapp: fields.whatsapp || null,
        cityCountry: fields.cityCountry || null,
        preferredDay: fields.preferredDay || null,
        partySize: fields.partySize || null,
        bringingVetOrTrainer: Boolean(fields.bringingVetOrTrainer),
        purpose: fields.purpose || null,
        mareInfo: fields.mareInfo || null,
        consentAccepted: true,
      };

      // Register lead in CMS asynchronously so CTA response is instant (0ms delay)
      fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});

      // Analytics event whatsapp_click (only if cookies accepted or standard dataLayer)
      if (typeof window !== 'undefined') {
        const eventParams = {
          intent,
          horse_code:
            targetHorses.map((h) => h.code).filter(Boolean).join(',') || 'NONE',
          page: currentPage,
          cta_position: ctaPosition,
          lang,
          device,
          folio: finalFolio,
        };
        const w = window as unknown as {
          gtag?: (...args: unknown[]) => void;
          fbq?: (...args: unknown[]) => void;
          dataLayer?: unknown[];
        };
        if (cookieConsent === 'accepted') {
          if (typeof w.gtag === 'function') {
            w.gtag('event', 'whatsapp_click', eventParams);
          }
          if (typeof w.fbq === 'function') {
            w.fbq('trackCustom', 'whatsapp_click', eventParams);
          }
        }
        if (Array.isArray(w.dataLayer)) {
          w.dataLayer.push({ event: 'whatsapp_click', ...eventParams });
        }
      }

      const sourceAbbrev = utmData.utmSource
        ? utmData.utmSource.slice(0, 6).toUpperCase()
        : null;

      const built = buildWhatsAppLink({
        intent,
        horses: targetHorses,
        lang,
        fields,
        page: pageOverride,
        source: sourceAbbrev,
        folio: finalFolio,
        officialNumber: settings.officialWhatsApp,
      });

      if (isMobile) {
        window.open(built.url, '_blank', 'noopener,noreferrer');
      } else {
        setActiveWhatsAppSession({
          folio: finalFolio,
          intent,
          horses: targetHorses,
          fields,
          page: pageOverride || currentPage,
          source: sourceAbbrev,
          initialMessage: built.message,
          url: built.url,
        });
      }
    },
    [pathname, lang, cookieConsent, settings.officialWhatsApp]
  );

  const value = useMemo<GalleryContextValue>(
    () => ({
      lang,
      dict,
      horses,
      settings,
      selectedSlugs,
      selectedHorses,
      isSelected,
      toggleSelection,
      removeFromSelection,
      isSelectionDrawerOpen,
      setSelectionDrawerOpen,
      dossierHorse,
      openDossierDrawer,
      closeDossierDrawer,
      triggerWhatsApp,
      activeWhatsAppSession,
      closeWhatsAppDrawer,
      toastMessage,
      showToast,
      cookieConsent,
      acceptCookies,
      declineCookies,
    }),
    [
      lang,
      dict,
      horses,
      settings,
      selectedSlugs,
      selectedHorses,
      isSelected,
      toggleSelection,
      removeFromSelection,
      isSelectionDrawerOpen,
      dossierHorse,
      openDossierDrawer,
      closeDossierDrawer,
      triggerWhatsApp,
      activeWhatsAppSession,
      closeWhatsAppDrawer,
      toastMessage,
      showToast,
      cookieConsent,
      acceptCookies,
      declineCookies,
    ]
  );

  return (
    <GalleryContext.Provider value={value}>{children}</GalleryContext.Provider>
  );
}

export function useGallery() {
  const ctx = useContext(GalleryContext);
  if (!ctx) {
    throw new Error('useGallery must be used within GalleryProvider');
  }
  return ctx;
}

