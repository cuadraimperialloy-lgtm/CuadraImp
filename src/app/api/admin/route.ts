import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { appendAuditLog, readDatabase, writeDatabase } from '@/lib/db';
import type { AdminHorse, LeadRecord, SiteSettings } from '@/types';

export async function GET() {
  const db = readDatabase();
  return NextResponse.json(db);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, role = 'admin', actor = 'Admin' } = body;
    const db = readDatabase();

    if (action === 'save_horse') {
      const horse: AdminHorse = body.horse;
      const existingIndex = db.horses.findIndex((h) => h.id === horse.id);
      horse.updatedAt = new Date().toISOString();

      if (existingIndex >= 0) {
        const previous = db.horses[existingIndex];
        db.horses[existingIndex] = horse;
        appendAuditLog(db, {
          actor,
          role,
          action: 'UPDATE_HORSE',
          entityType: 'horse',
          entityId: horse.id,
          summary: `Actualizó ejemplar ${horse.name} (${horse.code}) · Estado: ${previous.status} → ${horse.status}`,
        });
      } else {
        db.horses.push(horse);
        appendAuditLog(db, {
          actor,
          role,
          action: 'CREATE_HORSE',
          entityType: 'horse',
          entityId: horse.id,
          summary: `Creó ejemplar ${horse.name} (${horse.code})`,
        });
      }

      writeDatabase(db);
      revalidatePath('/', 'layout');
      return NextResponse.json({ ok: true, db });
    }

    if (action === 'delete_horse') {
      if (role !== 'admin') {
        return NextResponse.json(
          { error: 'El rol Ventas no tiene permiso para borrar caballos.' },
          { status: 403 }
        );
      }
      const { horseId } = body;
      const target = db.horses.find((h) => h.id === horseId);
      if (target) {
        db.horses = db.horses.filter((h) => h.id !== horseId);
        appendAuditLog(db, {
          actor,
          role,
          action: 'DELETE_HORSE',
          entityType: 'horse',
          entityId: horseId,
          summary: `Eliminó definitivamente el ejemplar ${target.name} (${target.code})`,
        });
        writeDatabase(db);
        revalidatePath('/', 'layout');
      }
      return NextResponse.json({ ok: true, db });
    }

    if (action === 'reorder_horses') {
      const { orderedIds } = body as { orderedIds: string[] };
      orderedIds.forEach((id, idx) => {
        const h = db.horses.find((item) => item.id === id);
        if (h) h.sortOrder = idx + 1;
      });
      appendAuditLog(db, {
        actor,
        role,
        action: 'REORDER_HORSES',
        entityType: 'horse',
        entityId: 'collection',
        summary: 'Actualizó el orden manual de Selección de la cuadra.',
      });
      writeDatabase(db);
      revalidatePath('/', 'layout');
      return NextResponse.json({ ok: true, db });
    }

    if (action === 'update_lead') {
      const lead: LeadRecord = body.lead;
      const idx = db.leads.findIndex((l) => l.id === lead.id);
      if (idx >= 0) {
        const prev = db.leads[idx];
        lead.updatedAt = new Date().toISOString();
        if (prev.stage === 'nuevo' && lead.stage !== 'nuevo' && !lead.firstResponseAt) {
          lead.firstResponseAt = lead.updatedAt;
        }
        db.leads[idx] = lead;
        appendAuditLog(db, {
          actor,
          role,
          action: 'UPDATE_LEAD',
          entityType: 'lead',
          entityId: lead.folio,
          summary: `Actualizó lead ${lead.folio} (${lead.name || 'Anónimo'}) · Etapa: ${prev.stage} → ${lead.stage}`,
        });
        writeDatabase(db);
      }
      return NextResponse.json({ ok: true, db });
    }

    if (action === 'arco_anonymize') {
      const { leadId } = body;
      const idx = db.leads.findIndex((l) => l.id === leadId);
      if (idx >= 0) {
        const target = db.leads[idx];
        target.name = 'DATOS ELIMINADOS (ARCO)';
        target.whatsapp = null;
        target.cityCountry = null;
        target.consentIpHash = null;
        target.anonymizedAt = new Date().toISOString();
        target.updatedAt = target.anonymizedAt;
        appendAuditLog(db, {
          actor,
          role,
          action: 'ARCO_ANONYMIZE',
          entityType: 'lead',
          entityId: target.folio,
          summary: `Ejercitó derecho ARCO de cancelación/anonimización sobre el folio ${target.folio}`,
        });
        writeDatabase(db);
      }
      return NextResponse.json({ ok: true, db });
    }

    if (action === 'merge_leads') {
      const { primaryId, secondaryId } = body;
      const primary = db.leads.find((l) => l.id === primaryId);
      const secondary = db.leads.find((l) => l.id === secondaryId);
      if (primary && secondary) {
        primary.horseCodes = Array.from(
          new Set([...primary.horseCodes, ...secondary.horseCodes])
        );
        primary.horseNames = Array.from(
          new Set([...primary.horseNames, ...secondary.horseNames])
        );
        primary.interactions = [
          ...primary.interactions,
          {
            id: `int-merge-${Date.now()}`,
            timestamp: new Date().toISOString(),
            author: actor,
            note: `Se unió con el folio duplicado ${secondary.folio} (${secondary.intent}).`,
          },
          ...secondary.interactions,
        ];
        db.leads = db.leads.filter((l) => l.id !== secondaryId);
        appendAuditLog(db, {
          actor,
          role,
          action: 'MERGE_LEADS',
          entityType: 'lead',
          entityId: primary.folio,
          summary: `Unió el folio duplicado ${secondary.folio} dentro de ${primary.folio}`,
        });
        writeDatabase(db);
      }
      return NextResponse.json({ ok: true, db });
    }

    if (action === 'save_settings') {
      if (role !== 'admin') {
        return NextResponse.json(
          { error: 'El rol Ventas no puede modificar ajustes globales.' },
          { status: 403 }
        );
      }
      const settings: SiteSettings = body.settings;
      db.settings = settings;
      appendAuditLog(db, {
        actor,
        role,
        action: 'UPDATE_SETTINGS',
        entityType: 'settings',
        entityId: 'global',
        summary: 'Actualizó ajustes globales y horario de atención.',
      });
      writeDatabase(db);
      revalidatePath('/', 'layout');
      return NextResponse.json({ ok: true, db });
    }

    return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 });
  } catch (err) {
    console.error('Admin API error:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

