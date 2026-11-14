import { NextRequest, NextResponse } from 'next/server';
import { createLeadRecord, getSiteSettings } from '@/lib/db';
import { generateFolio } from '@/lib/utils';
import type { Locale, WhatsAppIntent } from '@/types';

// Simple in-memory rate limit per IP
const ipRequests = new Map<string, { count: number; resetAt: number }>();

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const now = Date.now();
    const record = ipRequests.get(ip);
    if (record && record.resetAt > now) {
      if (record.count >= 25) {
        return NextResponse.json(
          { folio: generateFolio(), rateLimited: true },
          { status: 200 }
        );
      }
      record.count += 1;
    } else {
      ipRequests.set(ip, { count: 1, resetAt: now + 60_000 });
    }

    const rawText = await req.text();
    if (!rawText || !rawText.trim()) {
      return NextResponse.json({ folio: generateFolio() }, { status: 200 });
    }
    const body = JSON.parse(rawText);

    // Honeypot check
    if (body.websiteUrl && String(body.websiteUrl).trim() !== '') {
      return NextResponse.json({ folio: generateFolio() }, { status: 200 });
    }

    const settings = getSiteSettings();
    const folio = body.folio || generateFolio();
    const intent: WhatsAppIntent = body.intent || 'general';
    const lang: Locale = body.lang === 'en' ? 'en' : 'es';

    const hasPersonalData = Boolean(
      body.name?.trim() || body.whatsapp?.trim()
    );
    const consentAccepted = hasPersonalData
      ? Boolean(body.consentAccepted)
      : false;

    const lead = createLeadRecord({
      folio,
      intent,
      horseCodes: Array.isArray(body.horseCodes) ? body.horseCodes : [],
      horseNames: Array.isArray(body.horseNames) ? body.horseNames : [],
      page: body.page || '/',
      ctaPosition: body.ctaPosition || 'unknown',
      lang,
      device: body.device === 'mobile' ? 'mobile' : 'desktop',
      countryApprox: req.headers.get('x-vercel-ip-country') || 'MX',
      utmSource: body.utmSource || null,
      utmMedium: body.utmMedium || null,
      utmCampaign: body.utmCampaign || null,
      referrer: body.referrer || null,
      name: consentAccepted ? body.name?.trim() || null : null,
      whatsapp: consentAccepted ? body.whatsapp?.trim() || null : null,
      cityCountry: body.cityCountry?.trim() || null,
      preferredDay: body.preferredDay?.trim() || null,
      partySize: body.partySize ? Number(body.partySize) : null,
      bringingVetOrTrainer: Boolean(body.bringingVetOrTrainer),
      purpose: body.purpose?.trim() || null,
      mareInfo: body.mareInfo?.trim() || null,
      consentAccepted,
      consentTimestamp: consentAccepted ? new Date().toISOString() : null,
      consentVersion: settings.privacyNoticeVersion || '2026.11',
      consentIpHash: consentAccepted ? `ip:${ip.slice(0, 6)}***` : null,
      stage: 'nuevo',
      lossReason: null,
      assignedTo: 'Ventas',
      appointmentDate: null,
      appointmentTime: null,
      depositMxn: null,
      finalHorseCode: null,
      firstResponseAt: null,
      anonymizedAt: null,
    });

    return NextResponse.json({ folio: lead.folio, id: lead.id }, { status: 201 });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json({ folio: generateFolio() }, { status: 200 });
  }
}

