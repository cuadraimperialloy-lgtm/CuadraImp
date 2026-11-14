const fs = require('fs');
const path = require('path');

function pdfEscape(input) {
  const normalized = String(input)
    .replace(/×/g, 'x')
    .replace(/·/g, '-')
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

function hexToRgb01(hex) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  return `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)}`;
}

function wrapText(text, maxChars) {
  const words = text.split(/\s+/);
  const lines = [];
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

const PALETTES = [
  {
    number: 'PROPUESTA 01 (RECOMENDADA - ESTILO CAPTURAS EQUINE COLLECTION + FINCA SANRO)',
    title: 'PIEDRA CALIZA & VERDE POLDER PROFUNDO',
    subtitle: 'Minimalismo Arquitectonico Limpio  |  Caliza Mate, Arena Suave y Polder Desaturado',
    concept:
      'Cero blanco hospital (#FFFFFF) y cero saturacion ranchera. El fondo general es un Piedra Caliza / Lino Crudo muy limpio (#F4F2ED) donde las tarjetas flotan sin bordes duros (#EAE6DF) con esquinas suaves. El acento de poder lo dan los bloques en Verde Polder Profundo Desaturado (#1C2E24) y la tipografia en Carbon Mate (#181816). Es exactamente el lenguaje limpio de las capturas Equine Collection y Finca Sanro.',
    previewBg: '#F4F2ED',
    previewCard: '#EAE6DF',
    previewText: '#181816',
    previewAccent: '#1C2E24',
    previewButton: '#1C2E24',
    swatches: [
      {
        name: 'Piedra Caliza Mate',
        hex: '#F4F2ED',
        role: 'Fondo General del Sitio (Sustituye al Blanco)',
        note: 'Tono mineral calido y luminoso, cero reflejo frio ni aspecto generico.',
        textLight: false,
      },
      {
        name: 'Arena Suave / Travertino',
        hex: '#EAE6DF',
        role: 'Tarjetas Limpias Sin Bordes (2x3 Specs)',
        note: 'Separa los modulos por volumen suave sin necesidad de lineas ni marcos.',
        textLight: false,
      },
      {
        name: 'Verde Polder Profundo',
        hex: '#1C2E24',
        role: 'Header Card, Cierre CTA y Botones',
        note: 'Verde ecuestre europeo muy oscuro y desaturado, sobrio y contemporaneo.',
        textLight: true,
      },
      {
        name: 'Carbon Azabache Mate',
        hex: '#181816',
        role: 'Tipografia Principal y Titulares',
        note: 'Negro suave mate que armoniza con el pelaje del Frison sin dureza.',
        textLight: true,
      },
      {
        name: 'Salvia Mineral (Badge)',
        hex: '#DCE8E0',
        role: 'Pills de Estado (Disponible / En Zapotlanejo)',
        note: 'Acento fresco y limpio para etiquetas de estatus verificadas.',
        textLight: false,
      },
      {
        name: 'Bronce Piedra Desaturado',
        hex: '#8C8270',
        role: 'Micro-etiquetas KFPS y Subtitulos',
        note: 'Un toque mineral neutro en lugar de dorados amarillos o cafes saturados.',
        textLight: true,
      },
    ],
  },
  {
    number: 'PROPUESTA 02 (ESTILO LORO PIANA / HERMES EQUINE MINIMAL)',
    title: 'GREIGE CASHMere & EBANO MATE',
    subtitle: 'Monocromo Organico Ultra-Limpio  |  Seda Cruda, Piedra Topo y Acento Taupe',
    concept:
      'La definicion mas pura del Lujo Silencioso europeo (estilo Loro Piana / Finca Sanro). Elimina cualquier color primario y trabaja con una escala arquitectonica de Greige (gris + beige natural #EFECE6), tarjetas en Seda Cruda (#F8F6F2) y bloques de contraste en Ebano Mate (#1A1917). El caballo Frison negro se convierte en el unico protagonista visual sin competir con colores saturados.',
    previewBg: '#EFECE6',
    previewCard: '#F8F6F2',
    previewText: '#1A1917',
    previewAccent: '#5C5346',
    previewButton: '#1A1917',
    swatches: [
      {
        name: 'Greige Cashmere',
        hex: '#EFECE6',
        role: 'Fondo Base Arquitectonico (Cero Blanco)',
        note: 'Mezcla perfecta entre piedra gris y lino calido; sofisticado y sereno.',
        textLight: false,
      },
      {
        name: 'Seda Cruda / Alabastro',
        hex: '#F8F6F2',
        role: 'Superficie de Tarjetas y Modulos',
        note: 'Eleva las tarjetas sobre el fondo greige con limpieza absoluta.',
        textLight: false,
      },
      {
        name: 'Ebano Mate',
        hex: '#1A1917',
        role: 'Bloques Hero, Botones y Titulares',
        note: 'Autoridad silenciosa tipo galeria de arte contemporanea.',
        textLight: true,
      },
      {
        name: 'Taupe Ecuestre',
        hex: '#5C5346',
        role: 'Acento Sutil, Badges y Lineas Finas',
        note: 'Evoca el mundo equino de forma limpia, moderna y cero arancherada.',
        textLight: true,
      },
      {
        name: 'Piedra Caliza Media',
        hex: '#E2DDD5',
        role: 'Celdas de Caracteristicas (Raza, Edad, Altura)',
        note: 'Tono neutro suave para las 6 tarjetas de especificaciones.',
        textLight: false,
      },
      {
        name: 'Gris Grafito Calido',
        hex: '#6E6A63',
        role: 'Textos Secundarios y Datos KFPS',
        note: 'Lectura impecable sin cansar la vista.',
        textLight: true,
      },
    ],
  },
  {
    number: 'PROPUESTA 03 (CONTRASTE ARQUITECTONICO 50/50)',
    title: 'GALERIA EDITORIAL: CARBON MATE & LINO CRUDO',
    subtitle: 'Ritmo Escandinavo-Mexicano  |  Alternancia Limpia entre Secciones Oscuras Mate y Lino',
    concept:
      'Para quienes buscan impacto visual sin caer en adornos ni saturacion. Alterna secciones completas en Carbon Mate Arquitectonico (#181918) —donde los videos y fotos de los frisones resaltan con dramatismo de cine— con secciones amplias y despejadas en Lino Crudo (#F2EFE9) y tarjetas en Piedra Suave (#E6E2DA). Cero ornamentos, 100% espacio negativo y proporcion.',
    previewBg: '#181918',
    previewCard: '#222422',
    previewText: '#F2EFE9',
    previewAccent: '#9A9080',
    previewButton: '#233529',
    swatches: [
      {
        name: 'Carbon Mate de Galeria',
        hex: '#181918',
        role: 'Hero Full-Screen, Cine y Cierres',
        note: 'Gris-negro mate desaturado (no cafe ni negro puro) de alto contraste.',
        textLight: true,
      },
      {
        name: 'Lino Crudo Editorial',
        hex: '#F2EFE9',
        role: 'Fondo de Catalogo y Fichas de Ejemplares',
        note: 'Aporta aire, luz natural y limpieza minimalista en las fichas.',
        textLight: false,
      },
      {
        name: 'Piedra Suave',
        hex: '#E6E2DA',
        role: 'Tarjetas Redondeadas Sin Bordes',
        note: 'Contraste organico y limpio sobre el fondo de lino crudo.',
        textLight: false,
      },
      {
        name: 'Bosque Nordico Mate',
        hex: '#233529',
        role: 'Acento Institucional y Botones',
        note: 'Conecta con la identidad de Cuadra Imperial Loy en clave minimalista.',
        textLight: true,
      },
      {
        name: 'Arena Titanio',
        hex: '#9A9080',
        role: 'Detalles Tipograficos y Numeracion',
        note: 'Sustituye al dorado brillante por un tono arena metalico mate.',
        textLight: false,
      },
      {
        name: 'Pizarra Suave',
        hex: '#222422',
        role: 'Tarjetas sobre Secciones Oscuras',
        note: 'Superficie elevada limpia cuando se navega en bloques nocturnos.',
        textLight: true,
      },
    ],
  },
];

function buildPageStream(palette, pageIndex) {
  const ops = [];

  // Clean Minimalist Page Background (#F4F2ED)
  ops.push(`${hexToRgb01('#F4F2ED')} rg 0 0 595 842 re f`);

  // Top Minimalist Header (#181816)
  ops.push(`${hexToRgb01('#181816')} rg 0 695 595 147 re f`);

  ops.push(
    `BT /F2 8.5 Tf ${hexToRgb01('#9A9080')} rg 36 794 Td (${pdfEscape(
      `CUADRA IMPERIAL LOY  |  QUIET LUXURY MINIMALISTA (ESTILO FINCA SANRO)  |  0${pageIndex + 1} / 03`
    )}) Tj ET`
  );
  ops.push(
    `BT /F2 9.5 Tf ${hexToRgb01('#D8D3C8')} rg 36 772 Td (${pdfEscape(palette.number)}) Tj ET`
  );
  ops.push(
    `BT /F2 20 Tf ${hexToRgb01('#F4F2ED')} rg 36 744 Td (${pdfEscape(palette.title)}) Tj ET`
  );
  ops.push(
    `BT /F1 9.5 Tf ${hexToRgb01('#A6A096')} rg 36 724 Td (${pdfEscape(palette.subtitle)}) Tj ET`
  );

  // Concept Paragraph Box
  let y = 666;
  ops.push(
    `BT /F2 10 Tf ${hexToRgb01('#181816')} rg 36 ${y} Td (${pdfEscape(
      'DIRECCION DE ARTE (MINIMALISMO LIMPIO, CERO SATURACION, CERO CLICHES RANCHEROS):'
    )}) Tj ET`
  );
  y -= 16;
  const conceptLines = wrapText(palette.concept, 94);
  for (const line of conceptLines) {
    ops.push(`BT /F1 9.5 Tf ${hexToRgb01('#4A4742')} rg 36 ${y} Td (${pdfEscape(line)}) Tj ET`);
    y -= 13.5;
  }

  // UI Simulation Preview Banner
  y -= 10;
  ops.push(`${hexToRgb01(palette.previewBg)} rg 36 ${y - 88} 523 88 re f`);
  ops.push(`0.84 0.82 0.78 RG 0.8 w 36 ${y - 88} 523 88 re S`);

  // Inner Card inside UI Simulation (Borderless clean card)
  ops.push(`${hexToRgb01(palette.previewCard)} rg 52 ${y - 74} 235 60 re f`);
  ops.push(
    `BT /F2 7.5 Tf ${hexToRgb01('#78736A')} rg 64 ${y - 32} Td (${pdfEscape(
      'VISTA PREVIA DE MODULO LIMPIO SIN BORDES'
    )}) Tj ET`
  );
  ops.push(
    `BT /F2 13.5 Tf ${hexToRgb01(palette.previewText)} rg 64 ${y - 50} Td (${pdfEscape(
      'YDE FAN DE KAMP  -  1.72 M'
    )}) Tj ET`
  );
  ops.push(
    `BT /F1 8.5 Tf ${hexToRgb01(palette.previewText)} rg 64 ${y - 64} Td (${pdfEscape(
      '202301054  -  FRISON KFPS  -  PAISES BAJOS'
    )}) Tj ET`
  );

  // Simulated CTA Button inside UI Simulation
  ops.push(`${hexToRgb01(palette.previewButton)} rg 310 ${y - 62} 225 36 re f`);
  ops.push(
    `BT /F2 9 Tf 0.96 0.95 0.93 rg 345 ${y - 47} Td (${pdfEscape(
      'SOLICITAR INFORMACION'
    )}) Tj ET`
  );

  y -= 114;
  ops.push(
    `BT /F2 10.5 Tf ${hexToRgb01('#181816')} rg 36 ${y} Td (${pdfEscape(
      'ESCALA CROMATICA DESATURADA Y ROL ARQUITECTONICO:'
    )}) Tj ET`
  );

  // 6 Large Swatch Cards (2 columns x 3 rows)
  const startY = y - 16;
  const colWidth = 254;
  const rowHeight = 104;

  palette.swatches.forEach((sw, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 36 + col * (colWidth + 15);
    const topY = startY - row * (rowHeight + 12);
    const boxBottom = topY - rowHeight;

    // Clean Card container
    ops.push(`0.98 0.97 0.95 rg ${x} ${boxBottom} ${colWidth} ${rowHeight} re f`);
    ops.push(`0.88 0.86 0.82 RG 0.6 w ${x} ${boxBottom} ${colWidth} ${rowHeight} re S`);

    // Color Swatch Band (top 44pt of card)
    ops.push(`${hexToRgb01(sw.hex)} rg ${x} ${topY - 44} ${colWidth} 44 re f`);

    // Hex & Name inside the color band
    const bandTextColor = sw.textLight ? '0.96 0.95 0.93' : '0.10 0.10 0.09';
    ops.push(
      `BT /F2 10.5 Tf ${bandTextColor} rg ${x + 12} ${topY - 20} Td (${pdfEscape(sw.name)}) Tj ET`
    );
    ops.push(
      `BT /F2 9.5 Tf ${bandTextColor} rg ${x + 188} ${topY - 20} Td (${pdfEscape(sw.hex)}) Tj ET`
    );
    ops.push(
      `BT /F1 7.8 Tf ${bandTextColor} rg ${x + 12} ${topY - 34} Td (${pdfEscape(sw.role.toUpperCase())}) Tj ET`
    );

    // Note below the swatch band
    const noteLines = wrapText(sw.note, 42);
    let ny = topY - 60;
    noteLines.forEach((nl) => {
      ops.push(`BT /F1 8.5 Tf 0.28 0.27 0.25 rg ${x + 12} ${ny} Td (${pdfEscape(nl)}) Tj ET`);
      ny -= 12;
    });
  });

  // Footer
  ops.push(`${hexToRgb01('#181816')} rg 0 0 595 36 re f`);
  ops.push(
    `BT /F1 8 Tf ${hexToRgb01('#A6A096')} rg 36 14 Td (${pdfEscape(
      'CUADRA IMPERIAL LOY  |  MINIMALISMO ECUESTRE CONTEMPORANEO  |  ZAPOTLANEJO, JALISCO'
    )}) Tj ET`
  );

  return ops.join('\n');
}

function generateMultiPagePdf() {
  const pageStreams = PALETTES.map((p, idx) => buildPageStream(p, idx));

  // Object IDs:
  // 1: Catalog
  // 2: Pages
  // 3: Font Helvetica (/F1)
  // 4: Font Helvetica-Bold (/F2)
  // Page 1: obj 5 (Page), obj 6 (Content)
  // Page 2: obj 7 (Page), obj 8 (Content)
  // Page 3: obj 9 (Page), obj 10 (Content)
  const objects = [];
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  objects.push('2 0 obj\n<< /Type /Pages /Kids [5 0 R 7 0 R 9 0 R] /Count 3 >>\nendobj\n');
  objects.push(
    '3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n'
  );
  objects.push(
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n'
  );

  pageStreams.forEach((stream, idx) => {
    const pageObjId = 5 + idx * 2;
    const contentObjId = 6 + idx * 2;
    const len = Buffer.byteLength(stream, 'latin1');
    objects.push(
      `${pageObjId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObjId} 0 R >>\nendobj\n`
    );
    objects.push(
      `${contentObjId} 0 obj\n<< /Length ${len} >>\nstream\n${stream}\nendstream\nendobj\n`
    );
  });

  let pdf = '%PDF-1.4\n';
  const offsets = [];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, 'latin1'));
    pdf += obj;
  }

  const xrefOffset = Buffer.byteLength(pdf, 'latin1');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (const off of offsets) {
    pdf += `${String(off).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  const rootOut = path.join(process.cwd(), 'Propuesta_Paletas_Cuadra_Imperial_Loy.pdf');
  const publicOut = path.join(process.cwd(), 'public', 'Propuesta_Paletas_Cuadra_Imperial_Loy.pdf');
  fs.writeFileSync(rootOut, Buffer.from(pdf, 'latin1'));
  fs.writeFileSync(publicOut, Buffer.from(pdf, 'latin1'));
  console.log('Generated PDF successfully at:', rootOut);
}

generateMultiPagePdf();

