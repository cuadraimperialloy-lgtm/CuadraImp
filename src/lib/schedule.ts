import type { Locale, SiteSettings } from '@/types';

export type ScheduleWindowState =
  | 'open_now'
  | 'weekday_after_hours'
  | 'friday_after_hours'
  | 'weekend_after_hours';

function parseTimeMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Evalúa el estado del horario de atención en hora del centro de México (America/Mexico_City)
 * y devuelve el microcopy dinámico exacto especificado en la sección 7.3.
 */
export function getDynamicScheduleStatus(
  lang: Locale,
  settings?: Pick<SiteSettings, 'timezone' | 'schedule' | 'closedHolidays'>,
  referenceDate: Date = new Date()
): {
  state: ScheduleWindowState;
  microcopy: string;
  trustLine: string;
  fullScheduleText: string;
} {
  const tz = settings?.timezone || 'America/Mexico_City';
  const schedule = settings?.schedule || {
    weekdaysOpen: '08:00',
    weekdaysClose: '17:00',
    saturdayOpen: '09:00',
    saturdayClose: '13:00',
    sundayClosed: true,
  };

  // Extract Mexico City weekday, hour, minute, and YYYY-MM-DD
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(referenceDate);
  const getPart = (type: string) => parts.find((p) => p.type === type)?.value || '';

  const weekdayStr = getPart('weekday'); // Sun, Mon, Tue, Wed, Thu, Fri, Sat
  const hour = parseInt(getPart('hour') || '0', 10) % 24;
  const minute = parseInt(getPart('minute') || '0', 10);
  const currentMinutes = hour * 60 + minute;

  const year = getPart('year');
  const month = getPart('month');
  const day = getPart('day');
  const dateIso = `${year}-${month}-${day}`;

  const isHoliday = settings?.closedHolidays?.includes(dateIso) ?? false;

  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const dayOfWeek = weekdayMap[weekdayStr] ?? referenceDate.getDay();

  const wkOpen = parseTimeMinutes(schedule.weekdaysOpen);
  const wkClose = parseTimeMinutes(schedule.weekdaysClose);
  const satOpen = parseTimeMinutes(schedule.saturdayOpen);
  const satClose = parseTimeMinutes(schedule.saturdayClose);

  let state: ScheduleWindowState = 'open_now';

  if (isHoliday) {
    state = dayOfWeek === 5 ? 'friday_after_hours' : dayOfWeek === 6 || dayOfWeek === 0 ? 'weekend_after_hours' : 'weekday_after_hours';
  } else if (dayOfWeek >= 1 && dayOfWeek <= 4) {
    // Monday to Thursday
    if (currentMinutes >= wkOpen && currentMinutes < wkClose) {
      state = 'open_now';
    } else {
      state = 'weekday_after_hours';
    }
  } else if (dayOfWeek === 5) {
    // Friday
    if (currentMinutes < wkOpen) {
      state = 'weekday_after_hours';
    } else if (currentMinutes >= wkOpen && currentMinutes < wkClose) {
      state = 'open_now';
    } else {
      state = 'friday_after_hours';
    }
  } else if (dayOfWeek === 6) {
    // Saturday
    if (currentMinutes < satOpen) {
      state = 'friday_after_hours';
    } else if (currentMinutes >= satOpen && currentMinutes < satClose) {
      state = 'open_now';
    } else {
      state = 'weekend_after_hours';
    }
  } else {
    // Sunday
    state = 'weekend_after_hours';
  }

  const microcopy =
    lang === 'es'
      ? 'Trato directo con la cuadra'
      : 'Direct attention from the stable';

  const fullScheduleText =
    lang === 'es'
      ? 'Lunes a viernes 8:00–17:00 · Sábado 9:00–13:00 (hora del centro de México)'
      : 'Mon–Fri 8 a.m.–5 p.m. · Sat 9 a.m.–1 p.m. (Mexico City time)';

  return {
    state,
    microcopy,
    trustLine: microcopy,
    fullScheduleText,
  };
}

