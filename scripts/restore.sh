#!/bin/sh
# ═══════════════════════════════════════════════════════════════════════════
# Haswakarya Crewing OS — Restore database + vault dari arsip backup
#
# Pemakaian:
#   sh scripts/restore.sh --archive /backups/hcos-20261121T083000Z.dump --target-db haswakarya_restore --yes
#   sh scripts/restore.sh --archive <dump> --target-db <db> --create --yes
#   sh scripts/restore.sh --archive <dump> --verify-only      # hanya hitung objek
#
# Variabel lingkungan:
#   DATABASE_URL    wajib; database target menggantikan nama database di URL ini
#   BACKUP_DIR      default /backups
#
# Keselamatan: tanpa `--yes`, skrip hanya mencetak rencana. Restore ke database
# yang sudah berisi tabel memakai `--clean --if-exists` sehingga objek lama
# dihapus; jalankan verifikasi pada database sementara, bukan produksi.
# ═══════════════════════════════════════════════════════════════════════════
set -eu

SCRIPT_DIR="$(dirname "$0")"
# shellcheck source=scripts/libpq-url.sh
. "$SCRIPT_DIR/libpq-url.sh"

ARCHIVE=""
TARGET_DB=""
CREATE_DB=0
CONFIRMED=0
VERIFY_ONLY=0

while [ "$#" -gt 0 ]; do
  case "$1" in
    --archive) ARCHIVE="${2:?--archive butuh path}"; shift 2 ;;
    --target-db) TARGET_DB="${2:?--target-db butuh nama}"; shift 2 ;;
    --create) CREATE_DB=1; shift ;;
    --yes) CONFIRMED=1; shift ;;
    --verify-only) VERIFY_ONLY=1; shift ;;
    -h|--help) sed -n '2,22p' "$0"; exit 0 ;;
    *) echo "{\"level\":\"error\",\"event\":\"restore.bad_argument\",\"argument\":\"$1\"}" >&2; exit 2 ;;
  esac
done

log() {
  if [ -n "${3:-}" ]; then
    printf '{"ts":"%s","level":"%s","event":"%s",%s}\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$1" "$2" "$3"
  else
    printf '{"ts":"%s","level":"%s","event":"%s"}\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$1" "$2"
  fi
}

die() { log error "$1" "${2:-}"; exit 1; }

[ -n "$ARCHIVE" ] || die restore.missing_archive '"detail":"--archive wajib"'
[ -f "$ARCHIVE" ] || die restore.archive_not_found "\"archive\":\"$ARCHIVE\""
command -v pg_restore >/dev/null 2>&1 || die restore.pg_restore_missing ''

if [ "$VERIFY_ONLY" -eq 1 ]; then
  entries="$(pg_restore --list "$ARCHIVE" | grep -c '^[0-9]' || true)"
  [ "${entries:-0}" -ge 1 ] || die restore.archive_empty "\"archive\":\"$ARCHIVE\""
  log info restore.verified "\"archive\":\"$(basename "$ARCHIVE")\",\"entries\":$entries"
  exit 0
fi

[ -n "$TARGET_DB" ] || die restore.missing_target '"detail":"--target-db wajib"'
[ -n "${DATABASE_URL:-}" ] || die restore.missing_database_url '"detail":"DATABASE_URL wajib"'

# libpq menolak parameter khas Prisma (`?schema=public`); bersihkan dulu.
CLEAN_URL="$(libpq_url "$DATABASE_URL")"
BASE="${CLEAN_URL%%\?*}"
QUERY=""
case "$CLEAN_URL" in
  *\?*) QUERY="?${CLEAN_URL#*\?}" ;;
esac
PREFIX="${BASE%/*}"
TARGET_URL="$PREFIX/$TARGET_DB$QUERY"

if [ "$CONFIRMED" -ne 1 ]; then
  log warn restore.plan "\"archive\":\"$(basename "$ARCHIVE")\",\"target\":\"$TARGET_DB\",\"create\":$CREATE_DB"
  printf 'Rencana: pg_restore --clean --if-exists --no-owner -d %s %s\n' "$TARGET_DB" "$(basename "$ARCHIVE")"
  printf 'Jalankan ulang dengan --yes untuk benar-benar menimpa database target.\n'
  exit 3
fi

if [ "$CREATE_DB" -eq 1 ]; then
  if psql -X -t -A -c 'select 1' "$TARGET_URL" >/dev/null 2>&1; then
    log info restore.target_exists "\"target\":\"$TARGET_DB\""
  else
    createdb -h "${PGHOST:-127.0.0.1}" -p "${PGPORT:-5432}" -U "${PGUSER:-postgres}" "$TARGET_DB" \
      || die restore.create_failed "\"target\":\"$TARGET_DB\""
    log info restore.target_created "\"target\":\"$TARGET_DB\""
  fi
fi

log info restore.started "\"archive\":\"$(basename "$ARCHIVE")\",\"target\":\"$TARGET_DB\""
pg_restore --clean --if-exists --no-owner -d "$TARGET_URL" "$ARCHIVE" \
  || die restore.failed "\"target\":\"$TARGET_DB\""

TABLES="$(psql -X -t -A -c "select count(*) from information_schema.tables where table_schema='public'" "$TARGET_URL" | tr -d '[:space:]')"
log info restore.completed "\"target\":\"$TARGET_DB\",\"tables\":${TABLES:-0}"