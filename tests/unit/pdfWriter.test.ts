import { describe, expect, it, beforeEach } from 'vitest';
import {
  measureText,
  wrapText,
  toAscii,
  layoutDocument,
  assemblePdf,
  renderPdf,
  type PdfDocumentModel,
} from '@/lib/pdf/pdfWriter';

const sampleDocument: PdfDocumentModel = {
  title: 'Perjanjian Kerja Laut (PKL)',
  subtitle: 'Nomor: PKL-2026-HWK-001',
  meta: [{ label: 'Status kontrak', value: 'Draf' }],
  sections: [
    {
      heading: 'Para Pihak',
      paragraphs: ['Pemberi kerja dan pelaut sepakat atas syarat berikut.'],
      bullets: ['Upah dibayar tepat waktu.', 'Repatriasi ditanggung pemberi kerja.'],
      table: {
        columns: [
          { header: 'Item', weight: 1 },
          { header: 'Keterangan', weight: 2 },
        ],
        rows: [
          ['Nama', 'Budi Santoso'],
          ['Jabatan', 'Master'],
        ],
      },
    },
  ],
  footer: 'PKL PKL-2026-HWK-001',
};

function decode(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => String.fromCharCode(byte))
    .join('');
}

describe('pdfWriter — transliterasi & pengukuran', () => {
  it('mengubah karakter non-ASCII menjadi ASCII aman', () => {
    expect(toAscii('Upah – 80% × bulan')).toBe('Upah - 80% x bulan');
    expect(toAscii('André')).toBe('Andre');
    expect(toAscii('a\u00A0b')).toBe('a b');
  });

  it('mengukur Helvetica-Bold lebih lebar daripada Helvetica biasa', () => {
    expect(measureText('MASTER', 'F2', 10)).toBeGreaterThan(measureText('MASTER', 'F1', 10));
  });

  it('memecah teks panjang menjadi beberapa baris yang muat', () => {
    const lines = wrapText('lorem ipsum dolor sit amet '.repeat(6), 'F1', 10, 200);
    expect(lines.length).toBeGreaterThan(1);
    for (const line of lines) {
      expect(measureText(line, 'F1', 10)).toBeLessThanOrEqual(200 + 0.5);
    }
  });

  it('memotong kata tunggal yang lebih panjang dari kolom', () => {
    const lines = wrapText('A'.repeat(120), 'F1', 10, 100);
    expect(lines.length).toBeGreaterThan(1);
    for (const line of lines) {
      expect(measureText(line, 'F1', 10)).toBeLessThanOrEqual(100 + 0.5);
    }
  });

  it('mengembalikan satu baris kosong untuk teks kosong', () => {
    expect(wrapText('   ', 'F1', 10, 100)).toEqual(['']);
  });
});

describe('pdfWriter — layout & perakitan berkas', () => {
  it('menghasilkan minimal satu halaman berisi operator teks', () => {
    const pages = layoutDocument(sampleDocument);
    expect(pages.length).toBeGreaterThanOrEqual(1);
    expect(pages[0].join('')).toContain('BT /F1');
  });

  it('memecah dokumen panjang menjadi banyak halaman', () => {
    const longDocument: PdfDocumentModel = {
      title: 'Riwayat Layar',
      sections: [
        {
          heading: 'Daftar',
          table: {
            columns: [
              { header: 'Kapal', weight: 1 },
              { header: 'Tahun', weight: 1 },
            ],
            rows: Array.from({ length: 120 }, (_, index) => [`MV Contoh ${index}`, String(2000 + index)]),
          },
        },
      ],
    };
    const pages = layoutDocument(longDocument);
    expect(pages.length).toBeGreaterThan(1);
  });

  it('menyusun header, xref, trailer, dan offset yang konsisten', () => {
    const bytes = renderPdf(sampleDocument);
    const text = decode(bytes);

    expect(text.startsWith('%PDF-1.4\n')).toBe(true);
    expect(text).toContain('/Type /Catalog');
    expect(text).toContain('/BaseFont /Helvetica-Bold');
    expect(text.trimEnd().endsWith('%%EOF')).toBe(true);

    const startxrefMatch = text.match(/startxref\n(\d+)\n/);
    expect(startxrefMatch).not.toBeNull();
    const xrefOffset = Number(startxrefMatch?.[1]);
    expect(text.slice(xrefOffset, xrefOffset + 4)).toBe('xref');

    // Setiap offset objek di xref harus menunjuk ke "N 0 obj".
    const pageCount = Number(text.match(/\/Count (\d+)/)?.[1]);
    const objectCount = bytes.length > 0 ? Number(text.match(/\/Size (\d+)/)?.[1]) : 0;
    expect(objectCount).toBe(4 + pageCount * 2 + 1);

    const xrefSection = text.slice(xrefOffset);
    const entries = [...xrefSection.matchAll(/^(\d{10}) 00000 n $/gm)].map((match) =>
      Number(match[1])
    );
    expect(entries.length).toBe(objectCount - 1);
    entries.forEach((offset, index) => {
      expect(text.slice(offset, offset + `${index + 1} 0 obj`.length)).toBe(`${index + 1} 0 obj`);
    });
  });

  it('menulis /Length stream sesuai panjang isi sebenarnya', () => {
    const bytes = renderPdf(sampleDocument);
    const text = decode(bytes);
    const matches = [...text.matchAll(/<< \/Length (\d+) >>\nstream\n/g)];
    expect(matches.length).toBeGreaterThan(0);

    for (const match of matches) {
      const declared = Number(match[1]);
      const start = (match.index ?? 0) + match[0].length;
      const body = text.slice(start, start + declared);
      expect(text.slice(start + declared, start + declared + '\nendstream'.length)).toBe('\nendstream');
      expect(body.length).toBe(declared);
    }
  });

  it('tidak menyertakan timestamp sehingga keluaran deterministik', () => {
    const first = renderPdf(sampleDocument);
    const second = renderPdf(sampleDocument);
    expect(first.length).toBe(second.length);
    expect(Array.from(first)).toEqual(Array.from(second));
    expect(decode(first)).not.toContain('CreationDate');
  });
});

describe('pdfWriter — tabel', () => {
  let longTable: PdfDocumentModel;

  beforeEach(() => {
    longTable = {
      title: 'Tabel Panjang',
      sections: [
        {
          heading: 'Data',
          table: {
            columns: [
              { header: 'Kolom A', weight: 1 },
              { header: 'Kolom B', weight: 1 },
            ],
            rows: Array.from({ length: 90 }, (_, index) => [
              `Nilai ${index}`,
              `Keterangan panjang untuk baris ${index} yang perlu dibungkus`.repeat(2),
            ]),
          },
        },
      ],
    };
  });

  it('mengulang header tabel pada halaman baru', () => {
    const pages = layoutDocument(longTable);
    expect(pages.length).toBeGreaterThan(1);
    for (const page of pages.slice(1)) {
      expect(page.join('')).toContain('Kolom A');
    }
  });

  it('menjaga seluruh baris tabel tetap tercetak', () => {
    const pages = layoutDocument(longTable);
    const content = pages.map((page) => page.join('')).join('');
    expect(content).toContain('Nilai 0');
    expect(content).toContain('Nilai 89');
  });
});