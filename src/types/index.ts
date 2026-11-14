export type Locale = 'es' | 'en';

export type HorseType = 'sale' | 'stud';

export type HorseOrigin = 'Holanda' | 'Nacional';

export type HorseSex = 'semental' | 'entero' | 'castrado' | 'yegua' | 'potro';

export type HorseStatus =
  | 'draft'
  | 'available'
  | 'en_route'
  | 'reserved'
  | 'sold'
  | 'archived';

export type DomaLevel =
  | 'potro'
  | 'iniciando_rienda'
  | 'con_rienda'
  | 'alta_escuela'
  | null;

export const CONTROLLED_AWARDS = [
  '1er premio',
  '2º premio',
  '3er premio',
  'Ster',
  'Kroon',
  'Model',
  'Sport',
  'Sport Elite',
  'Preferent',
  'Prestatie',
  'Veulenboek',
  'Stamboek',
] as const;

export type ControlledAward = (typeof CONTROLLED_AWARDS)[number];

export interface HorseMediaItem {
  url: string;
  altEs: string;
  altEn: string;
}

export interface PrivateDocument {
  id: string;
  type: 'passport' | 'pedigree' | 'vet_report' | 'xrays';
  labelEs: string;
  labelEn: string;
  filename: string;
  uploadedAt: string;
}

export interface AdminHorse {
  id: string;
  name: string;
  slug: string;
  code: string;
  sex: HorseSex | null;
  type: HorseType;
  origin: HorseOrigin;
  birthDate: string | null; // YYYY-MM-DD
  heightM: number | null;   // e.g. 1.66
  registrationNumber: string | null;
  microchip: string | null;
  fullPaper: boolean | null;
  sire: string | null;
  damsire: string | null;
  dam: string | null;
  showDam: boolean;
  awards: ControlledAward[];
  level: DomaLevel;
  bloodlineEs: string;
  bloodlineEn: string;
  descriptionEs: string;
  descriptionEn: string;
  vetSummaryEs: string;
  vetSummaryEn: string;
  // PRIVATE FIELDS - NEVER SENT TO PUBLIC CLIENT
  internalPriceMxn: number | null;
  internalPriceUsd: number | null;
  showFromPriceInCatalog: boolean;
  // MEDIA
  coverPhoto: string;
  hoverPhoto: string | null;
  gallery: HorseMediaItem[];
  mainVideo: string | null;
  videoPoster: string | null;
  privateDocuments: PrivateDocument[];
  // STATUS & ORDER
  status: HorseStatus;
  estimatedArrivalDate: string | null;
  published: boolean;
  sortOrder: number;
  updatedAt: string;
}

// Public DTO strips internalPriceMxn, internalPriceUsd, microchip number, and raw private docs
export type PublicHorse = Omit<
  AdminHorse,
  'internalPriceMxn' | 'internalPriceUsd' | 'privateDocuments'
> & {
  availableDocumentTypes: Array<'passport' | 'pedigree' | 'vet_report' | 'xrays'>;
};

export type WhatsAppIntent =
  | 'general'
  | 'horse'
  | 'visit'
  | 'selection'
  | 'dossier'
  | 'shipping'
  | 'stud';

export type LeadStage =
  | 'nuevo'
  | 'contactado'
  | 'cita_agendada'
  | 'visito'
  | 'apartado'
  | 'vendido'
  | 'perdido';

export type LossReason = 'precio' | 'ya_compro' | 'no_respondio' | 'otro' | null;

export interface LeadInteraction {
  id: string;
  timestamp: string;
  author: string;
  note: string;
}

export interface LeadRecord {
  id: string;
  folio: string;
  createdAt: string;
  updatedAt: string;
  intent: WhatsAppIntent;
  horseCodes: string[];
  horseNames: string[];
  page: string;
  ctaPosition: string;
  lang: Locale;
  device: 'mobile' | 'desktop';
  countryApprox: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  referrer: string | null;
  // Customer fields
  name: string | null;
  whatsapp: string | null;
  cityCountry: string | null;
  preferredDay: string | null;
  partySize: number | null;
  bringingVetOrTrainer: boolean;
  purpose: string | null;
  mareInfo: string | null;
  // Privacy consent (LFPDPPP)
  consentAccepted: boolean;
  consentTimestamp: string | null;
  consentVersion: string;
  consentIpHash: string | null;
  // CRM management
  stage: LeadStage;
  lossReason: LossReason;
  assignedTo: string;
  appointmentDate: string | null; // YYYY-MM-DD
  appointmentTime: string | null; // HH:mm
  depositMxn: number | null;
  finalHorseCode: string | null;
  firstResponseAt: string | null;
  interactions: LeadInteraction[];
  anonymizedAt?: string | null;
}

export interface SiteSettings {
  officialWhatsApp: string; // "523317026066"
  officialWhatsAppDisplay: string; // "+52 33 1702 6066"
  officialEmail: string;
  instagramUrl: string;
  tiktokUrl: string;
  facebookUrl: string;
  timezone: string; // "America/Mexico_City"
  schedule: {
    weekdaysOpen: string; // "08:00"
    weekdaysClose: string; // "17:00"
    saturdayOpen: string; // "09:00"
    saturdayClose: string; // "13:00"
    sundayClosed: boolean;
  };
  closedHolidays: string[]; // YYYY-MM-DD
  privacyNoticeVersion: string;
  showCatalogStartingPrice: boolean;
  catalogStartingPriceMxn: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: 'admin' | 'ventas' | 'system';
  action: string;
  entityType: 'horse' | 'lead' | 'settings';
  entityId: string;
  summary: string;
}

export interface DatabaseSchema {
  horses: AdminHorse[];
  leads: LeadRecord[];
  settings: SiteSettings;
  auditLogs: AuditLogEntry[];
}

