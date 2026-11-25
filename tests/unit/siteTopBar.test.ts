import { describe, expect, it } from 'vitest';
import { COMPANY_INFO } from '@/data/haswakarya-data';
import {
  TOP_BAR,
  TOP_BAR_MAX_HEIGHT,
  TOP_BAR_REVEAL,
  buildTopBarModel,
} from '@/data/siteTopBar';

/**
 * Strip TopBar tampil di seluruh halaman publik, jadi teksnya harus verbatim
 * dari `COMPANY_INFO` (sumber: dokumen perusahaan) dan urutannya mengikuti
 * daftar yang disetujui: WhatsApp, email, Fax, SIUKAK & NIB, MLC, hub, WIB.
 *
 * Test ini juga mengunci tangga prioritas: kalau ada yang menaikkan item ke
 * breakpoint lebih kecil tanpa menghitung ulang anggaran lebar (kontainer
 * kanonik 1280px = 1216px efektif), strip akan terpotong lagi seperti bug
 * yang diperbaiki di sini.
 */
describe('TOP_BAR contacts', () => {
  it('memakai urutan kontak WhatsApp lalu email', () => {
    expect(TOP_BAR.contacts.map((item) => item.id)).toEqual([
      'whatsapp',
      'email',
      'fax',
    ]);
  });

  it('menurunkan nomor & tautan WhatsApp dari COMPANY_INFO', () => {
    const whatsapp = TOP_BAR.contacts.find((item) => item.id === 'whatsapp');
    expect(whatsapp?.value).toBe(COMPANY_INFO.phoneWhatsApp);
    expect(whatsapp?.href).toBe(COMPANY_INFO.whatsappUrl);
    expect(whatsapp?.external).toBe(true);
  });

  it('menurunkan email dari COMPANY_INFO dan memakai skema mailto', () => {
    const email = TOP_BAR.contacts.find((item) => item.id === 'email');
    expect(email?.value).toBe(COMPANY_INFO.email);
    expect(email?.href).toBe(`mailto:${COMPANY_INFO.email}`);
  });

  it('menampilkan fax persis seperti di COMPANY_INFO tanpa dijadikan tautan tel', () => {
    const fax = TOP_BAR.contacts.find((item) => item.id === 'fax');
    expect(fax?.value).toBe(COMPANY_INFO.fax);
    expect(fax?.label).toBe('Fax:');
    expect(fax?.href).toBeNull();
  });

  it('tidak merender item Fax saat nilai fax kosong', () => {
    const model = buildTopBarModel({
      phoneWhatsApp: '+62 000',
      whatsappUrl: 'https://wa.me/62000',
      email: 'ops@example.com',
      fax: '   ',
      nib: '000',
    });

    expect(model.contacts.map((item) => item.id)).toEqual(['whatsapp', 'email']);
    expect(JSON.stringify(model)).not.toContain('undefined');
  });
});

describe('TOP_BAR credentials', () => {
  it('memakai urutan SIUKAK & NIB, MLC, lalu hub kantor', () => {
    expect(TOP_BAR.credentials.map((item) => item.id)).toEqual([
      'nib',
      'mlc',
      'hubs',
    ]);
  });

  it('mengunci NIB verbatim dan menautkannya ke seksi Legals', () => {
    const nib = TOP_BAR.credentials.find((item) => item.id === 'nib');
    expect(nib?.value).toBe(COMPANY_INFO.nib);
    expect(nib?.label).toBe('SIUKAK & NIB:');
    expect(nib?.href).toBe('/#legals');
  });

  it('menyediakan label MLC panjang dan pendek', () => {
    const mlc = TOP_BAR.credentials.find((item) => item.id === 'mlc');
    expect(mlc?.value).toBe('MLC 2006 Compliant');
    expect(mlc?.shortValue).toBe('MLC 2006');
  });

  it('menautkan hub kantor ke seksi kontak', () => {
    const hubs = TOP_BAR.credentials.find((item) => item.id === 'hubs');
    expect(hubs?.value).toBe('Batam HQ & Jakarta Branch');
    expect(hubs?.href).toBe('/#contact');
  });
});

describe('TOP_BAR status & tangga prioritas', () => {
  it('menampilkan status zona waktu WIB', () => {
    expect(TOP_BAR.status.value).toBe('GMT+7 (WIB) Active');
    expect(TOP_BAR.status.href).toBeNull();
  });

  it('menyembunyikan Fax dan hub sampai 1536px (2xl) agar tidak bertabrakan di laptop', () => {
    expect(TOP_BAR_REVEAL.fax).toBe('hidden 2xl:inline-flex');
    expect(TOP_BAR_REVEAL.hubs).toBe('hidden 2xl:inline-flex');
    expect(TOP_BAR_REVEAL.status).toBe('hidden md:inline-flex');
    expect(TOP_BAR_REVEAL.whatsapp).toBe('inline-flex');
    expect(TOP_BAR_REVEAL.email).toBe('hidden sm:inline-flex');
    expect(TOP_BAR_REVEAL.nib).toBe('hidden md:inline-flex');
    expect(TOP_BAR_REVEAL.mlc).toBe('hidden lg:inline-flex');
  });

  it('menjaga tinggi strip di bawah 48px agar offset hero tidak berubah', () => {
    expect(TOP_BAR_MAX_HEIGHT).toBeLessThanOrEqual(48);
  });
});