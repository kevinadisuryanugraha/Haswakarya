import { describe, expect, it } from 'vitest';
import {
  KODE_OBJEK_PAJAK_PEGAWAI_TETAP,
  MONTHS_PER_YEAR,
  annualTaxDetail,
  biayaJabatanAnnual,
  buildEbupotCsv,
  computeMonthlyWithholding,
  isPtkpStatus,
  ptkpAnnual,
  ptkpBreakdown,
  progressiveTax,
  summarizeTaxPeriod,
} from '@/lib/tax/pph21';

describe('ptkpAnnual', () => {
  it('TK/0 memakai PTKP dasar 54 juta', () => {
    expect(ptkpAnnual('TK0')).toBe(54_000_000);
  });

  it('status kawin menambah 4,5 juta', () => {
    expect(ptkpAnnual('K0')).toBe(58_500_000);
  });

  it('setiap tanggungan menambah 4,5 juta sampai maksimum tiga', () => {
    expect(ptkpAnnual('TK1')).toBe(58_500_000);
    expect(ptkpAnnual('TK2')).toBe(63_000_000);
    expect(ptkpAnnual('TK3')).toBe(67_500_000);
    expect(ptkpAnnual('K3')).toBe(72_000_000);
  });

  it('rincian menandai komponen kawin dan tanggungan secara terpisah', () => {
    expect(ptkpBreakdown('K2')).toEqual({
      status: 'K2',
      base: 54_000_000,
      marriedAddition: 4_500_000,
      dependentAddition: 9_000_000,
      annual: 67_500_000,
    });
  });

  it('status tak dikenal jatuh ke TK/0, bukan NaN', () => {
    expect(ptkpAnnual('XX9' as never)).toBe(54_000_000);
    expect(ptkpBreakdown('XX9' as never).status).toBe('TK0');
  });
});

describe('isPtkpStatus', () => {
  it('menerima delapan status resmi dan menolak sisanya', () => {
    for (const status of ['TK0', 'TK1', 'TK2', 'TK3', 'K0', 'K1', 'K2', 'K3']) {
      expect(isPtkpStatus(status)).toBe(true);
    }
    expect(isPtkpStatus('TK4')).toBe(false);
    expect(isPtkpStatus(undefined)).toBe(false);
    expect(isPtkpStatus(0)).toBe(false);
  });
});

describe('biayaJabatanAnnual', () => {
  it('memakai 5% dari bruto tahunan bila di bawah batas', () => {
    expect(biayaJabatanAnnual(48_000_000)).toBe(2_400_000);
  });

  it('dibatasi 6 juta setahun walau bruto sangat besar', () => {
    expect(biayaJabatanAnnual(200_000_000 * MONTHS_PER_YEAR)).toBe(6_000_000);
  });

  it('tidak pernah negatif', () => {
    expect(biayaJabatanAnnual(-1)).toBe(0);
  });
});

describe('progressiveTax', () => {
  it('pkp nol atau negatif tidak menghasilkan pajak', () => {
    expect(progressiveTax(0)).toBe(0);
    expect(progressiveTax(-500)).toBe(0);
  });

  it('lapisan pertama 5% sampai 60 juta', () => {
    expect(progressiveTax(60_000_000)).toBe(3_000_000);
  });

  it('melewati batas 60 juta memakai 15% untuk sisanya', () => {
    expect(progressiveTax(175_500_000)).toBe(20_325_000);
  });

  it('menghitung seluruh lima lapisan sampai tarif 35%', () => {
    // 60jt*5% + 190jt*15% + 250jt*25% + 4,5M*30% + 1M*35%
    expect(progressiveTax(6_000_000_000)).toBe(1_794_000_000);
  });

  it('pembulatan terjadi sekali di akhir, bukan per lapisan', () => {
    expect(progressiveTax(60_000_001)).toBe(3_000_000);
  });
});

describe('annualTaxDetail', () => {
  it('bruto di bawah PTKP menghasilkan pkp nol dan pajak nol', () => {
    const detail = annualTaxDetail(4_000_000, 'TK0');
    expect(detail.annualGross).toBe(48_000_000);
    expect(detail.pkp).toBe(0);
    expect(detail.annualTax).toBe(0);
  });

  it('mengurangi biaya jabatan dan PTKP sebelum tarif progresif', () => {
    const detail = annualTaxDetail(20_000_000, 'K0');
    expect(detail.annualGross).toBe(240_000_000);
    expect(detail.biayaJabatan).toBe(6_000_000);
    expect(detail.pkp).toBe(175_500_000);
    expect(detail.annualTax).toBe(20_325_000);
  });
});

