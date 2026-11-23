import { describe, expect, it } from 'vitest';
import { formatIdr, formatUsd, splitWage, contractEndDate, buildPklDocument } from '@/lib/pdf/pkl';
import {
  buildBimcoCvDocument,
  summarizeSeaTimeByRank,
  summarizeSeaTimeByVesselType,
  type CvSource,
} from '@/lib/pdf/bimcoCv';

const pklSource = {
  contractNo: 'PKL-2026-HWK-001',
  status: 'ACTIVE_ONBOARD',
  signOnDate: new Date('2026-01-15T00:00:00Z'),
  durationMonths: 9,
  rank: 'MASTER',
  monthlyBasicWageIdr: 45_000_000,
  monthlyBasicWageUsd: 2800,
  allotmentPercentage: 80,
  onboardCashAdvance: 20,
  insurancePolicyNo: 'PI-2026-778',
  seafarer: {
    fullName: 'Budi Santoso',
    email: 'budi@example.com',
    phone: '+6281234567890',
    seamanBookNo: 'SB-2026-001',
    passportNo: 'A1234567',
    dateOfBirth: new Date('1985-04-02T00:00:00Z'),
    placeOfBirth: 'Semarang',
    homeAddress: 'Jl. Pelabuhan No. 5, Semarang',
  },
  vessel: {
    name: 'MT Haswakarya Pioneer',
    imoNumber: '9123456',
    callSign: 'YDBX2',
    flag: 'ID',
    vesselType: 'ASPHALT_BITUMEN_TANKER',
    grt: 12_500,
    dwt: 20_000,
    engineBhp: 6800,
    engineType: 'MAN B&W 6S50MC-C',
    tradingArea: 'Ocean Going',
    ownerName: 'PT Contoh Shipping',
  },
};

const cvSource: CvSource = {
  fullName: 'Budi Santoso',
  email: 'budi@example.com',
  phone: '+6281234567890',
  seamanBookNo: 'SB-2026-001',
  passportNo: 'A1234567',
  sidNumber: 'SID-01',
  primaryRank: 'MASTER',
  dateOfBirth: new Date('1985-04-02T00:00:00Z'),
  placeOfBirth: 'Semarang',
  homeAddress: 'Jl. Pelabuhan No. 5, Semarang',
  emergencyContact: 'Siti',
  emergencyPhone: '+628111222',
  totalSeaTimeDays: 4200,
  marlinsScore: 92,
  seaTimes: [
    {
      vesselName: 'MV Satu',
      imoNumber: '9123401',
      vesselType: 'BULK_CARRIER',
      rankServed: 'CHIEF_OFFICER',
      signOnDate: new Date('2019-01-10T00:00:00Z'),
      signOffDate: new Date('2019-07-20T00:00:00Z'),
      totalDays: 190,
    },
    {
      vesselName: 'MV Dua',
      imoNumber: '9123402',
      vesselType: 'ASPHALT_BITUMEN_TANKER',
      rankServed: 'MASTER',
      signOnDate: new Date('2022-01-10T00:00:00Z'),
      signOffDate: new Date('2022-07-20T00:00:00Z'),
      totalDays: 191,
    },
    {
      vesselName: 'MV Tiga',
      vesselType: 'BULK_CARRIER',
      rankServed: 'MASTER',
      signOnDate: new Date('2023-01-10T00:00:00Z'),
      signOffDate: new Date('2023-07-20T00:00:00Z'),
      totalDays: 200,
    },
  ],
  certificates: [
    {
      certName: 'ANT-I',
      category: 'COC',
      certificateNo: 'COC-1',
      issuingAuthority: 'Ditel Hubla',
      expiryDate: new Date('2028-01-01T00:00:00Z'),
      isVerified: true,
    },
    {
      certName: 'BST',
      category: 'COP',
      certificateNo: 'COP-1',
      issuingAuthority: 'Ditel Hubla',
      expiryDate: null,
      isVerified: false,
    },
  ],
};

describe('pkl — format nilai', () => {
  it('memformat rupiah tanpa desimal dan tanda minus untuk nilai kosong', () => {
    expect(formatIdr(45_000_000)).toBe('Rp 45.000.000');
    expect(formatIdr(null)).toBe('-');
    expect(formatIdr(undefined)).toBe('-');
  });

  it('memformat dolar dan menandai nilai kosong', () => {
    expect(formatUsd(2800)).toBe('USD 2,800');
    expect(formatUsd(null)).toBe('-');
  });

  it('membagi upah sesuai persentase allotment dan tunai', () => {
    expect(splitWage(45_000_000, 80, 20)).toEqual({ allotment: 36_000_000, onboard: 9_000_000 });
    expect(splitWage(null, 80, 20)).toEqual({ allotment: null, onboard: null });
  });

  it('menghitung tanggal turun kapal dari durasi kontrak', () => {
    const end = contractEndDate(new Date('2026-01-15T00:00:00Z'), 9);
    expect(end.getUTCMonth()).toBe(9);
    expect(end.getUTCFullYear()).toBe(2026);
    expect(end.getUTCDate()).toBe(15);
  });
});

