/**
 * Mesin PPh 21 pegawai tetap (pelaut) — fungsi murni, tanpa I/O.
 *
 * Dasar aturan yang dipakai:
 * - UU HPP (UU 7/2021) Pasal 17: lapisan tarif progresif 5% / 15% / 25% / 30% / 35%.
 * - PMK 250/PMK.03/2008: biaya jabatan 5% dari penghasilan bruto, maksimum
 *   Rp6.000.000 per tahun (Rp500.000 per bulan).
 * - PMK 101/PMK.010/2016: PTKP TK/0 Rp54.000.000, tambahan kawin Rp4.500.000,
 *   tambahan per tanggungan Rp4.500.000 (maksimum 3 tanggungan).
 *
 * Cara pemotongan bulanan: metode annualisasi Pasal 17 — bruto bulan berjalan
 * disetahunkan, dikurangi biaya jabatan dan PTKP, dihitung tarif progresif,
 * lalu dibagi 12. Pada masa Desember (bulan 12) pemotongan disesuaikan dengan
 * pajak tahunan sebenarnya sehingga total setahun selalu sama dengan pajak
 * terutang; selisihnya bisa negatif bila terjadi lebih potong.
 *
 * CATATAN PENTING: tabel Tarif Efektif Rata-rata (TER) PP 58/2023 sengaja
 * BELUM diimplementasikan karena lampiran resminya tidak tersedia di repo ini
 * dan angka tabel tidak boleh ditebak. Bila lampiran resmi diperoleh, tambahkan
 * sebagai data tabel terpisah lalu pilih lewat `scheme`.
 */

import { NPWP_PLACEHOLDER, normalizeNpwp } from "./npwp";

export type PtkpStatus = "TK0" | "TK1" | "TK2" | "TK3" | "K0" | "K1" | "K2" | "K3";

/** Jenis kelamin tidak memengaruhi tarif; status kawin (K*) menambah PTKP. */
const PTKP_BASE_TK0 = 54_000_000;
const PTKP_MARRIED_ADDITION = 4_500_000;
const PTKP_DEPENDENT_ADDITION = 4_500_000;
const PTKP_MAX_DEPENDENTS = 3;

const BIOAYA_JABATAN_RATE = 0.05;
const BIOAYA_JABATAN_ANNUAL_CAP = 6_000_000;

export const MONTHS_PER_YEAR = 12;

/** Lapisan tarif Pasal 17: batas atas penghasilan kena pajak (inklusif) dan tarifnya. */
export interface TaxBracket {
  readonly upTo: number;
  readonly rate: number;
}

export const PASAL_17_BRACKETS: readonly TaxBracket[] = [
  { upTo: 60_000_000, rate: 0.05 },
  { upTo: 250_000_000, rate: 0.15 },
  { upTo: 500_000_000, rate: 0.25 },
  { upTo: 5_000_000_000, rate: 0.3 },
  { upTo: Number.POSITIVE_INFINITY, rate: 0.35 },
];

export interface PtkpBreakdown {
  readonly status: PtkpStatus;
  readonly base: number;
  readonly marriedAddition: number;
  readonly dependentAddition: number;
  readonly annual: number;
}

const PTKP_TABLE: Record<PtkpStatus, { married: boolean; dependents: number }> = {
  TK0: { married: false, dependents: 0 },
  TK1: { married: false, dependents: 1 },
  TK2: { married: false, dependents: 2 },
  TK3: { married: false, dependents: 3 },
  K0: { married: true, dependents: 0 },
  K1: { married: true, dependents: 1 },
  K2: { married: true, dependents: 2 },
  K3: { married: true, dependents: 3 },
};

export function isPtkpStatus(value: unknown): value is PtkpStatus {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(PTKP_TABLE, value);
}

/** PTKP tahunan rinci; status tak dikenal diperlakukan sebagai TK/0. */
export function ptkpBreakdown(status: PtkpStatus = "TK0"): PtkpBreakdown {
  const entry = PTKP_TABLE[status] ?? PTKP_TABLE.TK0;
  const marriedAddition = entry.married ? PTKP_MARRIED_ADDITION : 0;
  const dependents = Math.min(entry.dependents, PTKP_MAX_DEPENDENTS);
  const dependentAddition = dependents * PTKP_DEPENDENT_ADDITION;
  return {
    status: PTKP_TABLE[status] ? status : "TK0",
    base: PTKP_BASE_TK0,
    marriedAddition,
    dependentAddition,
    annual: PTKP_BASE_TK0 + marriedAddition + dependentAddition,
  };
}

