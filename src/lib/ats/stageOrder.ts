/**
 * Sumber tunggal urutan tahap ATS.
 *
 * Urutan mengikuti "Key Stages of Recruitment" pada company profile
 * PT HASWAKARYA ANDALAN SEDARE (9 langkah), dengan dua tahap siklus hidup
 * tambahan yang memang ada di basis data: kontrak selesai/cuti, dan status
 * REJECTED yang tidak masuk urutan maju.
 *
 * Dipakai bersama oleh:
 * - PATCH /api/portal/applications/[id]/stage (hitung maju/mundur)
 * - papan kanban /portal/crewing (kolom + tombol "Lanjut Tahap")
 */

/** Tahap yang bisa ditampilkan sebagai kolom papan kanban. */
export type CrewStageId =
  | 'APPLIED'
  | 'DOCUMENT_VERIFIED'
  | 'MARLINS_ASSESSMENT'
  | 'TECHNICAL_INTERVIEW'
  | 'OWNER_VETTING'
  | 'MCU_CLEARANCE'
  | 'VISA_PROCESSING'
  | 'PKL_SIGNING'
  | 'ONBOARD_DEPLOYED'
  | 'SIGN_OFF_LEAVE';

export interface CrewStageColumn {
  id: CrewStageId;
  /** Judul kolom pada papan kanban. */
  title: string;
  /** Langkah padanannya pada company profile; null untuk tahap di luar profil. */
  profileStep: number | null;
  color: string;
  badge: string;
}

/**
 * Urutan maju proses seleksi. Indeks dipakai untuk menentukan apakah sebuah
 * perpindahan tahap tergolong mundur (butuh izin admin).
 */
export const CREW_STAGE_ORDER: CrewStageId[] = [
  'APPLIED',
  'DOCUMENT_VERIFIED',
  'MARLINS_ASSESSMENT',
  'TECHNICAL_INTERVIEW',
  'OWNER_VETTING',
  'MCU_CLEARANCE',
  'VISA_PROCESSING',
  'PKL_SIGNING',
  'ONBOARD_DEPLOYED',
  'SIGN_OFF_LEAVE',
];

export const CREW_STAGE_COLUMNS: CrewStageColumn[] = [
  {
    id: 'APPLIED',
    title: 'Berkas Masuk',
    profileStep: 1,
    color: 'border-slate-200 bg-slate-50/70',
    badge: 'bg-slate-100 text-slate-700',
  },
  {
    id: 'DOCUMENT_VERIFIED',
    title: 'STCW Hubla Sah',
    profileStep: 2,
    color: 'border-sky-200 bg-sky-50/40',
    badge: 'bg-sky-100 text-sky-800',
  },
  {
    id: 'MARLINS_ASSESSMENT',
    title: 'Ujian Marlins (>=80%)',
    profileStep: 3,
    color: 'border-amber-200 bg-amber-50/40',
    badge: 'bg-amber-100 text-amber-800',
  },
  {
    id: 'TECHNICAL_INTERVIEW',
    title: 'Interview Port Capt',
    profileStep: 4,
    color: 'border-indigo-200 bg-indigo-50/40',
    badge: 'bg-indigo-100 text-indigo-800',
  },
  {
    id: 'OWNER_VETTING',
    title: 'Shipowner Vetting',
    profileStep: 5,
    color: 'border-purple-200 bg-purple-50/40',
    badge: 'bg-purple-100 text-purple-800',
  },
  {
    id: 'MCU_CLEARANCE',
    title: 'Medical Check-Up',
    profileStep: 6,
    color: 'border-teal-200 bg-teal-50/40',
    badge: 'bg-teal-100 text-teal-800',
  },
  {
    id: 'VISA_PROCESSING',
    title: 'Visa & Endorsement',
    profileStep: 7,
    color: 'border-cyan-200 bg-cyan-50/40',
    badge: 'bg-cyan-100 text-cyan-800',
  },
  {
    id: 'PKL_SIGNING',
    title: 'Kontrak PKL & Sign-On',
    profileStep: 8,
    color: 'border-blue-200 bg-blue-50/40',
    badge: 'bg-blue-100 text-blue-800',
  },
  {
    id: 'ONBOARD_DEPLOYED',
    title: 'Onboard Berlayar',
    profileStep: 9,
    color: 'border-emerald-200 bg-emerald-50/40',
    badge: 'bg-emerald-100 text-emerald-800',
  },
  {
    id: 'SIGN_OFF_LEAVE',
    title: 'Selesai Kontrak / Cuti',
    profileStep: null,
    color: 'border-stone-200 bg-stone-50/60',
    badge: 'bg-stone-200 text-stone-700',
  },
];

/**
 * Tahap berikutnya pada urutan maju.
 * Mengembalikan null bila tahap tidak dikenal atau sudah di ujung urutan.
 */
export function nextCrewStage(current: string): CrewStageId | null {
  const index = CREW_STAGE_ORDER.indexOf(current as CrewStageId);
  if (index === -1) return null;
  return CREW_STAGE_ORDER[index + 1] ?? null;
}

/**
 * Menentukan arah perpindahan tahap.
 * `null` bila salah satu tahap tidak ada pada urutan (mis. REJECTED).
 */
export function crewStageDirection(
  from: string,
  to: string
): 'forward' | 'backward' | 'same' | null {
  const fromIndex = CREW_STAGE_ORDER.indexOf(from as CrewStageId);
  const toIndex = CREW_STAGE_ORDER.indexOf(to as CrewStageId);
  if (fromIndex === -1 || toIndex === -1) return null;
  if (fromIndex === toIndex) return 'same';
  return toIndex > fromIndex ? 'forward' : 'backward';
}