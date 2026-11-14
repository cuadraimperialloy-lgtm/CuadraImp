import fs from 'fs';
import path from 'path';
import type {
  AdminHorse,
  AuditLogEntry,
  DatabaseSchema,
  LeadRecord,
  PublicHorse,
  SiteSettings,
} from '@/types';
import initialSeedData from '@/lib/seed';
import { getLast4MicrochipDigits } from '@/lib/utils';

const DB_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'database.json');
const RUNTIME_LEADS_PATH = path.join(process.cwd(), '.next', 'leads-store.json');

function readRuntimeLeads(): LeadRecord[] {
  try {
    if (fs.existsSync(RUNTIME_LEADS_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(RUNTIME_LEADS_PATH, 'utf-8'));
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

function writeRuntimeLeads(leads: LeadRecord[]): void {
  try {
    const dir = path.dirname(RUNTIME_LEADS_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(RUNTIME_LEADS_PATH, JSON.stringify(leads, null, 2), 'utf-8');
  } catch {
    // ignore
  }
}

export function readDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const content = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const db = JSON.parse(content) as DatabaseSchema;
      const runtimeLeads = readRuntimeLeads();
      if (runtimeLeads.length > 0) {
        const existingIds = new Set((db.leads || []).map((l) => l.id));
        const extra = runtimeLeads.filter((l) => !existingIds.has(l.id));
        db.leads = [...extra, ...(db.leads || [])];
      }
      return db;
    }
  } catch (err) {
    console.error('Error reading database.json, falling back to seed:', err);
  }
  return structuredClone(initialSeedData);
}

export function writeDatabase(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing database.json:', err);
  }
}

/**
 * Convierte un AdminHorse en PublicHorse eliminando estrictamente el precio interno
 * y las rutas de documentos privados para cumplir el criterio de aceptación:
 * "El precio interno nunca llega al navegador público (verificar en el HTML y en las respuestas de la API)."
 */
export function toPublicHorse(horse: AdminHorse): PublicHorse {
  const {
    internalPriceMxn: _mxn,
    internalPriceUsd: _usd,
    privateDocuments,
    ...publicFields
  } = horse;

  return {
    ...publicFields,
    microchip: getLast4MicrochipDigits(horse.microchip),
    availableDocumentTypes: (privateDocuments || []).map((doc) => doc.type),
  };
}

export function getPublicHorses(): PublicHorse[] {
  const db = readDatabase();
  return db.horses
    .filter((h) => h.published && h.status !== 'draft' && h.status !== 'archived')
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(toPublicHorse);
}

export function getPublicSaleHorses(): PublicHorse[] {
  return getPublicHorses().filter((h) => h.type === 'sale');
}

export function getPublicStudHorses(): PublicHorse[] {
  return getPublicHorses().filter((h) => h.type === 'stud');
}

export function getPublicHorseBySlug(slug: string): PublicHorse | null {
  const db = readDatabase();
  const found = db.horses.find(
    (h) =>
      h.slug.toLowerCase() === slug.toLowerCase() &&
      h.published &&
      h.status !== 'draft' &&
      h.status !== 'archived'
  );
  return found ? toPublicHorse(found) : null;
}

export function getSiteSettings(): SiteSettings {
  const db = readDatabase();
  return db.settings;
}

export function appendAuditLog(
  db: DatabaseSchema,
  entry: Omit<AuditLogEntry, 'id' | 'timestamp'>
): void {
  const log: AuditLogEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  db.auditLogs.unshift(log);
}

export function createLeadRecord(
  leadInput: Omit<LeadRecord, 'id' | 'createdAt' | 'updatedAt' | 'interactions'>
): LeadRecord {
  const now = new Date().toISOString();
  const newLead: LeadRecord = {
    ...leadInput,
    id: `lead-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: now,
    updatedAt: now,
    interactions: [],
  };
  const currentRuntime = readRuntimeLeads();
  currentRuntime.unshift(newLead);
  writeRuntimeLeads(currentRuntime);
  return newLead;
}

