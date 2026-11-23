import { RANK_LABEL_ID, VESSEL_TYPE_LABEL_ID, COC_BY_RANK, formatDateId } from '../vetting/dossier';
import type { PdfDocumentModel } from './pdfWriter';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Haswakarya Crewing OS — Perjanjian Kerja Laut (PKL) sebagai PDF
 * Struktur mengikuti kerangka PKL pelaut Indonesia (rujukan PM 59/2021):
 * para pihak, data kapal, jabatan & upah, hak cuti/allotment, asuransi,
 * kewajiban, dan blok tanda tangan. Murni: data masuk → model dokumen.
 * Nominal ditampilkan apa adanya dari basis data, tanpa pembulatan karangan.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface PklSource {
  contractNo: string;
  status: string;
  signOnDate: Date | string;
  durationMonths: number;
  rank: string;
  monthlyBasicWageIdr?: number | null;
  monthlyBasicWageUsd?: number | null;
  allotmentPercentage: number;
  onboardCashAdvance: number;
  insurancePolicyNo?: string | null;
  seafarer: {
    fullName: string;
    email: string;
    phone?: string | null;
    seamanBookNo: string;
    passportNo?: string | null;
    dateOfBirth: Date | string;
    placeOfBirth: string;
    homeAddress: string;
  };
  vessel: {
    name: string;
    imoNumber: string;
    callSign?: string | null;
    flag: string;
    vesselType: string;
    grt: number;
    dwt: number;
    engineBhp: number;
    engineType?: string | null;
    tradingArea: string;
    ownerName: string;
  };
}

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Draf',
  PENDING_SIGNATURE: 'Menunggu tanda tangan',
  ACTIVE_ONBOARD: 'Aktif di atas kapal',
  COMPLETED: 'Selesai',
  TERMINATED_EARLY: 'Diakhiri lebih awal',
};

/** Format rupiah tanpa desimal; mengembalikan '-' bila nilai kosong. */
export function formatIdr(value?: number | null): string {
  if (value === null || value === undefined) return '-';
  return `Rp ${Math.round(value).toLocaleString('id-ID')}`;
}

/** Baris upah: nominal atau penanda eksplisit bila belum ditetapkan. */
function wageLine(value: string): string {
  return value === '-' ? 'Belum ditetapkan' : `${value} per bulan`;
}

export function formatUsd(value?: number | null): string {
  if (value === null || value === undefined) return '-';
  return `USD ${Math.round(value).toLocaleString('en-US')}`;
}

/** Tanggal berakhir dihitung dari tanggal naik + durasi kontrak. */
export function contractEndDate(signOnDate: Date | string, durationMonths: number): Date {
  const start = new Date(signOnDate);
  const end = new Date(start.getTime());
  end.setMonth(end.getMonth() + Math.max(0, durationMonths));
  return end;
}

/** Pembagian upah: bagian darat (allotment) dan bagian tunai di kapal. */
export function splitWage(
  gross: number | null | undefined,
  allotmentPercentage: number,
  onboardCashAdvance: number
): { allotment: number | null; onboard: number | null } {
  if (gross === null || gross === undefined) return { allotment: null, onboard: null };
  return {
    allotment: Math.round((gross * allotmentPercentage) / 100),
    onboard: Math.round((gross * onboardCashAdvance) / 100),
  };
}