describe('computeMonthlyWithholding', () => {
  it('bruto 4 juta TK/0 dipotong nol dan neto utuh', () => {
    const result = computeMonthlyWithholding({ monthlyGross: 4_000_000, status: 'TK0', month: 1 });
    expect(result.amount).toBe(0);
    expect(result.netWage).toBe(4_000_000);
    expect(result.isCorrection).toBe(false);
  });

  it('bruto 20 juta K/0 memakai pajak tahunan dibagi 12', () => {
    const result = computeMonthlyWithholding({ monthlyGross: 20_000_000, status: 'K0', month: 3 });
    expect(result.annualTax).toBe(20_325_000);
    expect(result.monthlyTarget).toBe(1_693_750);
    expect(result.amount).toBe(1_693_750);
    expect(result.netWage).toBe(18_306_250);
  });

  it('masa Desember menghitung selisih terhadap total yang sudah dipotong', () => {
    const monthly = computeMonthlyWithholding({ monthlyGross: 20_000_000, status: 'K0', month: 1 });
    const priorWithheldTotal = monthly.amount * 11;
    const december = computeMonthlyWithholding({
      monthlyGross: 20_000_000,
      status: 'K0',
      month: 12,
      priorWithheldTotal,
    });
    expect(december.isCorrection).toBe(true);
    expect(december.amount).toBe(monthly.amount);
    expect(priorWithheldTotal + december.amount).toBe(december.annualTax);
  });

  it('masa Desember menagih kekurangan bila potongan sebelumnya terlalu kecil', () => {
    const december = computeMonthlyWithholding({
      monthlyGross: 20_000_000,
      status: 'K0',
      month: 12,
      priorWithheldTotal: 20_000_000,
    });
    expect(december.amount).toBe(325_000);
  });

  it('masa Desember mengembalikan kelebihan potong sebagai nilai negatif', () => {
    const december = computeMonthlyWithholding({
      monthlyGross: 20_000_000,
      status: 'K0',
      month: 12,
      priorWithheldTotal: 21_000_000,
    });
    expect(december.amount).toBe(-675_000);
    expect(december.netWage).toBe(20_675_000);
  });

  it('status PTKP tidak diisi memakai TK/0 dan mencatatnya', () => {
    const result = computeMonthlyWithholding({ monthlyGross: 10_000_000 });
    expect(result.status).toBe('TK0');
    expect(result.month).toBe(1);
    expect(result.ptkpAnnual).toBe(54_000_000);
  });

  it('nilai tidak masuk akal tidak menjadi NaN', () => {
    const result = computeMonthlyWithholding({ monthlyGross: Number.NaN, month: 99 });
    expect(result.monthlyGross).toBe(0);
    expect(result.month).toBe(12);
    expect(result.amount).toBe(0);
    expect(result.netWage).toBe(0);
  });

  it('bulan di luar 1–12 dijepit ke rentang sah', () => {
    expect(computeMonthlyWithholding({ monthlyGross: 10_000_000, month: 0 }).month).toBe(1);
    expect(computeMonthlyWithholding({ monthlyGross: 10_000_000, month: -3 }).month).toBe(1);
  });
});

describe('summarizeTaxPeriod', () => {
  it('menjumlahkan bruto, pajak, dan neto', () => {
    const summary = summarizeTaxPeriod([
      { monthlyGross: 20_000_000, pph21Amount: 1_693_750, npwp: '0012345678901000' },
      { monthlyGross: 4_000_000, pph21Amount: 0, npwp: '1234567890123456' },
    ]);
    expect(summary).toEqual({
      totalGross: 24_000_000,
      totalTaxableGross: 24_000_000,
      totalPph21: 1_693_750,
      totalNet: 22_306_250,
      recordCount: 2,
      missingNpwpCount: 0,
    });
  });

  it('menghitung baris tanpa NPWP dan periode kosong', () => {
    expect(summarizeTaxPeriod([])).toEqual({
      totalGross: 0,
      totalTaxableGross: 0,
      totalPph21: 0,
      totalNet: 0,
      recordCount: 0,
      missingNpwpCount: 0,
    });
    expect(
      summarizeTaxPeriod([{ monthlyGross: 10_000_000, pph21Amount: 0, npwp: null }]).missingNpwpCount
    ).toBe(1);
  });
});

describe('buildEbupotCsv', () => {
  it('mengeluarkan header e-Bupot saja untuk periode kosong', () => {
    const csv = buildEbupotCsv([]);
    expect(csv).toBe(
      'NPWP,Nama Wajib Pajak,Masa Pajak,Tahun Pajak,Kode Objek Pajak,Penghasilan Bruto,Tarif,PPh 21 Dipotong\r\n'
    );
  });

  it('memakai NPWP 16 digit hasil normalisasi dan kode objek pegawai tetap', () => {
    const csv = buildEbupotCsv([
      {
        npwp: '01.234.567.8-901.000',
        name: 'Agus Setiawan',
        periodMonth: 1,
        periodYear: 2026,
        gross: 20_000_000,
        tax: 1_693_750,
      },
    ]);
    const [header, row] = csv.trimEnd().split('\r\n');
    expect(header).toContain('Kode Objek Pajak');
    expect(row).toBe(
      `0012345678901000,Agus Setiawan,1,2026,${KODE_OBJEK_PAJAK_PEGAWAI_TETAP},20000000,8.4688,1693750`
    );
  });

  it('memakai NPWP placeholder bila pelaut belum punya NPWP', () => {
    const csv = buildEbupotCsv([
      {
        npwp: null,
        name: 'Tanpa NPWP',
        periodMonth: 2,
        periodYear: 2026,
        gross: 5_000_000,
        tax: 0,
      },
    ]);
    expect(csv).toContain('0000000000000000,Tanpa NPWP');
    expect(csv).toContain(',0,0\r\n');
  });

  it('meng-escape nama berisi koma dan tanda kutip sesuai RFC 4180', () => {
    const csv = buildEbupotCsv([
      {
        npwp: '1234567890123456',
        name: 'PT "A", B',
        periodMonth: 3,
        periodYear: 2026,
        gross: 1_000_000,
        tax: 0,
      },
    ]);
    expect(csv).toContain('"PT ""A"", B"');
  });
});
