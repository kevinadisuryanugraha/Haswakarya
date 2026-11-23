import { RANK_LABEL_ID, VESSEL_TYPE_LABEL_ID, formatDateId } from '../vetting/dossier';
import type { PdfDocumentModel, PdfSection } from './pdfWriter';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Haswakarya Crewing OS — CV Pelaut (format ringkas mengikuti kerangka BIMCO)
 * Murni: menerima view model, mengembalikan model dokumen PDF.
 * Tidak ada kalkulasi bisnis di sini; jam layar sudah dihitung pemanggil.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface CvSeaTimeRow {
  vesselName: string;
  imoNumber?: string | null;
  vesselType: string;
  rankServed: string;
  signOnDate: Date | string;
  signOffDate: Date | string;
  totalDays: number;
}

export interface CvCertificateRow {
  certName: string;
  category: string;
  certificateNo: string;
  issuingAuthority: string;
  expiryDate?: Date | string | null;
  isVerified: boolean;
}

export interface CvMedicalRow {
  clinicName: string;
  examDate: Date | string;
  validUntil: Date | string;
  status: string;
}

export interface CvSource {
  fullName: string;
  email: string;
  phone?: string | null;
  seamanBookNo: string;
  passportNo?: string | null;
  sidNumber?: string | null;
  primaryRank: string;
  dateOfBirth: Date | string;
  placeOfBirth: string;
  homeAddress: string;
  emergencyContact: string;
  emergencyPhone: string;
  totalSeaTimeDays: number;
  marlinsScore?: number | null;
  seaTimes: CvSeaTimeRow[];
  certificates: CvCertificateRow[];
  medicals?: CvMedicalRow[];
}

const CATEGORY_LABEL: Record<string, string> = {
  COC: 'CoC',
  COP: 'CoP',
  FLAG_ENDORSEMENT: 'Flag Endorsement',
  TRAVEL_DOCUMENT: 'Dokumen Perjalanan',
};

function months(days: number): string {
  const value = Math.round((days / 30) * 10) / 10;
  return `${value} bln`;
}

/** Mengelompokkan hari layar per tipe kapal untuk ringkasan pengalaman. */
export function summarizeSeaTimeByVesselType(
  seaTimes: CvSeaTimeRow[]
): Array<{ vesselType: string; days: number }> {
  const totals = new Map<string, number>();
  for (const record of seaTimes) {
    totals.set(record.vesselType, (totals.get(record.vesselType) ?? 0) + Math.max(0, record.totalDays));
  }
  return [...totals.entries()]
    .map(([vesselType, days]) => ({ vesselType, days }))
    .filter((row) => row.days > 0)
    .sort((a, b) => b.days - a.days);
}

/** Mengelompokkan hari layar per jabatan. */
export function summarizeSeaTimeByRank(
  seaTimes: CvSeaTimeRow[]
): Array<{ rank: string; days: number }> {
  const totals = new Map<string, number>();
  for (const record of seaTimes) {
    totals.set(record.rankServed, (totals.get(record.rankServed) ?? 0) + Math.max(0, record.totalDays));
  }
  return [...totals.entries()]
    .map(([rank, days]) => ({ rank, days }))
    .filter((row) => row.days > 0)
    .sort((a, b) => b.days - a.days);
}

