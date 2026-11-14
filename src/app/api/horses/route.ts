import { NextResponse } from 'next/server';
import { getPublicHorses, getSiteSettings } from '@/lib/db';

export async function GET() {
  const horses = getPublicHorses();
  const settings = getSiteSettings();
  return NextResponse.json({
    horses,
    settings,
  });
}

