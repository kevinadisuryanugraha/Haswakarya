/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Haswakarya Crewing OS — Role Based Access Control (RBAC)
 * Satu sumber kebenaran untuk peran, kapabilitas, dan peta rute portal.
 * Modul ini murni (tanpa Prisma / tanpa Next) agar dapat diuji unit.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const APP_ROLES = [
  'SUPERADMIN',
  'CREWING_MANAGER',
  'CREWING_OFFICER',
  'SHIPOWNER_CLIENT',
  'CANDIDATE_SEAFARER',
] as const;

export type AppRole = (typeof APP_ROLES)[number];

/**
 * Kapabilitas portal:
 * - portal.admin       : akses penuh (payroll, kontrak, setelan)
 * - portal.operations  : operasi crewing (ATS, pelaut, armada, requisition)
 * - portal.read_own    : hanya boleh membaca datanya sendiri
 * - vetting.decide     : boleh memberi keputusan vetting shipowner
 */
export type PortalCapability =
  | 'portal.admin'
  | 'portal.operations'
  | 'portal.read_own'
  | 'vetting.decide';

const CAPABILITIES: Record<AppRole, readonly PortalCapability[]> = {
  SUPERADMIN: ['portal.admin', 'portal.operations', 'portal.read_own', 'vetting.decide'],
  CREWING_MANAGER: ['portal.admin', 'portal.operations', 'portal.read_own'],
  CREWING_OFFICER: ['portal.operations', 'portal.read_own'],
  SHIPOWNER_CLIENT: ['portal.read_own', 'vetting.decide'],
  CANDIDATE_SEAFARER: ['portal.read_own'],
};

export const ROLE_LABEL: Record<AppRole, string> = {
  SUPERADMIN: 'Super Admin',
  CREWING_MANAGER: 'Crewing Manager',
  CREWING_OFFICER: 'Crewing Officer',
  SHIPOWNER_CLIENT: 'Shipowner Principal',
  CANDIDATE_SEAFARER: 'Pelaut / Kandidat',
};

export function isAppRole(value: unknown): value is AppRole {
  return typeof value === 'string' && (APP_ROLES as readonly string[]).includes(value);
}

export function normalizeRole(value: unknown): AppRole | null {
  if (typeof value !== 'string') return null;
  const upper = value.trim().toUpperCase();
  return isAppRole(upper) ? upper : null;
}

export function capabilitiesOf(role: unknown): readonly PortalCapability[] {
  const normalized = normalizeRole(role);
  return normalized ? CAPABILITIES[normalized] : [];
}

export function hasCapability(role: unknown, capability: PortalCapability): boolean {
  return capabilitiesOf(role).includes(capability);
}

export function hasAnyCapability(role: unknown, required: readonly PortalCapability[]): boolean {
  const capabilities = capabilitiesOf(role);
  return required.some((capability) => capabilities.includes(capability));
}

/** Staf internal Haswakarya (bukan shipowner, bukan pelaut). */
export const PORTAL_STAFF_ROLES: readonly AppRole[] = [
  'SUPERADMIN',
  'CREWING_MANAGER',
  'CREWING_OFFICER',
];

/** Peran yang boleh membaca data operasional. */
export const PORTAL_OPERATIONS_ROLES: readonly AppRole[] = [
  'SUPERADMIN',
  'CREWING_MANAGER',
  'CREWING_OFFICER',
];

/** Peran yang boleh menulis data finansial / kontrak. */
export const PORTAL_ADMIN_ROLES: readonly AppRole[] = [
  'SUPERADMIN',
  'CREWING_MANAGER',
];

/** Hanya akun internal yang boleh melihat direktori pelaut penuh. */
export const SEAFARER_DIRECTORY_ROLES: readonly AppRole[] = [
  'SUPERADMIN',
  'CREWING_MANAGER',
  'CREWING_OFFICER',
];

/** Semua peran yang sah masuk portal. */
export const PORTAL_ANY_ROLES: readonly AppRole[] = [...APP_ROLES];

/**
 * Peta akses per prefix path untuk middleware.
 * Urutan penting: prefix paling spesifik lebih dulu.
 */
export interface RouteRule {
  prefix: string;
  capabilities: readonly PortalCapability[];
}

export const PORTAL_ROUTE_RULES: readonly RouteRule[] = [
  { prefix: '/portal/audit', capabilities: ['portal.admin'] },
  { prefix: '/portal/compliance', capabilities: ['portal.operations', 'portal.admin'] },
  { prefix: '/portal/payroll/tax-summary', capabilities: ['portal.admin'] },
  { prefix: '/portal/payroll', capabilities: ['portal.admin'] },
  { prefix: '/portal/contracts', capabilities: ['portal.admin'] },
  { prefix: '/portal/crewing', capabilities: ['portal.operations'] },
  { prefix: '/portal/matrix', capabilities: ['portal.operations'] },
  { prefix: '/portal/requisitions', capabilities: ['portal.operations'] },
  { prefix: '/portal/seafarers', capabilities: ['portal.operations'] },
  { prefix: '/portal/vessels', capabilities: ['portal.operations'] },
  // Ganti sandi adalah hak setiap akun yang login, termasuk pelaut & shipowner.
  { prefix: '/portal/settings', capabilities: ['portal.read_own'] },
  { prefix: '/portal', capabilities: ['portal.admin', 'portal.operations', 'portal.read_own'] },
];

export interface RouteAccessDecision {
  allowed: boolean;
  matchedRule: string | null;
  required: readonly PortalCapability[];
}

/** Menentukan apakah sebuah role boleh mengakses sebuah path portal. */
export function resolveRouteAccess(pathname: string, role: unknown): RouteAccessDecision {
  const rule = PORTAL_ROUTE_RULES.find(
    (candidate) => pathname === candidate.prefix || pathname.startsWith(`${candidate.prefix}/`)
  );

  if (!rule) {
    return { allowed: true, matchedRule: null, required: [] };
  }

  return {
    allowed: hasAnyCapability(role, rule.capabilities),
    matchedRule: rule.prefix,
    required: rule.capabilities,
  };
}
