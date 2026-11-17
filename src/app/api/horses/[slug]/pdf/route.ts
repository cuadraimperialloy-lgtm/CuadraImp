import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { getPublicHorseBySlug, getSiteSettings } from '@/lib/db';
import {
  calculateHorseAge,
  formatDomaLevel,
  formatHorseSex,
  formatHorseStatus,
  formatMaskedMicrochip,
  getLast4MicrochipDigits,
} from '@/lib/utils';

/**
 * Escapes characters for PDF WinAnsiEncoding / PDF literal strings
 */
function pdfEscape(input: string): string {
  const normalized = input
    .replace(/×/g, 'x')
    .replace(/·/g, '-')
    .replace(/•/g, '*')
    .replace(/—/g, '-')
    .replace(/–/g, '-')
    .replace(/‘|’/g, "'")
    .replace(/“|”/g, '"')
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, '');

  let out = '';
  for (let i = 0; i < normalized.length; i++) {
    const code = normalized.charCodeAt(i);
    if (code === 40 || code === 41 || code === 92) {
      out += '\\' + normalized[i];
    } else if (code > 127) {
      out += '\\' + code.toString(8).padStart(3, '0');
    } else {
      out += normalized[i];
    }
  }
  return out;
}

/**
 * Word-wraps a string to a maximum character width
 */
function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxChars) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = (current + ' ' + word).trim();
    }
  }
  if (current) lines.push(current);
  return lines;
}

interface JpegImageData {
  buffer: Buffer;
  width: number;
  height: number;
  components: number;
}

/**
 * Reads a JPEG file from /public and extracts its dimensions from the SOF marker
 */
