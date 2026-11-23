/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Haswakarya Crewing OS — Penulis PDF minimal (tanpa dependensi)
 * Menghasilkan PDF 1.4 sah dengan font standar (Helvetica/Helvetica-Bold)
 * sehingga tidak perlu menyematkan berkas font dan aman di output `standalone`
 * Next.js. Murni & deterministik: input dokumen → `Uint8Array`.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface PdfColumn {
  header: string;
  /** Bobot lebar relatif antar kolom. */
  weight: number;
}

export interface PdfTable {
  columns: PdfColumn[];
  rows: string[][];
}

export interface PdfSection {
  heading?: string;
  paragraphs?: string[];
  bullets?: string[];
  table?: PdfTable;
}

export interface PdfMetaField {
  label: string;
  value: string;
}

export interface PdfDocumentModel {
  title: string;
  subtitle?: string;
  meta?: PdfMetaField[];
  sections: PdfSection[];
  footer?: string;
}

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 48;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const BOTTOM_LIMIT = MARGIN + 42;

const FONT_BODY = 'F1';
const FONT_BOLD = 'F2';

const HELVETICA_WIDTHS: Record<string, number> = {
  ' ': 278, '!': 278, '"': 355, '#': 556, $: 556, '%': 889, '&': 667, "'": 191,
  '(': 333, ')': 333, '*': 389, '+': 584, ',': 278, '-': 333, '.': 278, '/': 278,
  '0': 556, '1': 556, '2': 556, '3': 556, '4': 556, '5': 556, '6': 556, '7': 556,
  '8': 556, '9': 556, ':': 278, ';': 278, '<': 584, '=': 584, '>': 584, '?': 556,
  '@': 1015, A: 667, B: 667, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722,
  I: 278, J: 500, K: 667, L: 556, M: 833, N: 722, O: 778, P: 667, Q: 778, R: 722,
  S: 667, T: 611, U: 722, V: 667, W: 944, X: 667, Y: 667, Z: 611, '[': 278,
  '\\': 278, ']': 278, '^': 469, _: 556, '`': 333, a: 556, b: 556, c: 500, d: 556,
  e: 556, f: 278, g: 556, h: 556, i: 222, j: 222, k: 500, l: 222, m: 833, n: 556,
  o: 556, p: 556, q: 556, r: 333, s: 500, t: 278, u: 556, v: 500, w: 722, x: 500,
  y: 500, z: 500, '{': 334, '|': 260, '}': 334, '~': 584,
};

const HELVETICA_BOLD_WIDTHS: Record<string, number> = {
  ' ': 278, '!': 333, '"': 474, '#': 556, $: 556, '%': 889, '&': 722, "'": 238,
  '(': 333, ')': 333, '*': 389, '+': 584, ',': 278, '-': 333, '.': 278, '/': 278,
  '0': 556, '1': 556, '2': 556, '3': 556, '4': 556, '5': 556, '6': 556, '7': 556,
  '8': 556, '9': 556, ':': 333, ';': 333, '<': 584, '=': 584, '>': 584, '?': 611,
  '@': 975, A: 722, B: 722, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722,
  I: 278, J: 556, K: 722, L: 611, M: 833, N: 722, O: 778, P: 667, Q: 778, R: 722,
  S: 667, T: 611, U: 722, V: 667, W: 944, X: 667, Y: 667, Z: 611, '[': 333,
  '\\': 278, ']': 333, '^': 584, _: 556, '`': 333, a: 556, b: 611, c: 556, d: 611,
  e: 556, f: 333, g: 611, h: 611, i: 278, j: 278, k: 556, l: 278, m: 889, n: 611,
  o: 611, p: 611, q: 611, r: 389, s: 556, t: 333, u: 611, v: 556, w: 778, x: 556,
  y: 556, z: 500, '{': 389, '|': 280, '}': 389, '~': 584,
};

/**
 * Transliterasi ke ASCII agar string PDF aman tanpa peta encoding:
 * karakter di luar ASCII akan tampil sebagai `?` di banyak viewer.
 */
