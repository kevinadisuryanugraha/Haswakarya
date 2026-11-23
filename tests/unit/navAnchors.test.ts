import { describe, expect, it } from 'vitest';
import { resolveNavHref } from '@/lib/navigation/anchors';

describe('resolveNavHref — anchor lintas halaman', () => {
  it('membiarkan anchor apa adanya di beranda', () => {
    expect(resolveNavHref('#about', '/')).toBe('#about');
    expect(resolveNavHref('#qualifications', '/')).toBe('#qualifications');
  });

  it('menambahkan prefix rute beranda saat dipakai di halaman lain', () => {
    expect(resolveNavHref('#about', '/join-as-crew')).toBe('/#about');
    expect(resolveNavHref('#qualifications', '/join-as-crew')).toBe('/#qualifications');
    expect(resolveNavHref('#contact', '/join-as-crew')).toBe('/#contact');
  });

  it('memperlakukan pathname kosong sebagai beranda', () => {
    expect(resolveNavHref('#hero', null)).toBe('#hero');
    expect(resolveNavHref('#hero', undefined)).toBe('#hero');
    expect(resolveNavHref('#hero', '')).toBe('#hero');
  });

  it('tidak menyentuh href absolut, relatif, maupun anchor kosong', () => {
    expect(resolveNavHref('/join-as-crew', '/join-as-crew')).toBe('/join-as-crew');
    expect(resolveNavHref('/portal/login', '/join-as-crew')).toBe('/portal/login');
    expect(resolveNavHref('https://haswakarya.com', '/join-as-crew')).toBe('https://haswakarya.com');
    expect(resolveNavHref('mailto:crew@haswakarya.com', '/join-as-crew')).toBe(
      'mailto:crew@haswakarya.com',
    );
    expect(resolveNavHref('#', '/join-as-crew')).toBe('/#');
  });
});