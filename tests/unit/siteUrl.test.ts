import { describe, expect, it } from 'vitest';
import {
  CANONICAL_ORIGIN,
  absoluteUrl,
  resolveSiteUrl,
  CRAWLER_DISALLOW_PATHS,
  PUBLIC_SITEMAP_PATHS,
} from '@/lib/seo/siteUrl';

function env(overrides: Record<string, string | undefined> = {}): NodeJS.ProcessEnv {
  return { ...overrides } as NodeJS.ProcessEnv;
}

describe('resolveSiteUrl — satu sumber URL situs', () => {
  it('jatuh ke origin kanonik saat env kosong', () => {
    expect(resolveSiteUrl(env())).toBe(CANONICAL_ORIGIN);
  });

  it('mengabaikan nilai kosong (kasus .env.production.local)', () => {
    expect(resolveSiteUrl(env({ NEXT_PUBLIC_APP_URL: '   ' }))).toBe(CANONICAL_ORIGIN);
  });

  it('memakai nilai sah dan membuang trailing slash', () => {
    expect(resolveSiteUrl(env({ NEXT_PUBLIC_APP_URL: 'https://staging.haswakarya.com/' }))).toBe(
      'https://staging.haswakarya.com'
    );
  });

  it('menolak nilai yang bukan URL http(s)', () => {
    expect(resolveSiteUrl(env({ NEXT_PUBLIC_APP_URL: 'haswakarya.com' }))).toBe(CANONICAL_ORIGIN);
    expect(resolveSiteUrl(env({ NEXT_PUBLIC_APP_URL: 'ftp://haswakarya.com' }))).toBe(
      CANONICAL_ORIGIN
    );
  });

  it('menolak localhost di produksi, tetapi memakai di pengembangan', () => {
    const localhost = 'http://localhost:3000';
    expect(resolveSiteUrl(env({ NEXT_PUBLIC_APP_URL: localhost, NODE_ENV: 'production' }))).toBe(
      CANONICAL_ORIGIN
    );
    expect(resolveSiteUrl(env({ NEXT_PUBLIC_APP_URL: localhost, NODE_ENV: 'development' }))).toBe(
      'http://localhost:3000'
    );
  });

  it('127.0.0.1 diperlakukan sebagai localhost', () => {
    expect(resolveSiteUrl(env({ NEXT_PUBLIC_APP_URL: 'http://127.0.0.1:3000', NODE_ENV: 'production' }))).toBe(
      CANONICAL_ORIGIN
    );
  });
});

describe('absoluteUrl', () => {
  it('menambahkan garis miring depan yang hilang', () => {
    expect(absoluteUrl('recruit-crew', env())).toBe(`${CANONICAL_ORIGIN}/recruit-crew`);
  });

  it('beranda tidak menghasilkan garis miring ganda', () => {
    expect(absoluteUrl('/', env())).toBe(CANONICAL_ORIGIN);
  });

  it('menjaga path bertingkat dan query', () => {
    expect(absoluteUrl('/share/vetting/abc?x=1', env())).toBe(
      `${CANONICAL_ORIGIN}/share/vetting/abc?x=1`
    );
  });
});

describe('kebijakan crawler', () => {
  it('menutup portal, API, dan tautan bertoken', () => {
    expect([...CRAWLER_DISALLOW_PATHS]).toEqual(['/portal', '/api', '/share']);
  });

  it('hanya memuat rute publik yang benar-benar ada', () => {
    expect(PUBLIC_SITEMAP_PATHS.map((entry) => entry.path)).toEqual([
      '/',
      '/join-as-crew',
      '/recruit-crew',
    ]);
  });
});