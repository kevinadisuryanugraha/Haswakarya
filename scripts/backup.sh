#!/bin/sh
# ═══════════════════════════════════════════════════════════════════════════
# Haswakarya Crewing OS — Backup database + vault dokumen maritim
#
# Dijalankan di dalam container `backup` (postgres:16-alpine) agar versi
# pg_dump selalu sama dengan server, atau di host yang punya pg_dump >= server.
#
# Pemakaian:
#   sh scripts/backup.sh                 # dump + tar vault + manifest + retensi
#   sh scripts/backup.sh --dry-run       # cetak rencana, tidak menyentuh apa pun
#   sh scripts/backup.sh --verify        # periksa arsip terbaru dengan pg_restore --list
#
# Variabel lingkungan:
#   DATABASE_URL      wajib, contoh postgresql://user:pass@postgres:5432/haswakarya_db
#   BACKUP_DIR        default /backups
#   VAULT_DIR         default /vault (kosongkan dengan SKIP_VAULT=1 bila tidak ada)
#   RETENTION_DAYS    default 14
# ═══════════════════════════════════════════════════════════════════════════
set -eu

SCRIPT_DIR="$(dirname "$0")"
# shellcheck source=scripts/libpq-url.sh
. "$SCRIPT_DIR/libpq-url.sh"

BACKUP_DIR="${BACKUP_DIR:-/backups}"
VAULT_DIR="${VAULT_DIR:-/vault}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
SKIP_VAULT="${SKIP_VAULT:-0}"
DRY_RUN=0
VERIFY_ONLY=0

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    --verify) VERIFY_ONLY=1 ;;
    -h|--help)
      sed -n '2,25p' "$0"
      exit 0
      ;;
    *)
      echo "{\"level\":\"error\",\"event\":\"backup.bad_argument\",\"argument\":\"$arg\"}" >&2
      exit 2
      ;;
  esac
done

log() {
  # $1 level, $2 event, $3 detail JSON (opsional, sudah berbentuk "k":"v")
  if [ -n "${3:-}" ]; then
    printf '{"ts":"%s","level":"%s","event":"%s",%s}\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$1" "$2" "$3"
  else
    printf '{"ts":"%s","level":"%s","event":"%s"}\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$1" "$2"
  fi
}

die() {
  log error "$1" "${2:-}"
  exit 1
}

if [ -z "${DATABASE_URL:-}" ]; then
  die backup.missing_database_url '"detail":"DATABASE_URL wajib diisi"'
fi

if ! command -v pg_dump >/dev/null 2>&1; then
  die backup.pg_dump_missing ''
fi

# libpq menolak parameter khas Prisma (`?schema=public`); bersihkan dulu.
DB_URL="$(libpq_url "$DATABASE_URL")"

# Nama database dipakai di manifest; ambil dari URL bila PGDATABASE kosong.
DB_NAME="${PGDATABASE:-}"
if [ -z "$DB_NAME" ]; then
  DB_NAME="${DB_URL%%\?*}"
  DB_NAME="${DB_NAME##*/}"
fi

# Catatan Windows: build psql di sana berhenti mem-parse opsi setelah argumen
# posisional, jadi opsi WAJIB mendahului URL database.
SERVER_VERSION="$(psql -X -t -A -c 'show server_version' "$DB_URL" 2>/dev/null || echo unknown)"
CLIENT_VERSION="$(pg_dump --version | awk '{print $3}')"

newest_dump() {
  find "$BACKUP_DIR" -maxdepth 1 -name 'hcos-*.dump' -type f 2>/dev/null | sort | tail -n 1
}

verify_archive() {
  archive="$1"
  [ -f "$archive" ] || die backup.verify_missing "\"archive\":\"$archive\""
  entries="$(pg_restore --list "$archive" | grep -c '^[0-9]' || true)"
  if [ "${entries:-0}" -lt 1 ]; then
    die backup.verify_empty "\"archive\":\"$archive\""
  fi
  log info backup.verified "\"archive\":\"$(basename "$archive")\",\"entries\":$entries"
}

