import { describe, expect, it } from 'vitest';
import { COMPANY_INFO } from '@/data/haswakarya-data';
import {
  CTA_TRUST_MARKS,
  HUB_OFFICES,
  dmsToDecimalPair,
  mapsUrlFromDms,
} from '@/data/siteHubs';

/**
 * Blok "Strategic Maritime Hubs" menampilkan koordinat derajat-menit-detik
 * sekaligus menautkan Google Maps. Test ini mengunci dua hal: koordinat yang
 * tampil tidak boleh berubah diam-diam, dan tautan peta harus berasal dari
 * koordinat yang sama (bukan hasil pencarian teks yang bisa salah tempat).
 */
describe('dmsToDecimalPair', () => {
  it('mengubah pasangan utara/timur ke desimal positif', () => {
    expect(dmsToDecimalPair("1°06'44\"N 103°58'28\"E")).toEqual({
      lat: 1.1122222222222222,
      lng: 103.97444444444444,
    });
  });

  it('memberi tanda negatif untuk lintang selatan', () => {
    const pair = dmsToDecimalPair("6°09'12\"S 106°47'33\"E");
    expect(pair).not.toBeNull();
    expect(pair!.lat).toBeCloseTo(-6.153333, 5);
    expect(pair!.lng).toBeCloseTo(106.7925, 5);
  });

  it('menolak nilai yang bukan dua pasangan koordinat', () => {
    expect(dmsToDecimalPair("1°06'44\"N")).toBeNull();
    expect(dmsToDecimalPair('Ruko Tiban Mas, Batam')).toBeNull();
    expect(dmsToDecimalPair('')).toBeNull();
  });
});

describe('mapsUrlFromDms', () => {
  it('membangun URL Google Maps dari koordinat desimal lima angka', () => {
    expect(mapsUrlFromDms("1°06'44\"N 103°58'28\"E")).toBe(
      'https://www.google.com/maps/search/?api=1&query=1.11222,103.97444',
    );
    expect(mapsUrlFromDms("6°09'12\"S 106°47'33\"E")).toBe(
      'https://www.google.com/maps/search/?api=1&query=-6.15333,106.79250',
    );
  });

  it('mengembalikan null saat koordinat tidak terbaca', () => {
    expect(mapsUrlFromDms('Batam')).toBeNull();
  });
});

describe('HUB_OFFICES', () => {
  it('memuat tepat dua kantor: HQ Batam dan cabang Jakarta', () => {
    expect(HUB_OFFICES.map((office) => office.role)).toEqual(['HQ', 'Branch']);
    expect(HUB_OFFICES.map((office) => office.id)).toEqual(['batam-hq', 'jakarta-branch']);
  });

  it('memakai kontak perusahaan yang benar, bukan angka karangan', () => {
    expect(HUB_OFFICES[0].contactValue).toBe(COMPANY_INFO.fax);
    expect(HUB_OFFICES[1].contactValue).toBe(COMPANY_INFO.phoneWhatsApp);
  });

  it('menautkan peta berdasarkan koordinat kantor itu sendiri', () => {
    for (const office of HUB_OFFICES) {
      expect(office.mapsUrl).toBe(mapsUrlFromDms(office.coordinates));
      expect(office.mapsUrl).toContain('google.com/maps');
    }
  });

  it('alamat kantor tidak kosong dan masih menyebut kota yang benar', () => {
    expect(HUB_OFFICES[0].address).toContain('Batam');
    expect(HUB_OFFICES[1].address).toContain('Jakarta Barat');
  });
});

describe('CTA_TRUST_MARKS', () => {
  it('hanya memuat klaim yang memang tertulis di company profile', () => {
    expect(CTA_TRUST_MARKS).toEqual([
      'SIUKAK Kemenhub RI',
      'MLC 2006 Compliant',
      'STCW 2010 Standard',
    ]);
  });
});