function loadPublicJpeg(publicRelativeUrl: string | null | undefined): JpegImageData | null {
  if (!publicRelativeUrl) return null;
  try {
    const decodedRel = decodeURIComponent(publicRelativeUrl).replace(/^\/+/, '');
    const fullPath = path.join(process.cwd(), 'public', decodedRel);
    if (!fs.existsSync(fullPath)) return null;

    const buf = fs.readFileSync(fullPath);
    if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) {
      return null; // Not a valid JPEG
    }

    let offset = 2;
    while (offset + 9 < buf.length) {
      if (buf[offset] !== 0xff) {
        offset++;
        continue;
      }
      const marker = buf[offset + 1];
      if (marker === 0xff) {
        offset++;
        continue;
      }
      if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
        offset += 2;
        continue;
      }
      const segLength = buf.readUInt16BE(offset + 2);
      // SOF markers (Baseline, Extended, Progressive)
      if (
        (marker >= 0xc0 && marker <= 0xc3) ||
        (marker >= 0xc5 && marker <= 0xc7) ||
        (marker >= 0xc9 && marker <= 0xcb) ||
        (marker >= 0xcd && marker <= 0xcf)
      ) {
        const height = buf.readUInt16BE(offset + 5);
        const width = buf.readUInt16BE(offset + 7);
        const components = buf[offset + 9];
        if (width > 0 && height > 0) {
          return { buffer: buf, width, height, components };
        }
      }
      if (segLength < 2) break;
      offset += 2 + segLength;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Builds a valid single-page A4 PDF (595 x 842 pt) with Proposal 1 styling.
 * - 'registro': ONLY the horse's name, registration number, and a prestigious KFPS genealogical tree.
 * - 'ficha': Full technical sheet with main photo, presentation, characteristics, registry, and pedigree.
 */
function generateHorsePdfBuffer(params: {
  docType: 'registro' | 'ficha';
  lang: 'es' | 'en';
  name: string;
  code: string;
  registrationNumber: string;
  maskedChip: string;
  last4Chip: string;
  origin: string;
  status: string;
  sex: string;
  age: string;
  birthDate: string;
  height: string;
  fullPaper: string;
  awards: string;
  sire: string;
  dam: string;
  damsire: string;
  level: string;
  description: string;
  bloodline: string;
  vetSummary: string;
  whatsapp: string;
  email: string;
  coverImage: JpegImageData | null;
}): Buffer {
  const {
    docType,
    lang,
    name,
    code,
    registrationNumber,
    maskedChip,
    last4Chip,
    origin,
    status,
    sex,
    age,
    birthDate,
    height,
    fullPaper,
    awards,
    sire,
    dam,
    damsire,
    level,
    description,
    bloodline,
    vetSummary,
    whatsapp,
    email,
    coverImage,
  } = params;

  const isRegistro = docType === 'registro';
  const embedImage = !isRegistro ? coverImage : null;
  const ops: string[] = [];

  // 1. Page Background: Piedra Caliza Mate (#F4F2ED -> 0.957 0.949 0.929)
  ops.push('0.957 0.949 0.929 rg');
  ops.push('0 0 595 842 re f');

  // 2. Top Header Banner: Café Cuero / Ébano Profundo (#211915 -> 0.130 0.098 0.082)
  ops.push('0.130 0.098 0.082 rg');
  ops.push('36 742 523 66 re f');

  // Gold accent line inside header
  ops.push('0.776 0.698 0.541 RG 0.8 w 52 769 m 543 769 l S');

  ops.push(
    'BT /F2 15 Tf 0.957 0.949 0.929 rg 52 782 Td (' +
      pdfEscape('CUADRA IMPERIAL LOY') +
      ') Tj ET'
  );
  ops.push(
    'BT /F1 8.5 Tf 0.776 0.698 0.541 rg 52 753 Td (' +
      pdfEscape(
        isRegistro
          ? lang === 'es'
            ? 'REGISTRO GENEALOGICO KFPS  -  ARBOL DE LINAJE DIRECTO'
            : 'KFPS GENEALOGICAL REGISTRY  -  DIRECT PEDIGREE TREE'
          : lang === 'es'
          ? `FICHA TECNICA OFICIAL  -  ${name.toUpperCase()}`
          : `OFFICIAL TECHNICAL SHEET  -  ${name.toUpperCase()}`
      ) +
      ') Tj ET'
  );

  if (registrationNumber && registrationNumber !== 'N/A') {
    ops.push(
      'BT /F2 9.5 Tf 0.957 0.949 0.929 rg 410 782 Td (' +
        pdfEscape(`REG. KFPS: ${registrationNumber}`) +
        ') Tj ET'
    );
  }

  if (isRegistro) {
    // =========================================================================
    // REGISTRO GENEALÓGICO: ONLY HORSE NAME + PRESTIGIOUS FAMILY TREE
    // =========================================================================

    // Decorative outer border frame for the pedigree certificate
    ops.push('0.918 0.902 0.875 rg 36 120 523 600 re f');
    ops.push('0.130 0.098 0.082 RG 1.2 w 36 120 523 600 re S');
    ops.push('0.776 0.698 0.541 RG 0.6 w 42 126 511 588 re S');

    // Eyebrow
    ops.push(
      'BT /F1 9 Tf 0.490 0.420 0.290 rg 62 678 Td (' +
        pdfEscape(
          lang === 'es'
            ? 'KONINKLIJKE VERENIGING HET FRIESCH PAARDEN-STAMBOEK (KFPS)'
            : 'KONINKLIJKE VERENIGING HET FRIESCH PAARDEN-STAMBOEK (KFPS)'
        ) +
        ') Tj ET'
    );

    // Horse Name (Large Display Title)
    ops.push(
      'BT /F2 30 Tf 0.094 0.094 0.086 rg 62 642 Td (' +
        pdfEscape(name.toUpperCase()) +
        ') Tj ET'
    );

    // Registration subtitle line
    const regLineParts: string[] = [];
    if (registrationNumber && registrationNumber !== 'N/A') {
      regLineParts.push(
        lang === 'es'
          ? `Registro KFPS #${registrationNumber}`
          : `KFPS Reg. #${registrationNumber}`
      );
    }
    if (awards && awards !== '—') {
      regLineParts.push(awards);
    }
    if (fullPaper && fullPaper !== 'N/A' && fullPaper !== 'No') {
      regLineParts.push('Full Paper');
    }

    if (regLineParts.length > 0) {
      ops.push(
        'BT /F2 10.5 Tf 0.130 0.098 0.082 rg 62 618 Td (' +
          pdfEscape(regLineParts.join('   |   ')) +
          ') Tj ET'
      );
    }

    // Divider below name
    ops.push('0.776 0.698 0.541 RG 1 w 62 598 m 533 598 l S');

    // Section Title: ÁRBOL GENEALÓGICO
    ops.push(
      'BT /F2 11 Tf 0.431 0.416 0.388 rg 62 570 Td (' +
        pdfEscape(
          lang === 'es'
            ? 'ARBOL GENEALOGICO DIRECTO'
            : 'DIRECT GENEALOGICAL TREE'
        ) +
        ') Tj ET'
    );

    // -------------------------------------------------------------------------
    // 3-COLUMN PEDIGREE DIAGRAM (y = 200 .. 540)
    // Col 1 (Ejemplar): x = 62, w = 135, y = 335, h = 96 (center y = 383)
    // Col 2 Top (Padre): x = 232, w = 140, y = 435, h = 82 (center y = 476)
    // Col 2 Bottom (Madre): x = 232, w = 140, y = 240, h = 82 (center y = 281)
    // Col 3 Bottom (Abuelo Materno): x = 402, w = 131, y = 240, h = 82 (center y = 281)
    // -------------------------------------------------------------------------

    // Connector Lines (Café Cuero #211915)
    ops.push('0.130 0.098 0.082 RG 1.5 w');
    // From Ejemplar right edge (197, 383) to fork at x = 214
    ops.push('197 383 m 214 383 l S');
    // Vertical fork from y = 281 to y = 476 at x = 214
    ops.push('214 281 m 214 476 l S');
    // Horizontal into Padre (214, 476) -> (232, 476)
    ops.push('214 476 m 232 476 l S');
    // Horizontal into Madre (214, 281) -> (232, 281)
    ops.push('214 281 m 232 281 l S');
    // Horizontal from Madre right edge (372, 281) -> Abuelo Materno (402, 281)
    ops.push('372 281 m 402 281 l S');

    // Node 1: EJEMPLAR (Dark Café Cuero Box with Cream & Champagne Text)
    ops.push('0.130 0.098 0.082 rg 62 335 135 96 re f');
    ops.push('0.776 0.698 0.541 RG 1.2 w 62 335 135 96 re S');
    ops.push(
      'BT /F1 8 Tf 0.776 0.698 0.541 rg 74 408 Td (' +
        pdfEscape(lang === 'es' ? 'EJEMPLAR' : 'HORSE') +
        ') Tj ET'
    );
    ops.push(
      'BT /F2 15 Tf 0.957 0.949 0.929 rg 74 384 Td (' +
        pdfEscape(name.toUpperCase()) +
        ') Tj ET'
    );
    if (registrationNumber && registrationNumber !== 'N/A') {
      ops.push(
        'BT /F1 8.5 Tf 0.85 0.83 0.79 rg 74 364 Td (' +
          pdfEscape(`Reg. ${registrationNumber}`) +
          ') Tj ET'
      );
    }

    // Node 2: PADRE / SIRE (Cream Box with Dark Border)
    ops.push('0.957 0.949 0.929 rg 232 435 301 82 re f');
    ops.push('0.130 0.098 0.082 RG 1 w 232 435 301 82 re S');
    ops.push(
      'BT /F1 8 Tf 0.490 0.420 0.290 rg 248 495 Td (' +
        pdfEscape(lang === 'es' ? 'PADRE (LINAJE PATERNO)' : 'SIRE (PATERNAL LINE)') +
        ') Tj ET'
    );
    ops.push(
      'BT /F2 15 Tf 0.094 0.094 0.086 rg 248 468 Td (' +
        pdfEscape(sire !== 'N/A' ? sire : '—') +
        ') Tj ET'
    );
    ops.push(
      'BT /F1 8.5 Tf 0.431 0.416 0.388 rg 248 448 Td (' +
        pdfEscape(lang === 'es' ? 'Semental KFPS' : 'KFPS Sire') +
        ') Tj ET'
    );

    // Node 3: MADRE / DAM (Cream Box with Dark Border)
    ops.push('0.957 0.949 0.929 rg 232 240 140 82 re f');
    ops.push('0.130 0.098 0.082 RG 1 w 232 240 140 82 re S');
    ops.push(
      'BT /F1 8 Tf 0.490 0.420 0.290 rg 244 300 Td (' +
        pdfEscape(lang === 'es' ? 'MADRE (DAM)' : 'DAM') +
        ') Tj ET'
    );
    const damLines = wrapText(dam !== 'N/A' ? dam : '—', 18).slice(0, 2);
    let damY = 276;
    damLines.forEach((dl) => {
      ops.push(
        `BT /F2 12 Tf 0.094 0.094 0.086 rg 244 ${damY} Td (${pdfEscape(dl)}) Tj ET`
      );
      damY -= 15;
    });

    // Node 4: ABUELO MATERNO / DAMSIRE (Cream Box with Bronze/Gold Border)
    ops.push('0.957 0.949 0.929 rg 402 240 131 82 re f');
    ops.push('0.490 0.420 0.290 RG 1 w 402 240 131 82 re S');
    ops.push(
      'BT /F1 7.5 Tf 0.490 0.420 0.290 rg 414 300 Td (' +
        pdfEscape(lang === 'es' ? 'ABUELO MATERNO' : 'MATERNAL GRANDSIRE') +
        ') Tj ET'
    );
    const damsireLines = wrapText(damsire !== 'N/A' ? damsire : '—', 17).slice(0, 2);
    let dsY = 276;
    damsireLines.forEach((dsl) => {
      ops.push(
        `BT /F2 11.5 Tf 0.094 0.094 0.086 rg 414 ${dsY} Td (${pdfEscape(dsl)}) Tj ET`
      );
      dsY -= 15;
    });

    // Subtle caption at bottom of pedigree frame
    ops.push(
      'BT /F1 8.5 Tf 0.431 0.416 0.388 rg 62 152 Td (' +
        pdfEscape(
          lang === 'es'
            ? ' Genealogia verificada conforme al registro de origen KFPS.'
            : 'Verified pedigree according to original KFPS registration.'
        ) +
        ') Tj ET'
    );
  } else {
    // =========================================================================
    // FICHA TÉCNICA OFICIAL DEL EJEMPLAR (ALL HORSE INFORMATION + PHOTO)
    // =========================================================================

    // Hero Section (y = 576..728): Left Identity + Right Main Horse Photo
    ops.push('0.918 0.902 0.875 rg 384 576 175 152 re f');
    ops.push('0.80 0.78 0.74 RG 0.8 w 384 576 175 152 re S');

    if (embedImage) {
      const boxW = 167;
      const boxH = 144;
      const scale = Math.min(boxW / embedImage.width, boxH / embedImage.height);
      const drawW = +(embedImage.width * scale).toFixed(2);
      const drawH = +(embedImage.height * scale).toFixed(2);
      const drawX = +(388 + (boxW - drawW) / 2).toFixed(2);
      const drawY = +(580 + (boxH - drawH) / 2).toFixed(2);
      ops.push(`q ${drawW} 0 0 ${drawH} ${drawX} ${drawY} cm /Im1 Do Q`);
    }

    // Left side of Hero Section (x = 36..368)
    ops.push(
      'BT /F2 22 Tf 0.094 0.094 0.086 rg 36 704 Td (' +
        pdfEscape(name.toUpperCase()) +
        ') Tj ET'
    );
    ops.push(
      'BT /F2 9.5 Tf 0.490 0.420 0.290 rg 36 686 Td (' +
        pdfEscape(
          `FRISON KFPS  |  ${origin.toUpperCase()}  |  ${status.toUpperCase()}`
        ) +
        ') Tj ET'
    );

    const heroBullets: Array<[string, string]> = [
      [lang === 'es' ? 'Registro KFPS:' : 'KFPS Reg:', registrationNumber],
      [
        lang === 'es' ? 'Microchip (ult. 4):' : 'Microchip (last 4):',
        `${maskedChip} (${lang === 'es' ? 'ultimos 4 digitos' : 'last 4 digits'})`,
      ],
      [lang === 'es' ? 'Sexo y Edad:' : 'Sex & Age:', `${sex}  -  ${age} (${birthDate})`],
      [lang === 'es' ? 'Alzada (Altura):' : 'Height:', height],
      [lang === 'es' ? 'Certificacion:' : 'Certification:', `${fullPaper}  -  ${awards}`],
    ];

    let heroY = 662;
    heroBullets.forEach(([k, v]) => {
      ops.push(
        `BT /F1 9 Tf 0.431 0.416 0.388 rg 36 ${heroY} Td (${pdfEscape(k)}) Tj ET`
      );
      ops.push(
        `BT /F2 9 Tf 0.094 0.094 0.086 rg 132 ${heroY} Td (${pdfEscape(v)}) Tj ET`
      );
      heroY -= 17;
    });

    // Horizontal divider line below Hero + Photo
    ops.push('0.82 0.80 0.77 RG 1 w 36 562 m 559 562 l S');

    ops.push(
      'BT /F2 11.5 Tf 0.094 0.094 0.086 rg 36 540 Td (' +
        pdfEscape(
          lang === 'es'
            ? `1. PRESENTACION DE ${name.toUpperCase()}`
            : `1. PRESENTATION OF ${name.toUpperCase()}`
        ) +
        ') Tj ET'
    );

    let y = 522;
    const descLines = wrapText(`${description} ${bloodline}`, 92).slice(0, 4);
    descLines.forEach((line) => {
      ops.push(
        `BT /F1 9.5 Tf 0.20 0.17 0.15 rg 36 ${y} Td (${pdfEscape(line)}) Tj ET`
      );
      y -= 14;
    });

    y -= 8;
    ops.push(
      `BT /F2 11.5 Tf 0.094 0.094 0.086 rg 36 ${y} Td (` +
        pdfEscape(
          lang === 'es'
            ? '2. ESPECIFICACIONES TECNICAS Y GENEALOGIA COMPLETA'
            : '2. COMPLETE TECHNICAL SPECIFICATIONS & PEDIGREE'
        ) +
        ') Tj ET'
    );

    y -= 18;
    const specs: Array<[string, string]> = [
      [lang === 'es' ? 'Ejemplar' : 'Horse Name', name],
      [lang === 'es' ? 'Raza' : 'Breed', 'Frison / Frisian (KFPS)'],
      [lang === 'es' ? 'Edad Actual' : 'Current Age', `${age} (Nac. ${birthDate})`],
      [lang === 'es' ? 'Alzada a la Cruz' : 'Height at Withers', height],
      [lang === 'es' ? 'Sexo' : 'Sex', sex],
      ...(level && level !== '—'
        ? [[lang === 'es' ? 'Nivel / Etapa' : 'Training Level', level] as [string, string]]
        : []),
      [lang === 'es' ? 'Registro KFPS' : 'KFPS Registration', registrationNumber],
      [
        lang === 'es'
          ? 'Microchip (solo ultimos 4 digitos)'
          : 'Microchip (last 4 digits only)',
        `${maskedChip} (Terminacion ${last4Chip})`,
      ],
      [lang === 'es' ? 'Full Paper / Premios' : 'Full Paper / Awards', `${fullPaper}  |  ${awards}`],
      [lang === 'es' ? 'Padre (Sire)' : 'Sire', sire],
      [lang === 'es' ? 'Madre (Dam)' : 'Dam', dam],
      [lang === 'es' ? 'Abuelo Materno (Damsire)' : 'Maternal Grandsire', damsire],
      [lang === 'es' ? 'Ubicacion / CEDIS' : 'Location / Facility', origin],
    ];

    specs.forEach(([label, val], idx) => {
      if (idx % 2 === 0) {
        ops.push(`0.918 0.902 0.875 rg 36 ${y - 4} 523 18 re f`);
      }
      ops.push(
        `BT /F1 9 Tf 0.431 0.416 0.388 rg 46 ${y} Td (${pdfEscape(label)}) Tj ET`
      );
      ops.push(
        `BT /F2 9 Tf 0.094 0.094 0.086 rg 245 ${y} Td (${pdfEscape(val)}) Tj ET`
      );
      y -= 18;
    });

    if (vetSummary) {
      y -= 10;
      ops.push(
        `BT /F2 10.5 Tf 0.094 0.094 0.086 rg 36 ${y} Td (${pdfEscape(
          lang === 'es'
            ? '3. INFORMACION ADICIONAL DEL EXPEDIENTE'
            : '3. ADDITIONAL DOSSIER INFORMATION'
        )}) Tj ET`
      );
      y -= 14;
      const vetLines = wrapText(vetSummary, 92).slice(0, 2);
      vetLines.forEach((line) => {
        ops.push(
          `BT /F1 9 Tf 0.25 0.22 0.19 rg 36 ${y} Td (${pdfEscape(line)}) Tj ET`
        );
        y -= 13;
      });
    }
  }

  // 4. Bottom Footer Box (Café Cuero / Arena)
  ops.push('0.918 0.902 0.875 rg 36 36 523 58 re f');
  ops.push('0.130 0.098 0.082 RG 1 w 36 36 523 58 re S');
  ops.push(
    'BT /F2 9.5 Tf 0.094 0.094 0.086 rg 48 75 Td (' +
      pdfEscape('CUADRA IMPERIAL LOY  -  ESTANCIA EN AYOTLAN, JALISCO, MEXICO') +
      ') Tj ET'
  );
  ops.push(
    'BT /F1 8.5 Tf 0.431 0.416 0.388 rg 48 60 Td (' +
      pdfEscape(
        `WhatsApp Oficial: ${whatsapp}   |   Correo: ${email}   |   Visitas privadas con cita previa`
      ) +
      ') Tj ET'
  );
  ops.push(
    'BT /F1 7.5 Tf 0.431 0.416 0.388 rg 48 45 Td (' +
      pdfEscape(
        'Por seguridad y confidencialidad del registro, unicamente se muestran los ultimos 4 digitos del microchip.'
      ) +
      ') Tj ET'
  );

  const streamContent = ops.join('\n');
  const streamBuffer = Buffer.from(streamContent, 'latin1');

  // Build binary PDF with optional embedded JPEG XObject (/Im1) and /Info Title = Horse Name
  const chunks: Buffer[] = [];
  const offsets: number[] = [];
  let currentLength = 0;

  const pushStr = (str: string) => {
    const b = Buffer.from(str, 'latin1');
    chunks.push(b);
    currentLength += b.length;
  };

  const pushBuf = (b: Buffer) => {
    chunks.push(b);
    currentLength += b.length;
  };

  const startObj = (id: number) => {
    offsets[id] = currentLength;
    pushStr(`${id} 0 obj\n`);
  };

  const endObj = () => {
    pushStr('\nendobj\n');
  };

  pushStr('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');

  // Object 1: Catalog
  startObj(1);
  pushStr('<< /Type /Catalog /Pages 2 0 R >>');
  endObj();

  // Object 2: Pages
  startObj(2);
  pushStr('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  endObj();

  // Object 3: Page
  startObj(3);
  const xObjectRef = embedImage ? ' /XObject << /Im1 7 0 R >>' : '';
  pushStr(
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >>${xObjectRef} >> /Contents 6 0 R >>`
  );
  endObj();

  // Object 4: Font Helvetica
  startObj(4);
  pushStr(
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'
  );
  endObj();

  // Object 5: Font Helvetica-Bold
  startObj(5);
  pushStr(
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'
  );
  endObj();

  // Object 6: Page Content Stream
  startObj(6);
  pushStr(`<< /Length ${streamBuffer.length} >>\nstream\n`);
  pushBuf(streamBuffer);
  pushStr('\nendstream');
  endObj();

  let infoObjId = 7;

  // Object 7 (optional): Embedded JPEG Image XObject
  if (embedImage) {
    startObj(7);
    const colorSpace =
      embedImage.components === 1
        ? '/DeviceGray'
        : embedImage.components === 4
        ? '/DeviceCMYK'
        : '/DeviceRGB';
    pushStr(
      `<< /Type /XObject /Subtype /Image /Width ${embedImage.width} /Height ${embedImage.height} /ColorSpace ${colorSpace} /BitsPerComponent 8 /Filter /DCTDecode /Length ${embedImage.buffer.length} >>\nstream\n`
    );
    pushBuf(embedImage.buffer);
    pushStr('\nendstream');
    endObj();
    infoObjId = 8;
  }

  // Info Object: Document Title is the Horse's Name
  startObj(infoObjId);
  pushStr(
    `<< /Title (${pdfEscape(name)}) /Author (${pdfEscape(
      'Cuadra Imperial Loy'
    )}) /Subject (${pdfEscape(
      isRegistro ? `Registro Genealogico - ${name}` : `Ficha Tecnica - ${name}`
    )}) >>`
  );
  endObj();

  const totalObjects = infoObjId;
  const xrefOffset = currentLength;
  pushStr(`xref\n0 ${totalObjects + 1}\n`);
  pushStr('0000000000 65535 f \n');
  for (let i = 1; i <= totalObjects; i++) {
    pushStr(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
  }
  pushStr(
    `trailer\n<< /Size ${totalObjects + 1} /Root 1 0 R /Info ${infoObjId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`
  );

  return Buffer.concat(chunks);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const horse = getPublicHorseBySlug(slug);
  if (!horse) {
    return NextResponse.json({ error: 'Horse not found' }, { status: 404 });
  }

  const settings = getSiteSettings();
  const { searchParams } = new URL(request.url);
  const docType =
    searchParams.get('type') === 'registro' ? 'registro' : 'ficha';
  const lang = searchParams.get('lang') === 'en' ? 'en' : 'es';
  const isDownload = searchParams.get('download') === '1';

  const ageText =
    calculateHorseAge(horse.birthDate, lang) ||
    (lang === 'es' ? 'Segun registro' : 'Per registry');
  const sexText =
    formatHorseSex(horse.sex, lang) ||
    (lang === 'es' ? 'Macho entero' : 'Stallion');
  const statusText =
    horse.type === 'stud'
      ? lang === 'es'
        ? 'Semental de la cuadra'
        : 'Stable Stallion'
      : horse.status === 'en_route'
      ? lang === 'es'
        ? 'Disponible (En transito)'
        : 'Available (In transit)'
      : formatHorseStatus(horse.status, lang);

  const last4Chip = getLast4MicrochipDigits(horse.microchip) || 'N/A';
  const maskedChip = formatMaskedMicrochip(horse.microchip, true) || 'N/A';

  const coverImage =
    docType === 'ficha' ? loadPublicJpeg(horse.coverPhoto) : null;

  const pdfBuffer = generateHorsePdfBuffer({
    docType,
    lang,
    name: horse.name,
    code: horse.code,
    registrationNumber: horse.registrationNumber || 'N/A',
    maskedChip,
    last4Chip,
    origin:
      horse.origin === 'Holanda'
        ? horse.status === 'en_route'
          ? 'Europeo (En transito)'
          : 'Europeo (CEDIS Zapotlanejo, Jalisco)'
        : 'Nacional (CEDIS Zapotlanejo, Jalisco)',
    status: statusText,
    sex: sexText,
    age: ageText,
    birthDate: horse.birthDate || 'N/A',
    height: horse.heightM ? `${horse.heightM.toFixed(2)} m` : '—',
    fullPaper:
      horse.fullPaper === true
        ? 'Si (KFPS)'
        : horse.fullPaper === false
        ? 'No'
        : 'N/A',
    awards:
      horse.awards && horse.awards.length > 0
        ? horse.awards.join(', ')
        : '—',
    sire: horse.sire || 'N/A',
    dam: horse.dam || 'N/A',
    damsire: horse.damsire || 'N/A',
    level: formatDomaLevel(horse.level, lang) || '—',
    description: lang === 'es' ? horse.descriptionEs : horse.descriptionEn,
    bloodline: lang === 'es' ? horse.bloodlineEs : horse.bloodlineEn,
    vetSummary: lang === 'es' ? horse.vetSummaryEs : horse.vetSummaryEn,
    whatsapp: settings.officialWhatsAppDisplay,
    email: settings.officialEmail,
    coverImage,
  });

  // The filename of the PDF is the horse's name (+ suffix for registro)
  const asciiHorseName = horse.name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 _.-]/g, '')
    .trim();
  const baseName =
    docType === 'registro'
      ? `${asciiHorseName || horse.slug} - Registro Genealogico`
      : `${asciiHorseName || horse.slug} - Ficha Tecnica`;
  const filename = `${baseName}.pdf`;
  const encodedFilename = encodeURIComponent(`${baseName}.pdf`);

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `${
        isDownload ? 'attachment' : 'inline'
      }; filename="${filename}"; filename*=UTF-8''${encodedFilename}`,
      'Cache-Control': 'no-store',
    },
  });
}