describe('pkl — model dokumen', () => {
  it('memuat nomor kontrak, data kapal, dan kompensasi', () => {
    const doc = buildPklDocument(pklSource);
    expect(doc.subtitle).toContain('PKL-2026-HWK-001');

    const allRows = doc.sections.flatMap((section) => section.table?.rows ?? []).flat().join(' | ');
    expect(allRows).toContain('MT Haswakarya Pioneer');
    expect(allRows).toContain('9123456');
    expect(allRows).toContain('Asphalt / Bitumen Tanker');
    expect(allRows).toContain('Master (Nakhoda)');
    expect(allRows).toContain('Rp 45.000.000');
    expect(allRows).toContain('ANT-I');
    expect(allRows).toContain('PI-2026-778');
  });

  it('menampilkan persentase allotment dan tunai sesuai input', () => {
    const doc = buildPklDocument(pklSource);
    const labels = doc.sections.flatMap((section) => section.table?.rows ?? []).map((row) => row[0]);
    expect(labels).toContain('Allotment (80%)');
    expect(labels).toContain('Tunai di Kapal (20%)');
  });

  it('memakai teks pengganti bila upah belum ditetapkan', () => {
    const doc = buildPklDocument({ ...pklSource, monthlyBasicWageIdr: null, monthlyBasicWageUsd: null });
    const allRows = doc.sections.flatMap((section) => section.table?.rows ?? []).flat().join(' | ');
    expect(allRows).toContain('Belum ditetapkan');
    expect(allRows).not.toContain('Rp -');
  });

  it('menyisipkan pasal hak & kewajiban dan blok tanda tangan', () => {
    const doc = buildPklDocument(pklSource);
    const headings = doc.sections.map((section) => section.heading);
    expect(headings).toEqual(
      expect.arrayContaining(['Para Pihak', 'Data Kapal', 'Jabatan dan Kompensasi', 'Hak dan Kewajiban', 'Pengesahan'])
    );
    const signature = doc.sections.at(-1)?.table?.rows ?? [];
    expect(signature.length).toBe(3);
  });
});

describe('cv — agregasi jam layar', () => {
  it('menjumlahkan hari layar per tipe kapal, terbesar lebih dulu', () => {
    expect(summarizeSeaTimeByVesselType(cvSource.seaTimes)).toEqual([
      { vesselType: 'BULK_CARRIER', days: 390 },
      { vesselType: 'ASPHALT_BITUMEN_TANKER', days: 191 },
    ]);
  });

  it('menjumlahkan hari layar per jabatan', () => {
    expect(summarizeSeaTimeByRank(cvSource.seaTimes)).toEqual([
      { rank: 'MASTER', days: 391 },
      { rank: 'CHIEF_OFFICER', days: 190 },
    ]);
  });

  it('mengabaikan nilai hari negatif dan kelompok tanpa hari layar', () => {
    const summary = summarizeSeaTimeByVesselType([
      { ...cvSource.seaTimes[0], totalDays: -20 },
      { ...cvSource.seaTimes[1], totalDays: 30 },
    ]);
    expect(summary).toEqual([{ vesselType: 'ASPHALT_BITUMEN_TANKER', days: 30 }]);
  });
});

describe('cv — model dokumen', () => {
  it('memuat seluruh bagian wajib CV', () => {
    const doc = buildBimcoCvDocument(cvSource);
    expect(doc.sections.map((section) => section.heading)).toEqual([
      'Data Pribadi',
      'Ringkasan Pengalaman per Tipe Kapal',
      'Ringkasan Pengalaman per Jabatan',
      'Riwayat Layar',
      'Sertifikat STCW & Dokumen',
    ]);
  });

  it('menuliskan Marlins sebagai belum tersedia bila skor kosong', () => {
    const doc = buildBimcoCvDocument({ ...cvSource, marlinsScore: null });
    const rows = doc.sections[0].table?.rows ?? [];
    expect(rows.find((row) => row[0] === 'Marlins English Test')?.[1]).toBe('Belum tersedia');
  });

  it('menandai sertifikat tanpa masa berlaku sebagai seumur hidup', () => {
    const doc = buildBimcoCvDocument(cvSource);
    const rows = doc.sections[4].table?.rows ?? [];
    expect(rows.some((row) => row.includes('Seumur hidup'))).toBe(true);
    expect(rows.some((row) => row.includes('Terverifikasi'))).toBe(true);
    expect(rows.some((row) => row.includes('Menunggu'))).toBe(true);
  });

  it('menambahkan bagian rekam medis hanya bila ada data', () => {
    const withoutMedicals = buildBimcoCvDocument(cvSource);
    expect(withoutMedicals.sections.some((section) => section.heading === 'Rekam Medis Terakhir')).toBe(false);

    const withMedicals = buildBimcoCvDocument({
      ...cvSource,
      medicals: [
        {
          clinicName: 'Klinik Pramita',
          examDate: new Date('2026-01-05T00:00:00Z'),
          validUntil: new Date('2027-01-05T00:00:00Z'),
          status: 'FIT_FOR_SEA_DUTY',
        },
      ],
    });
    const medicalSection = withMedicals.sections.find(
      (section) => section.heading === 'Rekam Medis Terakhir'
    );
    expect(medicalSection?.table?.rows[0][3]).toBe('FIT FOR SEA DUTY');
  });

  it('mengurutkan riwayat layar dari yang terbaru', () => {
    const doc = buildBimcoCvDocument(cvSource);
    const history = doc.sections[3].table?.rows ?? [];
    expect(history[0][0]).toContain('MV Tiga');
    expect(history.at(-1)?.[0]).toContain('MV Satu');
  });
});