export function buildBimcoCvDocument(source: CvSource): PdfDocumentModel {
  const rankLabel = RANK_LABEL_ID[source.primaryRank] ?? source.primaryRank;

  const sections: PdfSection[] = [
    {
      heading: 'Data Pribadi',
      table: {
        columns: [
          { header: 'Field', weight: 1 },
          { header: 'Keterangan', weight: 2.4 },
        ],
        rows: [
          ['Nama Lengkap', source.fullName],
          ['Jabatan Utama', rankLabel],
          ['Tempat / Tanggal Lahir', `${source.placeOfBirth}, ${formatDateId(source.dateOfBirth)}`],
          ['Buku Pelaut', source.seamanBookNo],
          ['Paspor', source.passportNo || '-'],
          ['SID (ILO 185)', source.sidNumber || '-'],
          ['Alamat', source.homeAddress],
          ['Kontak Darurat', `${source.emergencyContact} / ${source.emergencyPhone}`],
          ['Email / Telepon', [source.email, source.phone].filter(Boolean).join(' / ')],
          ['Total Waktu Layar', `${source.totalSeaTimeDays} hari (${months(source.totalSeaTimeDays)})`],
          ['Marlins English Test', source.marlinsScore === null || source.marlinsScore === undefined ? 'Belum tersedia' : `${source.marlinsScore}%`],
        ],
      },
    },
    {
      heading: 'Ringkasan Pengalaman per Tipe Kapal',
      table: {
        columns: [
          { header: 'Tipe Kapal', weight: 2 },
          { header: 'Waktu Layar', weight: 1.2 },
        ],
        rows: summarizeSeaTimeByVesselType(source.seaTimes).map((row) => [
          VESSEL_TYPE_LABEL_ID[row.vesselType] ?? row.vesselType,
          months(row.days),
        ]),
      },
    },
    {
      heading: 'Ringkasan Pengalaman per Jabatan',
      table: {
        columns: [
          { header: 'Jabatan', weight: 2 },
          { header: 'Waktu Layar', weight: 1.2 },
        ],
        rows: summarizeSeaTimeByRank(source.seaTimes).map((row) => [
          RANK_LABEL_ID[row.rank] ?? row.rank,
          months(row.days),
        ]),
      },
    },
    {
      heading: 'Riwayat Layar',
      table: {
        columns: [
          { header: 'Kapal', weight: 1.9 },
          { header: 'Tipe', weight: 1.1 },
          { header: 'Jabatan', weight: 1.3 },
          { header: 'Naik', weight: 0.9 },
          { header: 'Turun', weight: 0.9 },
          { header: 'Hari', weight: 0.6 },
        ],
        rows: [...source.seaTimes]
          .sort((a, b) => new Date(b.signOnDate).getTime() - new Date(a.signOnDate).getTime())
          .map((record) => [
            record.imoNumber ? `${record.vesselName} (IMO ${record.imoNumber})` : record.vesselName,
            VESSEL_TYPE_LABEL_ID[record.vesselType] ?? record.vesselType,
            RANK_LABEL_ID[record.rankServed] ?? record.rankServed,
            formatDateId(record.signOnDate),
            formatDateId(record.signOffDate),
            String(record.totalDays),
          ]),
      },
    },
    {
      heading: 'Sertifikat STCW & Dokumen',
      table: {
        columns: [
          { header: 'Sertifikat', weight: 1.8 },
          { header: 'Kategori', weight: 0.9 },
          { header: 'Nomor', weight: 1.2 },
          { header: 'Penerbit', weight: 1.6 },
          { header: 'Berlaku s.d.', weight: 1 },
          { header: 'Verifikasi', weight: 0.8 },
        ],
        rows: source.certificates.map((certificate) => [
          certificate.certName,
          CATEGORY_LABEL[certificate.category] ?? certificate.category,
          certificate.certificateNo,
          certificate.issuingAuthority,
          certificate.expiryDate ? formatDateId(certificate.expiryDate) : 'Seumur hidup',
          certificate.isVerified ? 'Terverifikasi' : 'Menunggu',
        ]),
      },
    },
  ];

  const medicals = source.medicals ?? [];
  if (medicals.length > 0) {
    sections.push({
      heading: 'Rekam Medis Terakhir',
      table: {
        columns: [
          { header: 'Klinik', weight: 2 },
          { header: 'Tanggal MCU', weight: 1.1 },
          { header: 'Berlaku s.d.', weight: 1.1 },
          { header: 'Status', weight: 1.3 },
        ],
        rows: medicals.map((record) => [
          record.clinicName,
          formatDateId(record.examDate),
          formatDateId(record.validUntil),
          record.status.replace(/_/g, ' '),
        ]),
      },
    });
  }

  return {
    title: `Curriculum Vitae Pelaut - ${source.fullName}`,
    subtitle: `Format ringkas mengikuti kerangka BIMCO - ${rankLabel}`,
    meta: [
      { label: 'Diterbitkan oleh', value: 'PT Haswakarya Maritime Services - Crewing Division' },
      { label: 'Catatan', value: 'Data berasal dari basis ATS Haswakarya dan dapat diverifikasi terhadap dokumen asli.' },
    ],
    sections,
    footer: `CV BIMCO - ${source.fullName} - Buku Pelaut ${source.seamanBookNo}`,
  };
}