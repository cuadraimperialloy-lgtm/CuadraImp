import { NextResponse } from 'next/server';
import { generateMetaCatalogXml } from '@/lib/metaCatalog';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const xml = generateMetaCatalogXml();
  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
