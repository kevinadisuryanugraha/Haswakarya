import { describe, expect, it } from 'vitest';
import {
  CREW_STAGE_COLUMNS,
  CREW_STAGE_ORDER,
  crewStageDirection,
  nextCrewStage,
} from '@/lib/ats/stageOrder';

/**
 * "Key Stages of Recruitment" pada company profile PT HASWAKARYA ANDALAN
 * SEDARE memuat 9 langkah. Test ini mengunci agar ATS tidak menyimpang lagi:
 * setiap langkah profil wajib punya tahap, dan urutannya tidak boleh berubah
 * tanpa sengaja.
 */
const PROFILE_STAGES = [
  'APPLIED', // 1. Crew database check & candidate sourcing
  'DOCUMENT_VERIFIED', // 2. Document verification (buku pelaut, STCW)
  'MARLINS_ASSESSMENT', // 3. Marlins English test
  'TECHNICAL_INTERVIEW', // 4. Interview with our team
  'OWNER_VETTING', // 5. Interview by owner
  'MCU_CLEARANCE', // 6. Medical check-up
  'VISA_PROCESSING', // 7. Visa processing (if required)
  'PKL_SIGNING', // 8. Pre-departure document & SEA signing
  'ONBOARD_DEPLOYED', // 9. Onboard evaluation (14 days)
] as const;

describe('CREW_STAGE_ORDER — kesesuaian dengan company profile', () => {
  it('memuat 9 langkah profil secara berurutan', () => {
    expect(CREW_STAGE_ORDER.slice(0, 9)).toEqual([...PROFILE_STAGES]);
  });

  it('menempatkan tahap siklus hidup tambahan setelah onboard', () => {
    expect(CREW_STAGE_ORDER.at(-1)).toBe('SIGN_OFF_LEAVE');
    expect(CREW_STAGE_ORDER).toHaveLength(10);
  });

  it('tidak memuat tahap ganda', () => {
    expect(new Set(CREW_STAGE_ORDER).size).toBe(CREW_STAGE_ORDER.length);
  });

  it('tidak memasukkan REJECTED sebagai tahap maju', () => {
    expect(CREW_STAGE_ORDER).not.toContain('REJECTED');
  });

  it('tidak menyertakan tahap yang belum ada pada enum Prisma', () => {
    const legacy = ['APPLIED', 'DOCUMENT_VERIFIED', 'TECHNICAL_INTERVIEW', 'MARLINS_ASSESSMENT', 'OWNER_VETTING', 'MCU_CLEARANCE', 'PKL_SIGNING', 'ONBOARD_DEPLOYED', 'SIGN_OFF_LEAVE'];
    const allowed = new Set([...legacy, 'VISA_PROCESSING']);
    for (const stage of CREW_STAGE_ORDER) {
      expect(allowed.has(stage)).toBe(true);
    }
  });
});

describe('CREW_STAGE_COLUMNS — kolom papan kanban', () => {
  it('menampilkan setiap tahap maju tepat satu kali', () => {
    expect(CREW_STAGE_COLUMNS.map((col) => col.id)).toEqual(CREW_STAGE_ORDER);
  });

  it('setiap kolom punya judul, warna, dan badge', () => {
    for (const col of CREW_STAGE_COLUMNS) {
      expect(col.title.length).toBeGreaterThan(0);
      expect(col.color.length).toBeGreaterThan(0);
      expect(col.badge.length).toBeGreaterThan(0);
    }
  });

  it('nomor langkah profil berurutan 1..9 lalu null', () => {
    expect(CREW_STAGE_COLUMNS.map((col) => col.profileStep)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, null,
    ]);
  });
});

describe('nextCrewStage', () => {
  it('melangkah sesuai urutan profil', () => {
    expect(nextCrewStage('OWNER_VETTING')).toBe('MCU_CLEARANCE');
    expect(nextCrewStage('MCU_CLEARANCE')).toBe('VISA_PROCESSING');
    expect(nextCrewStage('VISA_PROCESSING')).toBe('PKL_SIGNING');
    expect(nextCrewStage('PKL_SIGNING')).toBe('ONBOARD_DEPLOYED');
  });

  it('berhenti di akhir urutan', () => {
    expect(nextCrewStage('SIGN_OFF_LEAVE')).toBeNull();
  });

  it('mengembalikan null untuk tahap tak dikenal', () => {
    expect(nextCrewStage('REJECTED')).toBeNull();
    expect(nextCrewStage('SOMETHING_ELSE')).toBeNull();
  });

  it('tidak pernah melompati MCU dan visa lagi', () => {
    expect(nextCrewStage('OWNER_VETTING')).not.toBe('ONBOARD_DEPLOYED');
  });
});

describe('crewStageDirection', () => {
  it('menandai perpindahan maju', () => {
    expect(crewStageDirection('APPLIED', 'VISA_PROCESSING')).toBe('forward');
  });

  it('menandai perpindahan mundur', () => {
    expect(crewStageDirection('PKL_SIGNING', 'DOCUMENT_VERIFIED')).toBe('backward');
  });

  it('menandai tahap yang sama', () => {
    expect(crewStageDirection('MCU_CLEARANCE', 'MCU_CLEARANCE')).toBe('same');
  });

  it('mengembalikan null bila salah satu tahap di luar urutan', () => {
    expect(crewStageDirection('REJECTED', 'APPLIED')).toBeNull();
    expect(crewStageDirection('APPLIED', 'REJECTED')).toBeNull();
  });
});