import { describe, expect, it } from 'vitest';
import {
  BUSINESS_SCOPES,
  COMPANY_INFO,
  CORE_VALUES,
  RECRUITMENT_STAGES,
  SEAFARER_QUALIFICATIONS,
  STATS_DATA,
} from '@/data/haswakarya-data';

/**
 * Kunci fakta dari company profile PT HASWAKARYA ANDALAN SEDARE
 * ("Haswakarya crew agency.pdf", 10 halaman) supaya halaman publik tidak
 * menyimpang saat konten diedit di kemudian hari.
 */
describe('COMPANY_INFO — sesuai company profile', () => {
  it('memakai nama badan hukum yang benar', () => {
    expect(COMPANY_INFO.entityName).toBe('PT HASWAKARYA ANDALAN SEDARE');
  });

  it('tahun berdiri sesuai profil: Februari 2026', () => {
    expect(COMPANY_INFO.since).toBe('February 2026');
  });

  it('kontak sesuai profil', () => {
    expect(COMPANY_INFO.email).toBe('crewing@haswakarya.com');
    expect(COMPANY_INFO.fax).toBe('(+62778) 326 066');
    expect(COMPANY_INFO.phoneWhatsApp).toBe('+62 859-2205-2112');
    expect(COMPANY_INFO.whatsappClean).toBe('6285922052112');
  });

  it('NIB sesuai profil', () => {
    expect(COMPANY_INFO.nib).toBe('0702240024481');
  });

  it('alamat kantor pusat Batam dan cabang Jakarta sesuai profil', () => {
    expect(COMPANY_INFO.headOffice).toContain('Ruko Tiban Mas blok A no. 59-60');
    expect(COMPANY_INFO.headOffice).toContain('Tiban Lama, Batam, Kepulauan Riau');
    expect(COMPANY_INFO.branchOffice).toContain('Jl. Prof. Dr. Latumeten no. 33');
    expect(COMPANY_INFO.branchOffice).toContain('Jakarta Barat, DKI Jakarta');
  });

  it('lima misi sesuai profil', () => {
    expect(COMPANY_INFO.mission).toEqual([
      'Professional Recruitment',
      'Safety & Compliance',
      'Client Partnership',
      'Seafarer Development',
      'Sustainable Growth',
    ]);
  });
});

describe('konten halaman publik — jumlah butir sesuai profil', () => {
  it('tiga core values: Care, Communication, Improvement', () => {
    expect(CORE_VALUES.map((item) => item.title.replace('*', ''))).toEqual([
      'Care',
      'Communication',
      'Improvement',
    ]);
  });

  it('empat business scope', () => {
    expect(BUSINESS_SCOPES).toHaveLength(4);
  });

  it('lima kualifikasi pelaut', () => {
    expect(SEAFARER_QUALIFICATIONS).toHaveLength(5);
  });

  it('sembilan tahap rekrutmen berurutan', () => {
    expect(RECRUITMENT_STAGES).toHaveLength(9);
    expect(RECRUITMENT_STAGES.map((stage) => stage.step)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9,
    ]);
  });

  it('tidak lagi mencantumkan durasi hari yang tidak ada di profil', () => {
    for (const stage of RECRUITMENT_STAGES) {
      expect(stage).not.toHaveProperty('duration');
    }
  });

  it('tahap rekrutmen tidak memakai bahasa Indonesia', () => {
    const indonesian = /\b(yang|dan|untuk|dengan|kami|tidak|adalah|pada)\b/i;
    for (const stage of RECRUITMENT_STAGES) {
      expect(indonesian.test(`${stage.title} ${stage.subtitle} ${stage.description}`)).toBe(false);
    }
  });

  it('statistik memakai angka yang dapat dipertanggungjawabkan', () => {
    const values = STATS_DATA.map((stat) => stat.value);
    expect(values).toContain('9 Steps');
    expect(values).toContain('100%');
    expect(values).toContain('2 Hubs');
  });
});