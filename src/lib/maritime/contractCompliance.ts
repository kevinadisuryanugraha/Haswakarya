/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Haswakarya Crewing OS — Kepatuhan masa kontrak ILO MLC 2006
 *
 * Aturan yang dipakai (MLC 2006 Reg. 2.1 + amandemen 2018): masa kerja maksimum
 * dalam satu kontrak adalah 11 bulan. Setelah itu pelaut berhak atas cuti
 * darat/biaya repatriasi; kontrak yang menjadwalkan lebih dari 11 bulan sudah
 * melanggar sejak ditandatangani, bukan hanya ketika batas terlewati.
 *
 * Modul ini murni (tanpa Prisma/tanpa NextJS) supaya bisa diuji dan dipakai
 * bersama oleh API, worker, dan komponen UI.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const ILO_MAX_CONTRACT_MONTHS = 11;

/** Ambang peringatan: kontrak dianggap "segera berakhir" pada 30 hari terakhir. */
export const DUE_SOON_DAYS = 30;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type ContractComplianceStatus =
  /** Masih jauh dari batas MLC maupun akhir kontrak. */
  | 'ON_TRACK'
  /** Sisa ≤ 30 hari menuju batas 11 bulan atau akhir kontrak. */
  | 'DUE_SOON'
  /** Batas MLC 11 bulan sudah/akan terlewati. */
  | 'MLC_BREACH'
  /** Data tidak lengkap atau tidak masuk akal. */
  | 'UNKNOWN';

export interface ContractWindow {
  signOnDate: string;
  scheduledEndDate: string;
  mlcLimitDate: string;
  monthsContracted: number;
  /** Sisa hari menuju akhir kontrak yang dijadwalkan (negatif = sudah lewat). */
  daysToScheduledEnd: number;
  /** Sisa hari menuju batas 11 bulan (negatif = sudah terlewati). */
  daysToMlcLimit: number;
  status: ContractComplianceStatus;
}

function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function daysInMonthUtc(year: number, monthIndex: number): number {
  // Hari ke-0 bulan berikutnya = hari terakhir bulan ini.
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

/**
 * Menambah bulan kalender dengan penguncian hari (31 Jan + 1 bulan = 28/29 Feb),
 * dihitung dalam UTC agar hasil tidak bergantung zona waktu server.
 */
export function addMonthsUtc(date: Date, months: number): Date {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const targetMonth = month + months;
  const targetYear = year + Math.floor(targetMonth / 12);
  const normalizedMonth = ((targetMonth % 12) + 12) % 12;
  const clampedDay = Math.min(day, daysInMonthUtc(targetYear, normalizedMonth));
  return new Date(
    Date.UTC(
      targetYear,
      normalizedMonth,
      clampedDay,
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds()
    )
  );
}

function wholeDaysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

/**
 * Menghitung jendela kontrak dan status kepatuhannya.
 * `now` dapat diinjeksi agar pengujian deterministik.
 */
export function contractWindow(
  signOnDate: Date | string | null | undefined,
  durationMonths: number,
  now: Date | string = new Date()
): ContractWindow {
  const signOn = toDate(signOnDate);
  const reference = toDate(now);
  const months = Number(durationMonths);

  if (!signOn || !reference || !Number.isFinite(months) || months <= 0) {
    return {
      signOnDate: signOn ? signOn.toISOString() : '',
      scheduledEndDate: '',
      mlcLimitDate: '',
      monthsContracted: Number.isFinite(months) ? months : 0,
      daysToScheduledEnd: 0,
      daysToMlcLimit: 0,
      status: 'UNKNOWN',
    };
  }

  const scheduledEnd = addMonthsUtc(signOn, months);
  const mlcLimit = addMonthsUtc(signOn, ILO_MAX_CONTRACT_MONTHS);
  const daysToScheduledEnd = wholeDaysBetween(reference, scheduledEnd);
  const daysToMlcLimit = wholeDaysBetween(reference, mlcLimit);

  let status: ContractComplianceStatus = 'ON_TRACK';

  if (months > ILO_MAX_CONTRACT_MONTHS || scheduledEnd.getTime() > mlcLimit.getTime()) {
    // Kontrak sendiri sudah melampaui batas 11 bulan.
    status = 'MLC_BREACH';
  } else if (reference.getTime() > mlcLimit.getTime()) {
    status = 'MLC_BREACH';
  } else if (daysToMlcLimit <= DUE_SOON_DAYS || daysToScheduledEnd <= DUE_SOON_DAYS) {
    status = 'DUE_SOON';
  }

  return {
    signOnDate: signOn.toISOString(),
    scheduledEndDate: scheduledEnd.toISOString(),
    mlcLimitDate: mlcLimit.toISOString(),
    monthsContracted: months,
    daysToScheduledEnd,
    daysToMlcLimit,
    status,
  };
}

export interface ComplianceSummary {
  total: number;
  onTrack: number;
  dueSoon: number;
  breach: number;
  unknown: number;
  /** Status terburuk yang ditemukan — dipakai untuk lencana di dashboard. */
  worst: ContractComplianceStatus;
}

export function summarizeFleetCompliance(
  items: ReadonlyArray<{ status: ContractComplianceStatus }>
): ComplianceSummary {
  const summary: ComplianceSummary = {
    total: items.length,
    onTrack: 0,
    dueSoon: 0,
    breach: 0,
    unknown: 0,
    worst: 'ON_TRACK',
  };

  for (const item of items) {
    if (item.status === 'ON_TRACK') summary.onTrack += 1;
    else if (item.status === 'DUE_SOON') summary.dueSoon += 1;
    else if (item.status === 'MLC_BREACH') summary.breach += 1;
    else summary.unknown += 1;
  }

  if (summary.breach > 0) summary.worst = 'MLC_BREACH';
  else if (summary.dueSoon > 0) summary.worst = 'DUE_SOON';
  else if (summary.total > 0 && summary.unknown === summary.total) summary.worst = 'UNKNOWN';

  return summary;
}