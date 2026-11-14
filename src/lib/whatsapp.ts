import type { Locale, WhatsAppIntent } from '@/types';

export interface WhatsAppHorseRef {
  name: string;
  code?: string;
  sire?: string | null;
}

export interface WhatsAppFields {
  name?: string;
  whatsapp?: string;
  preferredDay?: string;
  partySize?: number | string;
  bringingVetOrTrainer?: boolean;
  purpose?: string;
  cityCountry?: string;
  mareInfo?: string;
  customQuestion?: string;
}

export interface BuildWhatsAppParams {
  intent: WhatsAppIntent;
  horses?: WhatsAppHorseRef[];
  lang: Locale;
  fields?: WhatsAppFields;
  page?: string;
  source?: string | null;
  folio?: string;
  officialNumber?: string;
  customMessageOverride?: string;
}

function getPageLabel(intent: WhatsAppIntent, lang: Locale, rawPage?: string): string {
  if (rawPage && !rawPage.startsWith('/')) {
    return rawPage;
  }
  const mapEs: Record<WhatsAppIntent, string> = {
    general: 'Home',
    horse: 'Ficha',
    visit: 'Cita',
    selection: 'Selección',
    dossier: 'Expediente',
    shipping: 'Envíos',
    stud: 'Maquila',
  };
  const mapEn: Record<WhatsAppIntent, string> = {
    general: 'Home',
    horse: 'Horse',
    visit: 'Visit',
    selection: 'Selection',
    dossier: 'Dossier',
    shipping: 'Shipping',
    stud: 'Stud',
  };
  return lang === 'es' ? mapEs[intent] : mapEn[intent];
}