if [ "$VERIFY_ONLY" -eq 1 ]; then
  archive="$(newest_dump)"
  [ -n "$archive" ] || die backup.verify_no_archive "\"dir\":\"$BACKUP_DIR\""
  verify_archive "$archive"
  exit 0
fi

STEM="hcos-$(date -u +%Y%m%dT%H%M%SZ)"
DUMP_PATH="$BACKUP_DIR/$STEM.dump"
VAULT_PATH="$BACKUP_DIR/$STEM-vault.tar.gz"
MANIFEST_PATH="$BACKUP_DIR/$STEM.manifest.json"

if [ "$DRY_RUN" -eq 1 ]; then
  log info backup.plan "\"stem\":\"$STEM\",\"backupDir\":\"$BACKUP_DIR\",\"database\":\"$DB_NAME\",\"serverVersion\":\"$SERVER_VERSION\",\"clientVersion\":\"$CLIENT_VERSION\",\"retentionDays\":$RETENTION_DAYS,\"skipVault\":$SKIP_VAULT"
  printf 'pg_dump -Fc -f %s "$DATABASE_URL"\n' "$DUMP_PATH"
  [ "$SKIP_VAULT" -eq 1 ] || printf 'tar -czf %s -C %s .\n' "$VAULT_PATH" "$VAULT_DIR"
  printf 'find %s -maxdepth 1 -name "hcos-*" -mtime +%s -delete\n' "$BACKUP_DIR" "$RETENTION_DAYS"
  exit 0
fi

mkdir -p "$BACKUP_DIR"
log info backup.started "\"stem\":\"$STEM\",\"database\":\"$DB_NAME\",\"serverVersion\":\"$SERVER_VERSION\",\"clientVersion\":\"$CLIENT_VERSION\""

pg_dump -Fc -f "$DUMP_PATH" "$DB_URL" || die backup.dump_failed "\"path\":\"$DUMP_PATH\""

TABLES="$(psql -X -t -A -c "select count(*) from information_schema.tables where table_schema='public'" "$DB_URL" 2>/dev/null | tr -d '[:space:]' || echo 0)"

ARTIFACTS=""
add_artifact() {
  name="$1"
  path="$2"
  bytes="$(wc -c < "$path" | tr -d ' ')"
  sum="$(sha256sum "$path" | cut -d' ' -f1)"
  if [ -z "$ARTIFACTS" ]; then
    ARTIFACTS="{\"name\":\"$name\",\"bytes\":$bytes,\"sha256\":\"$sum\"}"
  else
    ARTIFACTS="$ARTIFACTS,{\"name\":\"$name\",\"bytes\":$bytes,\"sha256\":\"$sum\"}"
  fi
  log info backup.artifact "\"name\":\"$name\",\"bytes\":$bytes"
}

add_artifact "$STEM.dump" "$DUMP_PATH"

if [ "$SKIP_VAULT" -eq 0 ] && [ -d "$VAULT_DIR" ]; then
  tar -czf "$VAULT_PATH" -C "$VAULT_DIR" . 2>/dev/null || die backup.vault_failed "\"path\":\"$VAULT_PATH\""
  add_artifact "$STEM-vault.tar.gz" "$VAULT_PATH"
fi

cat > "$MANIFEST_PATH" <<EOF
{
  "version": 1,
  "stem": "$STEM",
  "createdAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "database": "$DB_NAME",
  "serverVersion": "$SERVER_VERSION",
  "clientVersion": "$CLIENT_VERSION",
  "tables": ${TABLES:-0},
  "retentionDays": $RETENTION_DAYS,
  "artifacts": [$ARTIFACTS]
}
EOF

log info backup.manifest "\"path\":\"$(basename "$MANIFEST_PATH")\",\"tables\":${TABLES:-0}"

PRUNED="$(find "$BACKUP_DIR" -maxdepth 1 -name 'hcos-*' -type f -mtime +"$RETENTION_DAYS" -print -delete | wc -l | tr -d ' ')"
log info backup.retention "\"pruned\":${PRUNED:-0},\"retentionDays\":$RETENTION_DAYS"
log info backup.completed "\"stem\":\"$STEM\""