export function ptkpAnnual(status: PtkpStatus = "TK0"): number {
  return ptkpBreakdown(status).annual;
}

/** Biaya jabatan tahunan: 5% bruto, dibatasi Rp6.000.000. */
export function biayaJabatanAnnual(annualGross: number): number {
  const gross = Math.max(0, annualGross);
  return Math.round(Math.min(gross * BIOAYA_JABATAN_RATE, BIOAYA_JABATAN_ANNUAL_CAP));
}

/** Pajak progresif Pasal 17 atas penghasilan kena pajak (dibulatkan ke rupiah). */
export function progressiveTax(pkp: number): number {
  let remaining = Math.max(0, pkp);
  let previousLimit = 0;
  let tax = 0;

  for (const bracket of PASAL_17_BRACKETS) {
    if (remaining <= 0) break;
    const width = bracket.upTo - previousLimit;
    const slice = Math.min(remaining, width);
    tax += slice * bracket.rate;
    remaining -= slice;
    previousLimit = bracket.upTo;
  }

  return Math.round(tax);
}

export interface AnnualTaxDetail {
  readonly annualGross: number;
  readonly biayaJabatan: number;
  readonly ptkp: PtkpBreakdown;
  readonly pkp: number;
  readonly annualTax: number;
}

/** Perhitungan pajak setahun dari bruto bulanan berjalan (metode annualisasi). */
export function annualTaxDetail(
  monthlyGross: number,
  status: PtkpStatus = "TK0"
): AnnualTaxDetail {
  const annualGross = Math.max(0, monthlyGross) * MONTHS_PER_YEAR;
  const biayaJabatan = biayaJabatanAnnual(annualGross);
  const ptkp = ptkpBreakdown(status);
  const pkp = Math.max(0, Math.floor(annualGross - biayaJabatan - ptkp.annual));
  return {
    annualGross,
    biayaJabatan,
    ptkp,
    pkp,
    annualTax: progressiveTax(pkp),
  };
}

export interface MonthlyWithholdingInput {
  /** Bruto bulan berjalan (IDR). Nilai negatif diperlakukan sebagai 0. */
  readonly monthlyGross: number;
  readonly status?: PtkpStatus;
  /** 1–12; menentukan apakah masa ini masa koreksi tahunan. */
  readonly month?: number;
  /** Total PPh 21 yang sudah dipotong pada masa-masa sebelumnya di tahun pajak yang sama. */
  readonly priorWithheldTotal?: number;
}

export interface MonthlyWithholdingResult {
  readonly monthlyGross: number;
  readonly status: PtkpStatus;
  readonly month: number;
  readonly ptkpAnnual: number;
  readonly biayaJabatan: number;
  readonly pkp: number;
  readonly annualTax: number;
  /** Pajak bulanan "normal" = pajak tahunan / 12. */
  readonly monthlyTarget: number;
  /** Nominal yang harus dipotong masa ini. Bisa negatif pada masa koreksi (lebih potong). */
  readonly amount: number;
  /** True hanya pada masa Desember; amount adalah selisih koreksi. */
  readonly isCorrection: boolean;
  /**
   * Neto setelah potongan PPh 21. Nilainya bisa negatif pada masa Desember bila
   * potongan koreksi melebihi bruto bulan itu (misal masa 1–11 tidak pernah
   * dipotong); nilai negatif berarti pelaut masih berutang PPh 21.
   */
  readonly netWage: number;
}

/**
 * Potongan PPh 21 satu masa pajak.
 *
 * - Masa 1–11: `Math.round(pajak tahunan / 12)`.
 * - Masa 12: `pajak tahunan - total yang sudah dipotong` (koreksi, boleh negatif).
 */