export function buildWhatsAppMessage({
  intent,
  horses = [],
  lang,
  fields = {},
  page,
  source,
  folio = 'WEB',
}: Omit<BuildWhatsAppParams, 'officialNumber' | 'customMessageOverride'>): string {
  const pageLabel = getPageLabel(intent, lang, page);
  const horseCodePart =
    horses.length === 1 && horses[0].code
      ? horses[0].code
      : horses.length > 1
        ? horses
            .map((h) => h.code)
            .filter(Boolean)
            .join(',')
        : null;

  const refParts = [folio || 'WEB', pageLabel];
  if (horseCodePart) refParts.push(horseCodePart);
  if (source) refParts.push(source.toUpperCase());
  const refLine = `Ref: ${refParts.join(' · ')}`;

  const cleanName = fields.name?.trim();
  const cleanDay = fields.preferredDay?.trim();
  const cleanParty =
    fields.partySize !== undefined && String(fields.partySize).trim() !== ''
      ? String(fields.partySize).trim()
      : null;
  const cleanCity = fields.cityCountry?.trim();
  const cleanPurpose = fields.purpose?.trim();
  const cleanMare = fields.mareInfo?.trim();

  if (lang === 'es') {
    switch (intent) {
      case 'horse': {
        const h = horses[0];
        const horseLabel = h
          ? h.sire
            ? `${h.name} (hijo de ${h.sire})`
            : h.name
          : 'un ejemplar';
        return `Buen día. Me interesa ${horseLabel}. ¿Me comparten precio, video y foto del pasaporte? ${refLine}`;
      }

      case 'visit': {
        const horseTarget =
          horses.length > 0
            ? horses.map((h) => h.name).join(', ')
            : 'sus caballos';
        const sentences: string[] = [
          `Buen día. Quiero agendar una cita privada en Zapotlanejo para ver a ${horseTarget}.`,
        ];
        if (cleanDay) sentences.push(`Día preferido: ${cleanDay}.`);
        if (cleanParty) sentences.push(`Vendríamos ${cleanParty} personas.`);
        if (fields.bringingVetOrTrainer) {
          sentences.push('Asistiré con mi veterinario o caballerango.');
        }
        if (cleanName) sentences.push(`Mi nombre es ${cleanName}.`);
        sentences.push(refLine);
        return sentences.join(' ');
      }

      case 'selection': {
        const names =
          horses.length > 0
            ? horses.map((h) => h.name).join(', ')
            : 'sus ejemplares';
        return `Buen día. Me interesan estos ejemplares: ${names}. ¿Me comparten precio, video y pasaporte de cada uno? ${refLine}`;
      }

      case 'dossier': {
        const h = horses[0];
        const horseName = h?.name || 'el ejemplar';
        const sentences: string[] = [
          `Buen día. ¿Me envían el expediente completo de ${horseName}?`,
        ];
        if (cleanPurpose) sentences.push(`Lo busco para: ${cleanPurpose}.`);
        if (cleanCity) sentences.push(`Rancho en: ${cleanCity}.`);
        if (cleanName) sentences.push(`Mi nombre es ${cleanName}.`);
        sentences.push(refLine);
        return sentences.join(' ');
      }

      case 'shipping': {
        const dest = cleanCity ? ` a ${cleanCity}` : '';
        const sentences: string[] = [
          `Buen día. Quiero cotizar el traslado de un caballo${dest}.`,
        ];
        if (cleanName) sentences.push(`Mi nombre es ${cleanName}.`);
        sentences.push(refLine);
        return sentences.join(' ');
      }

      case 'stud': {
        const stallion = horses[0]?.name || 'sus sementales';
        const marePart = cleanMare ? ` para mi yegua (${cleanMare})` : '';
        const sentences: string[] = [
          `Buen día. Quiero cotizar servicio de maquila con ${stallion}${marePart}.`,
        ];
        if (cleanName) sentences.push(`Mi nombre es ${cleanName}.`);
        sentences.push(refLine);
        return sentences.join(' ');
      }

      case 'general':
      default: {
        if (fields.customQuestion?.trim()) {
          return `Buen día. ${fields.customQuestion.trim()} ${refLine}`;
        }
        return `Buen día. Vi su sitio y me interesa conocer sus frisones. ¿Me comparten información? ${refLine}`;
      }
    }
  } else {
    // English templates
    switch (intent) {
      case 'horse': {
        const h = horses[0];
        const horseLabel = h
          ? h.sire
            ? `${h.name} (by ${h.sire})`
            : h.name
          : 'a horse';
        return `Good day. I'm interested in ${horseLabel}. Could you share price, video and a photo of the passport? ${refLine}`;
      }

      case 'visit': {
        const horseTarget =
          horses.length > 0
            ? horses.map((h) => h.name).join(', ')
            : 'your horses';
        const sentences: string[] = [
          `Good day. I would like to book a private visit in Zapotlanejo to see ${horseTarget}.`,
        ];
        if (cleanDay) sentences.push(`Preferred day: ${cleanDay}.`);
        if (cleanParty) sentences.push(`Party of ${cleanParty}.`);
        if (fields.bringingVetOrTrainer) {
          sentences.push('I will bring my veterinarian or trainer.');
        }
        if (cleanName) sentences.push(`My name is ${cleanName}.`);
        sentences.push(refLine);
        return sentences.join(' ');
      }

      case 'selection': {
        const names =
          horses.length > 0
            ? horses.map((h) => h.name).join(', ')
            : 'your horses';
        return `Good day. I'm interested in these horses: ${names}. Could you share the price, video and passport for each one? ${refLine}`;
      }

      case 'dossier': {
        const h = horses[0];
        const horseName = h?.name || 'the horse';
        const sentences: string[] = [
          `Good day. Could you send me the complete dossier for ${horseName}?`,
        ];
        if (cleanPurpose) sentences.push(`Intended use: ${cleanPurpose}.`);
        if (cleanCity) sentences.push(`Ranch location: ${cleanCity}.`);
        if (cleanName) sentences.push(`My name is ${cleanName}.`);
        sentences.push(refLine);
        return sentences.join(' ');
      }

      case 'shipping': {
        const dest = cleanCity ? ` to ${cleanCity}` : '';
        const sentences: string[] = [
          `Good day. I would like to quote horse transport${dest}.`,
        ];
        if (cleanName) sentences.push(`My name is ${cleanName}.`);
        sentences.push(refLine);
        return sentences.join(' ');
      }

      case 'stud': {
        const stallion = horses[0]?.name || 'your stallions';
        const marePart = cleanMare ? ` for my mare (${cleanMare})` : '';
        const sentences: string[] = [
          `Good day. I would like to inquire about breeding services with ${stallion}${marePart}.`,
        ];
        if (cleanName) sentences.push(`My name is ${cleanName}.`);
        sentences.push(refLine);
        return sentences.join(' ');
      }

      case 'general':
      default: {
        if (fields.customQuestion?.trim()) {
          return `Good day. ${fields.customQuestion.trim()} ${refLine}`;
        }
        return `Good day. I visited your website and I'm interested in your Friesians. Could you share information? ${refLine}`;
      }
    }
  }
}

/**
 * Único helper autorizado en todo el sitio para generar enlaces wa.me (Sección 7.3).
 */
export function buildWhatsAppLink(params: BuildWhatsAppParams): {
  url: string;
  message: string;
  phone: string;
} {
  const phone = (params.officialNumber || '523317026066').replace(/\D/g, '');
  const message =
    params.customMessageOverride?.trim() || buildWhatsAppMessage(params);
  const encoded = encodeURIComponent(message);
  return {
    url: `https://wa.me/${phone}?text=${encoded}`,
    message,
    phone,
  };
}