export function toAscii(input: string): string {
  return input
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E]/g, '"')
    .replace(/[\u2013\u2014\u2212]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\u00D7/g, 'x')
    .replace(/\u00A0/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E\n]/g, '?');
}

function widthsFor(font: string): Record<string, number> {
  return font === FONT_BOLD ? HELVETICA_BOLD_WIDTHS : HELVETICA_WIDTHS;
}

/** Lebar teks dalam point. */
export function measureText(text: string, font: string, size: number): number {
  const table = widthsFor(font);
  let total = 0;
  for (const char of text) {
    total += table[char] ?? 556;
  }
  return (total * size) / 1000;
}

/** Memecah teks menjadi baris yang muat pada `maxWidth`. */
export function wrapText(text: string, font: string, size: number, maxWidth: number): string[] {
  const clean = toAscii(text).replace(/\s+/g, ' ').trim();
  if (clean === '') return [''];

  const lines: string[] = [];
  let current = '';

  for (const word of clean.split(' ')) {
    const candidate = current === '' ? word : `${current} ${word}`;
    if (measureText(candidate, font, size) <= maxWidth) {
      current = candidate;
      continue;
    }

    if (current !== '') {
      lines.push(current);
      current = '';
    }

    // Kata tunggal yang lebih panjang dari kolom dipotong per karakter.
    let chunk = '';
    for (const char of word) {
      if (measureText(chunk + char, font, size) > maxWidth) {
        if (chunk !== '') lines.push(chunk);
        chunk = char;
      } else {
        chunk += char;
      }
    }
    current = chunk;
  }

  if (current !== '') lines.push(current);
  return lines.length > 0 ? lines : [''];
}