export function computeMonthlyWithholding(
  input: MonthlyWithholdingInput
): MonthlyWithholdingResult {
  const monthlyGross = Math.max(0, Number.isFinite(input.monthlyGross) ? input.monthlyGross : 0);
  const status = isPtkpStatus(input.status) ? input.status : "TK0";
  const month = clampMonth(input.month);
  const priorRaw = Number(input.priorWithheldTotal ?? 0);
  const priorWithheldTotal = Number.isFinite(priorRaw) ? Math.max(0, priorRaw) : 0;

  const detail = annualTaxDetail(monthlyGross, status);
  const monthlyTarget = Math.round(detail.annualTax / MONTHS_PER_YEAR);
  const isCorrection = month === MONTHS_PER_YEAR;
  const amount = isCorrection ? Math.round(detail.annualTax - priorWithheldTotal) : monthlyTarget;

  return {
    monthlyGross: Math.round(monthlyGross),
    status,
    month,
    ptkpAnnual: detail.ptkp.annual,
    biayaJabatan: detail.biayaJabatan,
    pkp: detail.pkp,
    annualTax: detail.annualTax,
    monthlyTarget,
    amount,
    isCorrection,
    netWage: Math.round(monthlyGross) - amount,
  };
}

function clampMonth(month: number | undefined): number {
  if (!Number.isFinite(month)) return 1;
  const value = Math.trunc(month as number);
  if (value < 1) return 1;
  if (value > MONTHS_PER_YEAR) return MONTHS_PER_YEAR;
  return value;
}

export interface TaxSummaryRow {
  readonly monthlyGross: number;
  readonly pph21Amount: number;
  readonly npwp?: string | null;
}

export interface TaxSummary {
  readonly totalGross: number;
  readonly totalTaxableGross: number;
  readonly totalPph21: number;
  readonly totalNet: number;
  readonly recordCount: number;
  readonly missingNpwpCount: number;
}

/** Agregat satu masa pajak untuk ringkasan & ekspor. */
export function summarizeTaxPeriod(rows: readonly TaxSummaryRow[]): TaxSummary {
  let totalGross = 0;
  let totalTaxableGross = 0;
  let totalPph21 = 0;
  let totalNet = 0;
  let missingNpwpCount = 0;

  for (const row of rows) {
    const gross = Math.max(0, row.monthlyGross || 0);
    const tax = row.pph21Amount || 0;
    totalGross += gross;
    totalTaxableGross += gross;
    totalPph21 += tax;
    totalNet += gross - tax;
    if (!normalizeNpwp(row.npwp)) missingNpwpCount += 1;
  }

  return {
    totalGross: Math.round(totalGross),
    totalTaxableGross: Math.round(totalTaxableGross),
    totalPph21: Math.round(totalPph21),
    totalNet: Math.round(totalNet),
    recordCount: rows.length,
    missingNpwpCount,
  };
}

export interface EbupotRow {
  readonly npwp?: string | null;
  readonly name: string;
  readonly periodMonth: number;
  readonly periodYear: number;
  readonly gross: number;
  readonly tax: number;
}

/** Kode objek pajak e-Bupot untuk penghasilan pegawai tetap. */
export const KODE_OBJEK_PAJAK_PEGAWAI_TETAP = "21-100-01";

const EBUPOT_HEADER = [
  "NPWP",
  "Nama Wajib Pajak",
  "Masa Pajak",
  "Tahun Pajak",
  "Kode Objek Pajak",
  "Penghasilan Bruto",
  "Tarif",
  "PPh 21 Dipotong",
] as const;

function csvCell(value: string | number): string {
  const text = String(value);
  if (/[",\r\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

/**
 * CSV bukti potong untuk diimpor ke e-Bupot. Format angka memakai titik desimal
 * (bukan koma) dan tanpa pemisah ribuan agar terbaca sebagai angka oleh Excel
 * dengan locale apa pun. Selalu diakhiri newline.
 */
export function buildEbupotCsv(rows: readonly EbupotRow[]): string {
  const lines: string[] = [EBUPOT_HEADER.map(csvCell).join(",")];

  for (const row of rows) {
    const gross = Math.max(0, Math.round(row.gross || 0));
    const tax = Math.round(row.tax || 0);
    const rate = gross > 0 ? Math.round((tax / gross) * 100 * 10_000) / 10_000 : 0;
    lines.push(
      [
        csvCell(normalizeNpwp(row.npwp) ?? NPWP_PLACEHOLDER),
        csvCell(row.name),
        csvCell(row.periodMonth),
        csvCell(row.periodYear),
        csvCell(KODE_OBJEK_PAJAK_PEGAWAI_TETAP),
        csvCell(gross),
        csvCell(rate),
        csvCell(tax),
      ].join(",")
    );
  }

  return `${lines.join("\r\n")}\r\n`;
}