export function buildPklDocument(source: PklSource): PdfDocumentModel {
  const rankLabel = RANK_LABEL_ID[source.rank] ?? source.rank;
  const coc = COC_BY_RANK[source.rank] ?? '-';
  const endDate = contractEndDate(source.signOnDate, source.durationMonths);
  const wageIdr = splitWage(
    source.monthlyBasicWageIdr,
    source.allotmentPercentage,
    source.onboardCashAdvance
  );
  const wageUsd = splitWage(
    source.monthlyBasicWageUsd,
    source.allotmentPercentage,
    source.onboardCashAdvance
  );

  return {
    title: 'Perjanjian Kerja Laut (PKL)',
    subtitle: `Nomor: ${source.contractNo}`,
    meta: [
      { label: 'Status kontrak', value: STATUS_LABEL[source.status] ?? source.status },
      {
        label: 'Masa berlaku',
        value: `${formatDateId(source.signOnDate)} sampai ${formatDateId(endDate)} (${source.durationMonths} bulan)`,
      },
    ],
    sections: [
      {
        heading: 'Para Pihak',
        table: {
          columns: [
            { header: 'Pihak', weight: 0.9 },
            { header: 'Identitas', weight: 2.6 },
          ],
          rows: [
            [
              'Pemberi Kerja',
              `${source.vessel.ownerName} - diwakili PT Haswakarya Maritime Services sebagai agen crewing.`,
            ],
            [
              'Pelaut',
              `${source.seafarer.fullName}, lahir di ${source.seafarer.placeOfBirth} pada ${formatDateId(
                source.seafarer.dateOfBirth
              )}, Buku Pelaut ${source.seafarer.seamanBookNo}${
                source.seafarer.passportNo ? `, Paspor ${source.seafarer.passportNo}` : ''
              }.`,
            ],
            [
              'Alamat Pelaut',
              `${source.seafarer.homeAddress} (${source.seafarer.email}${
                source.seafarer.phone ? ` / ${source.seafarer.phone}` : ''
              })`,
            ],
          ],
        },
      },
      {
        heading: 'Data Kapal',
        table: {
          columns: [
            { header: 'Item', weight: 1 },
            { header: 'Keterangan', weight: 2.4 },
          ],
          rows: [
            ['Nama Kapal', source.vessel.name],
            ['IMO / Call Sign', `${source.vessel.imoNumber} / ${source.vessel.callSign || '-'}`],
            ['Bendera', source.vessel.flag],
            ['Tipe Kapal', VESSEL_TYPE_LABEL_ID[source.vessel.vesselType] ?? source.vessel.vesselType],
            [
              'GT / DWT',
              `${source.vessel.grt.toLocaleString('id-ID')} GT / ${source.vessel.dwt.toLocaleString('id-ID')} DWT`,
            ],
            [
              'Mesin',
              `${source.vessel.engineBhp.toLocaleString('id-ID')} BHP${source.vessel.engineType ? ` (${source.vessel.engineType})` : ''}`,
            ],
            ['Daerah Pelayaran', source.vessel.tradingArea],
          ],
        },
      },
      {
        heading: 'Jabatan dan Kompensasi',
        table: {
          columns: [
            { header: 'Item', weight: 1 },
            { header: 'Keterangan', weight: 2.4 },
          ],
          rows: [
            ['Jabatan', rankLabel],
            ['Sertifikat Kompetensi Rujukan', coc],
            ['Tanggal Naik Kapal', formatDateId(source.signOnDate)],
            ['Tanggal Turun Kapal', formatDateId(endDate)],
            ['Upah Pokok (IDR)', wageLine(formatIdr(source.monthlyBasicWageIdr))],
            ['Upah Pokok (USD)', wageLine(formatUsd(source.monthlyBasicWageUsd))],
            [
              `Allotment (${source.allotmentPercentage}%)`,
              wageIdr.allotment === null
                ? 'Belum ditetapkan'
                : `${formatIdr(wageIdr.allotment)} / ${formatUsd(wageUsd.allotment)} per bulan`,
            ],
            [
              `Tunai di Kapal (${source.onboardCashAdvance}%)`,
              wageIdr.onboard === null
                ? 'Belum ditetapkan'
                : `${formatIdr(wageIdr.onboard)} / ${formatUsd(wageUsd.onboard)} per bulan`,
            ],
            ['Polis Asuransi P&I', source.insurancePolicyNo || 'Menyusul sesuai polis P&I pemilik kapal'],
          ],
        },
      },
      {
        heading: 'Hak dan Kewajiban',
        bullets: [
          'Pemberi kerja wajib membayar upah tepat waktu setiap bulan sesuai komposisi allotment dan tunai di atas.',
          'Pemberi kerja wajib menyediakan akomodasi, konsumsi, perawatan medis, dan repatriasi sesuai MLC 2006.',
          'Pelaut wajib melaksanakan tugas sesuai jabatan, mematuhi perintah nahkamad, dan menjaga disiplin kerja.',
          'Jam kerja, jam istirahat, dan hari libur mengikuti ketentuan MLC 2006 serta peraturan bendera kapal.',
          'Pemutusan hubungan kerja sebelum masa kontrak berakhir hanya dapat dilakukan sesuai prosedur dan wajib dituangkan tertulis.',
          'Sengketa diselesaikan secara musyawarah; bila gagal, melalui Pengadilan Hubungan Industrial yang berwenang.',
        ],
      },
      {
        heading: 'Pengesahan',
        paragraphs: [
          'Perjanjian ini dibuat dalam dua rangkap bermaterai, masing-masing berkekuatan hukum yang sama, dan berlaku sejak tanggal naik kapal.',
          'Dokumen ini dihasilkan secara elektronik oleh Haswakarya Crewing OS berdasarkan data kontrak pada basis data. Tanda tangan basah dilengkapi pada saat serah terima dokumen.',
        ],
        table: {
          columns: [
            { header: 'Pihak', weight: 1 },
            { header: 'Nama', weight: 1.6 },
            { header: 'Jabatan', weight: 1.3 },
            { header: 'Tanda Tangan / Tanggal', weight: 1.4 },
          ],
          rows: [
            ['Pemberi Kerja', source.vessel.ownerName, 'Pemilik / Operator Kapal', ''],
            ['Agen Crewing', 'PT Haswakarya Maritime Services', 'Crewing Manager', ''],
            ['Pelaut', source.seafarer.fullName, rankLabel, ''],
          ],
        },
      },
    ],
    footer: `PKL ${source.contractNo} - ${source.seafarer.fullName} - ${source.vessel.name}`,
  };
}