import { describe, expect, it } from 'vitest';
import { ALWAYS_ALLOWED_NUMBERS, collectNumbers, findUnsupportedNumbersInTexts } from '@/lib/ai/numberGuard';

describe('collectNumbers', () => {
  it('mengumpulkan angka dari angka dan string bersarang', () => {
    const numbers = collectNumbers({ score: 82, years: 9.4, nested: ['48 bulan', true, null] });
    expect(numbers.has(82)).toBe(true);
    expect(numbers.has(9.4)).toBe(true);
    expect(numbers.has(48)).toBe(true);
    expect(numbers.has(1)).toBe(false);
  });

  it('membaca desimal berkoma sebagai satu nilai', () => {
    expect(collectNumbers('9,4 tahun').has(9.4)).toBe(true);
  });

  it('mengabaikan nilai yang tidak bisa dihitung', () => {
    expect([...collectNumbers({ a: undefined, b: () => 1 })].length).toBe(0);
  });
});

describe('findUnsupportedNumbersInTexts — penjaga halusinasi kuantitatif', () => {
  const facts = { score: 82, tankerYears: 6.1 };

  it('meloloskan angka yang ada pada fakta', () => {
    expect(findUnsupportedNumbersInTexts(['Skor matriks 82.'], facts)).toEqual([]);
  });

  it('meloloskan desimal berkoma yang cocok dengan fakta', () => {
    expect(findUnsupportedNumbersInTexts(['Jam layar tanker 6,1 tahun.'], facts)).toEqual([]);
  });

  it('meloloskan bagian bulat dari desimal pada fakta', () => {
    expect(findUnsupportedNumbersInTexts(['Sekitar 6 tahun di tanker.'], facts)).toEqual([]);
  });

  it('meloloskan angka 0–5 sebagai angka baku narasi', () => {
    const text = '3 sertifikat inti dan 2 catatan.';
    expect(findUnsupportedNumbersInTexts([text], facts)).toEqual([]);
    expect(ALWAYS_ALLOWED_NUMBERS.has(5)).toBe(true);
  });

  it('menandai angka yang tidak ada pada fakta', () => {
    expect(findUnsupportedNumbersInTexts(['Kandidat punya 240 bulan layar.'], facts)).toEqual([240]);
  });

  it('tidak menghitung angka yang sama dua kali', () => {
    const offenders = findUnsupportedNumbersInTexts(['99 bulan', 'lagi 99 bulan'], facts);
    expect(offenders).toEqual([99]);
  });

  it('mengabaikan teks kosong', () => {
    expect(findUnsupportedNumbersInTexts(['', '   '], facts)).toEqual([]);
  });
});