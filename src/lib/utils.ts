import type { DomaLevel, HorseSex, HorseStatus, Locale } from '@/types';

/**
 * Calcula la edad real en años (o meses si es menor de 1 año) desde la fecha de nacimiento (YYYY-MM-DD).
 * Nunca devuelve una edad fija ni inventada. Si no hay birthDate, devuelve null.
 */
export function calculateHorseAge(
  birthDate: string | null | undefined,
  lang: Locale,
  referenceDate: Date = new Date()
): string | null {
  if (!birthDate) return null;
  const parts = birthDate.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;

  const [birthYear, birthMonth, birthDay] = parts;
  let totalMonths =
    (referenceDate.getFullYear() - birthYear) * 12 +
    (referenceDate.getMonth() + 1 - birthMonth);
  if (referenceDate.getDate() < birthDay) {
    totalMonths -= 1;
  }

  if (totalMonths < 0) return null;

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (years === 0) {
    const safeMonths = Math.max(1, months);
    if (lang === 'es') {
      return `${safeMonths} ${safeMonths === 1 ? 'mes' : 'meses'}`;
    }
    return `${safeMonths} ${safeMonths === 1 ? 'month' : 'months'}`;
  }

  if (months === 0) {
    if (lang === 'es') {
      return `${years} ${years === 1 ? 'año' : 'años'}`;
    }
    return `${years} ${years === 1 ? 'year' : 'years'}`;
  }

  if (lang === 'es') {
    return `${years} ${years === 1 ? 'año' : 'años'} ${months} ${months === 1 ? 'mes' : 'meses'
      }`;
  }
  return `${years} ${years === 1 ? 'year' : 'years'} ${months} ${months === 1 ? 'month' : 'months'
    }`;
}

export function getHorseAgeMonths(
  birthDate: string | null | undefined,
  referenceDate: Date = new Date()
): number | null {
  if (!birthDate) return null;
  const parts = birthDate.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  const [birthYear, birthMonth, birthDay] = parts;
  let months =
    (referenceDate.getFullYear() - birthYear) * 12 +
    (referenceDate.getMonth() + 1 - birthMonth);
  if (referenceDate.getDate() < birthDay) months -= 1;
  return months;
}

export function formatDomaLevel(level: DomaLevel, lang: Locale): string | null {
  if (!level) return null;
  const mapEs: Record<Exclude<DomaLevel, null>, string> = {
    potro: 'Potro',
    iniciando_rienda: 'Iniciando rienda',
    con_rienda: 'Con rienda',
    alta_escuela: 'Alta escuela',
  };
  const mapEn: Record<Exclude<DomaLevel, null>, string> = {
    potro: 'Colt / In hand',
    iniciando_rienda: 'Started under saddle',
    con_rienda: 'Ridden',
    alta_escuela: 'High school dressage',
  };
  return lang === 'es' ? mapEs[level] : mapEn[level];
}

export function formatHorseSex(sex: HorseSex | null, lang: Locale): string | null {
  if (!sex) return null;
  const mapEs: Record<HorseSex, string> = {
    semental: 'Macho entero',
    entero: 'Macho entero',
    castrado: 'Castrado',
    yegua: 'Yegua',
    potro: 'Potro',
  };
  const mapEn: Record<HorseSex, string> = {
    semental: 'Stallion',
    entero: 'Stallion',
    castrado: 'Gelding',
    yegua: 'Mare',
    potro: 'Colt',
  };
  return lang === 'es' ? mapEs[sex] : mapEn[sex];
}

export function formatHorseStatus(status: HorseStatus, lang: Locale): string {
  const mapEs: Record<HorseStatus, string> = {
    draft: 'Borrador',
    available: 'Disponible',
    en_route: 'En camino desde Holanda',
    reserved: 'Apartado',
    sold: 'Vendido',
    archived: 'Archivado',
  };
  const mapEn: Record<HorseStatus, string> = {
    draft: 'Draft',
    available: 'Available',
    en_route: 'En route from the Netherlands',
    reserved: 'Reserved',
    sold: 'Sold',
    archived: 'Archived',
  };
  return lang === 'es' ? mapEs[status] : mapEn[status];
}

export function generateFolio(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CIL-${code}`;
}

/**
 * Formatea el número de microchip ocultando todos los dígitos excepto los últimos 4.
 * Por seguridad y privacidad, nunca se muestra el número completo de 15 dígitos.
 */
export function getLast4MicrochipDigits(
  microchip: string | null | undefined
): string | null {
  if (!microchip) return null;
  const digitsOnly = microchip.replace(/\D/g, '');
  if (!digitsOnly) return null;
  return digitsOnly.slice(-4);
}

export function formatMaskedMicrochip(
  microchip: string | null | undefined,
  asciiOnly = false
): string | null {
  const last4 = getLast4MicrochipDigits(microchip);
  if (!last4) return null;
  return asciiOnly ? `***********${last4}` : `•••••••••••${last4}`;
}


