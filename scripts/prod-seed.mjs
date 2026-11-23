// ═══════════════════════════════════════════════════════════════════════════
// Gerbang seed produksi. Dipanggil dari `scripts/vercel-build.sh`.
//
// Aturan:
//   - RUN_DB_SEED != "1"      → lewati (deploy normal tidak pernah mengisi data).
//   - SEED_ADMIN_PASSWORD kosong → gagal build (sandi acak tidak bisa dipakai login).
//   - Database sudah punya user → lewati (mencegah `deleteMany` menghapus data).
//
// Kode keluar 0 untuk semua jalur "lewati" supaya deploy tetap hijau.
// ═══════════════════════════════════════════════════════════════════════════
import { spawnSync } from 'node:child_process';
import { PrismaClient } from '@prisma/client';

const enabled = process.env.RUN_DB_SEED === '1';

if (!enabled) {
  console.log('[seed] dilewati (RUN_DB_SEED bukan "1")');
  process.exit(0);
}

if (!process.env.SEED_ADMIN_PASSWORD?.trim()) {
  console.error('[seed] GAGAL: RUN_DB_SEED=1 tetapi SEED_ADMIN_PASSWORD kosong.');
  process.exit(1);
}

const prisma = new PrismaClient();

let userCount;
try {
  userCount = await prisma.user.count();
} catch (error) {
  console.error('[seed] GAGAL membaca tabel User:', error instanceof Error ? error.message : error);
  await prisma.$disconnect();
  process.exit(1);
}

await prisma.$disconnect();

if (userCount > 0) {
  console.log(`[seed] dilewati: database sudah berisi ${userCount} user.`);
  process.exit(0);
}

console.log('[seed] database kosong → menjalankan prisma db seed.');
const result = spawnSync('npm', ['run', 'db:seed'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: process.env,
});

if (result.status !== 0) {
  console.error('[seed] GAGAL: prisma db seed keluar dengan kode', result.status);
  process.exit(result.status ?? 1);
}

console.log('[seed] selesai.');