import { describe, expect, it } from 'vitest';
import {
  capabilitiesOf,
  hasCapability,
  isAppRole,
  normalizeRole,
  resolveRouteAccess,
  PORTAL_ADMIN_ROLES,
  SEAFARER_DIRECTORY_ROLES,
} from '@/lib/auth/rbac';

describe('RBAC — peran & kapabilitas', () => {
  it('menolak peran yang tidak dikenal', () => {
    expect(isAppRole('GOD_MODE')).toBe(false);
    expect(normalizeRole('god_mode')).toBeNull();
    expect(capabilitiesOf('GOD_MODE')).toEqual([]);
    expect(hasCapability(undefined, 'portal.admin')).toBe(false);
  });

  it('menormalkan peran case-insensitive', () => {
    expect(normalizeRole(' crewing_manager ')).toBe('CREWING_MANAGER');
    expect(isAppRole('SUPERADMIN')).toBe(true);
  });

  it('hanya admin yang memegang kapabilitas portal.admin', () => {
    expect(hasCapability('SUPERADMIN', 'portal.admin')).toBe(true);
    expect(hasCapability('CREWING_MANAGER', 'portal.admin')).toBe(true);
    expect(hasCapability('CREWING_OFFICER', 'portal.admin')).toBe(false);
    expect(hasCapability('SHIPOWNER_CLIENT', 'portal.admin')).toBe(false);
    expect(hasCapability('CANDIDATE_SEAFARER', 'portal.admin')).toBe(false);
  });

  it('pelaut hanya memegang read_own, shipowner hanya read_own + vetting.decide', () => {
    expect(capabilitiesOf('CANDIDATE_SEAFARER')).toEqual(['portal.read_own']);
    expect(capabilitiesOf('SHIPOWNER_CLIENT')).toEqual(['portal.read_own', 'vetting.decide']);
    expect(hasCapability('SHIPOWNER_CLIENT', 'portal.operations')).toBe(false);
  });

  it('daftar peran admin tidak memuat peran eksternal', () => {
    expect(PORTAL_ADMIN_ROLES).not.toContain('CANDIDATE_SEAFARER');
    expect(PORTAL_ADMIN_ROLES).not.toContain('SHIPOWNER_CLIENT');
    expect(SEAFARER_DIRECTORY_ROLES).not.toContain('SHIPOWNER_CLIENT');
  });
});

describe('RBAC — peta rute portal', () => {
  it('payroll & kontrak hanya untuk admin', () => {
    expect(resolveRouteAccess('/portal/payroll', 'CREWING_OFFICER').allowed).toBe(false);
    expect(resolveRouteAccess('/portal/payroll', 'CREWING_MANAGER').allowed).toBe(true);
    expect(resolveRouteAccess('/portal/contracts', 'CANDIDATE_SEAFARER').allowed).toBe(false);
    expect(resolveRouteAccess('/portal/contracts', 'SUPERADMIN').allowed).toBe(true);
  });

  it('ekspor PPh 21 tertutup bagi shipowner dan pelaut', () => {
    expect(resolveRouteAccess('/portal/payroll/tax-summary', 'SHIPOWNER_CLIENT').allowed).toBe(false);
    expect(resolveRouteAccess('/portal/payroll/tax-summary', 'CANDIDATE_SEAFARER').allowed).toBe(false);
    expect(resolveRouteAccess('/portal/payroll/tax-summary', 'SUPERADMIN').allowed).toBe(true);
  });

  it('operasi crewing terbuka untuk staf, tertutup untuk pelaut & shipowner', () => {
    expect(resolveRouteAccess('/portal/seafarers', 'CREWING_OFFICER').allowed).toBe(true);
    expect(resolveRouteAccess('/portal/seafarers/123', 'SHIPOWNER_CLIENT').allowed).toBe(false);
    expect(resolveRouteAccess('/portal/matrix', 'CANDIDATE_SEAFARER').allowed).toBe(false);
  });

  it('dashboard portal boleh diakses semua peran login', () => {
    expect(resolveRouteAccess('/portal', 'CANDIDATE_SEAFARER').allowed).toBe(true);
    expect(resolveRouteAccess('/portal', 'SHIPOWNER_CLIENT').allowed).toBe(true);
  });

  it('jejak audit hanya untuk admin', () => {
    expect(resolveRouteAccess('/portal/audit', 'SUPERADMIN').allowed).toBe(true);
    expect(resolveRouteAccess('/portal/audit', 'CREWING_MANAGER').allowed).toBe(true);
    expect(resolveRouteAccess('/portal/audit', 'CREWING_OFFICER').allowed).toBe(false);
    expect(resolveRouteAccess('/portal/audit', 'SHIPOWNER_CLIENT').allowed).toBe(false);
    expect(resolveRouteAccess('/portal/audit/2026', 'CREWING_OFFICER').allowed).toBe(false);
  });

  it('rute di luar portal tidak dibatasi peta ini', () => {
    const decision = resolveRouteAccess('/share/vetting/abc', 'SHIPOWNER_CLIENT');
    expect(decision.allowed).toBe(true);
    expect(decision.matchedRule).toBeNull();
  });
});
