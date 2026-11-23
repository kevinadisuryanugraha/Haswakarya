#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# Build Vercel: migrasi skema → seed sekali (opsional) → next build.
#
# Kenapa di build: DATABASE_URL produksi bertipe "sensitive" di Vercel
# sehingga tidak bisa dibaca operator dari mesin lokal. Build container
# punya aksesnya, jadi migrasi dijalankan di sana. `prisma migrate deploy`
# idempotent: aman dijalankan setiap deploy.
#
# Seed HANYA jalan bila RUN_DB_SEED=1, dan `scripts/prod-seed.mjs` menolak
# menyentuh database yang sudah berisi user. Hapus RUN_DB_SEED setelah sekali
# pakai — `prisma/seed.ts` memanggil deleteMany di seluruh tabel.
# ═══════════════════════════════════════════════════════════════════════════
set -euo pipefail

echo "[build] prisma generate"
npx prisma generate

echo "[build] prisma migrate deploy"
npx prisma migrate deploy

echo "[build] seed produksi (dijaga env)"
node scripts/prod-seed.mjs

echo "[build] next build"
npx next build