import { describe, expect, it } from 'vitest';
import {
  buildContentSecurityPolicy,
  createNonce,
  cspHasDirective,
  requiresStrictScripts,
} from '@/lib/security/csp';

const NONCE = 'abc123def456';

function scriptSrc(policy: string): string {
  return policy
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('script-src')) ?? '';
}

describe('createNonce', () => {
  it('menghasilkan 32 karakter heksadesimal', () => {
    const nonce = createNonce();
    expect(nonce).toMatch(/^[a-f0-9]{32}$/);
  });

  it('tidak pernah mengulang nilai', () => {
    const values = new Set(Array.from({ length: 200 }, () => createNonce()));
    expect(values.size).toBe(200);
  });
});

describe('buildContentSecurityPolicy', () => {
  const prod = buildContentSecurityPolicy(NONCE, false);
  const dev = buildContentSecurityPolicy(NONCE, true);

  it('menyisipkan nonce ke script-src', () => {
    expect(scriptSrc(prod)).toContain(`'nonce-${NONCE}'`);
  });

  it('memakai strict-dynamic agar chunk Next.js dipercaya', () => {
    expect(scriptSrc(prod)).toContain("'strict-dynamic'");
  });

  it('tidak mengizinkan unsafe-inline pada script-src', () => {
    expect(scriptSrc(prod)).not.toContain('unsafe-inline');
    expect(scriptSrc(dev)).not.toContain('unsafe-inline');
  });

  it('hanya mengizinkan unsafe-eval di mode pengembangan', () => {
    expect(scriptSrc(prod)).not.toContain('unsafe-eval');
    expect(scriptSrc(dev)).toContain('unsafe-eval');
  });

  it('memblokir framing dan object', () => {
    expect(cspHasDirective(prod, 'frame-ancestors')).toBe(true);
    expect(prod).toContain("frame-ancestors 'none'");
    expect(prod).toContain("object-src 'none'");
  });

  it('membatasi base-uri dan form-action', () => {
    expect(prod).toContain("base-uri 'self'");
    expect(prod).toContain("form-action 'self'");
  });

  it('mengizinkan ws hanya saat pengembangan (HMR)', () => {
    expect(prod).not.toContain('ws:');
    expect(dev).toContain('ws:');
  });

  it('menambahkan upgrade-insecure-requests hanya di produksi', () => {
    expect(prod).toContain('upgrade-insecure-requests');
    expect(dev).not.toContain('upgrade-insecure-requests');
  });

  it('mengizinkan style inline untuk Tailwind dan next/font', () => {
    expect(prod).toContain("style-src 'self' 'unsafe-inline'");
  });

  it('tidak memuat default-src longgar', () => {
    expect(prod).toContain("default-src 'self'");
    expect(prod).not.toContain('default-src *');
  });

  it('memakai unsafe-inline untuk halaman statis tanpa nonce', () => {
    const statis = buildContentSecurityPolicy(NONCE, false, { strictScripts: false });
    expect(scriptSrc(statis)).toBe("script-src 'self' 'unsafe-inline'");
    expect(statis).not.toContain('nonce-');
    // Direktif lain tetap ketat.
    expect(statis).toContain("frame-ancestors 'none'");
    expect(statis).toContain("object-src 'none'");
    expect(statis).toContain("default-src 'self'");
  });

  it('menambahkan unsafe-eval pada halaman statis mode pengembangan', () => {
    const statisDev = buildContentSecurityPolicy(NONCE, true, { strictScripts: false });
    expect(scriptSrc(statisDev)).toBe("script-src 'self' 'unsafe-inline' 'unsafe-eval'");
  });
});

describe('requiresStrictScripts', () => {
  it('menuntut nonce untuk portal dan dossier vetting', () => {
    expect(requiresStrictScripts('/portal')).toBe(true);
    expect(requiresStrictScripts('/portal/login')).toBe(true);
    expect(requiresStrictScripts('/portal/seafarers')).toBe(true);
    expect(requiresStrictScripts('/share/vetting/abc123')).toBe(true);
  });

  it('membiarkan halaman publik statis memakai unsafe-inline', () => {
    expect(requiresStrictScripts('/')).toBe(false);
    expect(requiresStrictScripts('/404')).toBe(false);
    expect(requiresStrictScripts('/api/health')).toBe(false);
    expect(requiresStrictScripts('/portals')).toBe(false);
  });
});