function escapePdfString(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function textOp(x: number, y: number, font: string, size: number, text: string): string {
  return `BT /${font} ${size} Tf 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm (${escapePdfString(
    toAscii(text)
  )}) Tj ET`;
}

function lineOp(x1: number, y1: number, x2: number, y2: number, gray = 0.75): string {
  return `${gray} ${gray} ${gray} RG 0.6 w ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(
    2
  )} ${y2.toFixed(2)} l S`;
}

function rectOp(x: number, y: number, w: number, h: number, gray: number): string {
  return `${gray} ${gray} ${gray} rg ${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(
    2
  )} re f 0 0 0 rg`;
}

interface LayoutState {
  pages: string[][];
  ops: string[];
  y: number;
}

function newPage(state: LayoutState): void {
  if (state.ops.length > 0) state.pages.push(state.ops);
  state.ops = [];
  state.y = PAGE_HEIGHT - MARGIN;
}

function ensureSpace(state: LayoutState, needed: number): void {
  if (state.y - needed < BOTTOM_LIMIT) newPage(state);
}

interface FittedCell {
  size: number;
  lines: string[];
}

/**
 * Menyesuaikan ukuran huruf sel agar kata terpanjang tidak terpotong di tengah.
 * Bila tetap tidak muat pada ukuran terkecil, teks dipotong per karakter.
 */
function fitCell(text: string, font: string, maxWidth: number, sizes: number[]): FittedCell {
  const longestWord = text.split(/\s+/).reduce((longest, word) =>
    measureText(word, font, sizes[sizes.length - 1]) > measureText(longest, font, sizes[sizes.length - 1])
      ? word
      : longest
  , '');

  for (const size of sizes) {
    if (measureText(longestWord, font, size) <= maxWidth) {
      return { size, lines: wrapText(text, font, size, maxWidth) };
    }
  }

  const smallest = sizes[sizes.length - 1];
  return { size: smallest, lines: wrapText(text, font, smallest, maxWidth) };
}

function drawTable(state: LayoutState, table: PdfTable, pageBreak: () => void): void {
  const totalWeight = table.columns.reduce((sum, column) => sum + column.weight, 0) || 1;
  const widths = table.columns.map((column) => (column.weight / totalWeight) * CONTENT_WIDTH);
  const bodySizes = [8.5, 8, 7.5, 7];
  const headSizes = [8.5, 8, 7.5, 7];
  const padding = 4;
  const leading = 1.24;

  const headerCells = table.columns.map((column, index) =>
    fitCell(column.header, FONT_BOLD, widths[index] - padding * 2, headSizes)
  );
  const headerHeight =
    Math.max(...headerCells.map((cell) => cell.lines.length * cell.size * leading)) + padding * 2;

  const drawHeader = () => {
    state.ops.push(rectOp(MARGIN, state.y - headerHeight, CONTENT_WIDTH, headerHeight, 0.9));
    let x = MARGIN;
    headerCells.forEach((cell, index) => {
      let textY = state.y - padding - cell.size;
      for (const line of cell.lines) {
        state.ops.push(textOp(x + padding, textY, FONT_BOLD, cell.size, line));
        textY -= cell.size * leading;
      }
      x += widths[index];
    });
    state.y -= headerHeight;
    state.ops.push(lineOp(MARGIN, state.y, MARGIN + CONTENT_WIDTH, state.y));
  };

  ensureSpace(state, headerHeight + 10.5 * 2);
  drawHeader();

  for (const row of table.rows) {
    const cells = table.columns.map((_, index) =>
      fitCell(row[index] ?? '', FONT_BODY, widths[index] - padding * 2, bodySizes)
    );
    const rowHeight =
      Math.max(...cells.map((cell) => Math.max(1, cell.lines.length) * cell.size * leading)) +
      padding * 2;

    if (state.y - rowHeight < BOTTOM_LIMIT) {
      pageBreak();
      drawHeader();
    }

    let x = MARGIN;
    cells.forEach((cell, index) => {
      let textY = state.y - padding - cell.size;
      for (const line of cell.lines) {
        state.ops.push(textOp(x + padding, textY, FONT_BODY, cell.size, line));
        textY -= cell.size * leading;
      }
      x += widths[index];
    });

    state.y -= rowHeight;
    state.ops.push(lineOp(MARGIN, state.y, MARGIN + CONTENT_WIDTH, state.y, 0.88));
  }
}

/** Menyusun isi halaman dari model dokumen. */
export function layoutDocument(doc: PdfDocumentModel): string[][] {
  const state: LayoutState = { pages: [], ops: [], y: PAGE_HEIGHT - MARGIN };
  const pageBreak = () => newPage(state);

  // ── Kepala dokumen ──────────────────────────────────────────────────────
  for (const line of wrapText(doc.title, FONT_BOLD, 17, CONTENT_WIDTH)) {
    state.ops.push(textOp(MARGIN, state.y - 17, FONT_BOLD, 17, line));
    state.y -= 21;
  }
  if (doc.subtitle) {
    for (const line of wrapText(doc.subtitle, FONT_BODY, 10.5, CONTENT_WIDTH)) {
      state.ops.push(textOp(MARGIN, state.y - 10.5, FONT_BODY, 10.5, line));
      state.y -= 13;
    }
  }
  state.y -= 6;
  state.ops.push(lineOp(MARGIN, state.y, MARGIN + CONTENT_WIDTH, state.y, 0.35));
  state.y -= 14;

  if (doc.meta && doc.meta.length > 0) {
    const labelWidth = 120;
    for (const field of doc.meta) {
      const valueLines = wrapText(field.value || '-', FONT_BODY, 9.5, CONTENT_WIDTH - labelWidth);
      const height = Math.max(1, valueLines.length) * 12;
      ensureSpace(state, height);
      state.ops.push(textOp(MARGIN, state.y - 9.5, FONT_BOLD, 9.5, `${field.label}`));
      let valueY = state.y - 9.5;
      for (const line of valueLines) {
        state.ops.push(textOp(MARGIN + labelWidth, valueY, FONT_BODY, 9.5, line));
        valueY -= 12;
      }
      state.y -= height;
    }
    state.y -= 6;
  }

  // ── Bagian-bagian ──────────────────────────────────────────────────────
  for (const section of doc.sections) {
    if (section.heading) {
      ensureSpace(state, 34);
      state.y -= 8;
      for (const line of wrapText(section.heading.toUpperCase(), FONT_BOLD, 10.5, CONTENT_WIDTH)) {
        state.ops.push(textOp(MARGIN, state.y - 10.5, FONT_BOLD, 10.5, line));
        state.y -= 13;
      }
      state.ops.push(rectOp(MARGIN, state.y - 1.5, 46, 1.5, 0.55));
      state.y -= 10;
    }

    for (const paragraph of section.paragraphs ?? []) {
      for (const line of wrapText(paragraph, FONT_BODY, 9.5, CONTENT_WIDTH)) {
        ensureSpace(state, 12);
        state.ops.push(textOp(MARGIN, state.y - 9.5, FONT_BODY, 9.5, line));
        state.y -= 12;
      }
      state.y -= 3;
    }

    for (const bullet of section.bullets ?? []) {
      const lines = wrapText(bullet, FONT_BODY, 9.5, CONTENT_WIDTH - 14);
      ensureSpace(state, lines.length * 12);
      let first = true;
      for (const line of lines) {
        if (first) {
          state.ops.push(textOp(MARGIN, state.y - 9.5, FONT_BODY, 9.5, '-'));
          first = false;
        }
        state.ops.push(textOp(MARGIN + 14, state.y - 9.5, FONT_BODY, 9.5, line));
        state.y -= 12;
      }
    }

    if (section.table) {
      state.y -= 2;
      drawTable(state, section.table, pageBreak);
      state.y -= 6;
    }
  }

  if (state.ops.length > 0) state.pages.push(state.ops);
  if (state.pages.length === 0) state.pages.push(['']);

  // ── Footer: nomor halaman + label dokumen ───────────────────────────────
  const total = state.pages.length;
  return state.pages.map((ops, index) => {
    const footer = doc.footer ? toAscii(doc.footer) : 'Haswakarya Crewing OS';
    return [
      ...ops,
      lineOp(MARGIN, BOTTOM_LIMIT - 12, MARGIN + CONTENT_WIDTH, BOTTOM_LIMIT - 12, 0.85),
      textOp(MARGIN, BOTTOM_LIMIT - 24, FONT_BODY, 8, footer.slice(0, 90)),
      textOp(PAGE_WIDTH - MARGIN - 60, BOTTOM_LIMIT - 24, FONT_BODY, 8, `Halaman ${index + 1} / ${total}`),
    ];
  });
}

/** Merangkai objek PDF dan tabel xref. Deterministik (tanpa timestamp). */
export function assemblePdf(pages: string[][]): Uint8Array {
  const objects: string[] = [];
  const pageCount = pages.length;
  const firstPageObject = 5;

  objects.push('<< /Type /Catalog /Pages 2 0 R >>');
  objects.push(''); // diisi setelah jumlah halaman diketahui
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');

  const kids: string[] = [];
  for (let index = 0; index < pageCount; index += 1) {
    const pageObject = firstPageObject + index * 2;
    const contentObject = pageObject + 1;
    kids.push(`${pageObject} 0 R`);

    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH.toFixed(2)} ${PAGE_HEIGHT.toFixed(
        2
      )}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObject} 0 R >>`
    );

    const content = pages[index].join('\n');
    objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  }

  objects[1] = `<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${pageCount} >>`;

  const header = '%PDF-1.4\n';
  let body = '';
  const offsets: number[] = [];

  objects.forEach((object, index) => {
    offsets.push(header.length + body.length);
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = header.length + body.length;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) {
    xref += `${String(offset).padStart(10, '0')} 00000 n \n`;
  }
  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  const full = header + body + xref + trailer;
  const bytes = new Uint8Array(full.length);
  for (let index = 0; index < full.length; index += 1) {
    bytes[index] = full.charCodeAt(index) & 0xff;
  }
  return bytes;
}

/** Model dokumen → berkas PDF. */
export function renderPdf(doc: PdfDocumentModel): Uint8Array {
  return assemblePdf(layoutDocument(doc));
}