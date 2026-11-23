#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# Sinkronkan folder proyek → repo rilis publik, lalu commit + push.
#
# Kenapa repo terpisah: folder proyek ini berada di dalam repo "payung"
# (root git-nya C:/laragon/www, berisi banyak proyek lain). Repo rilis hanya
# boleh memuat isi Haswakarya, tanpa histori proyek lain.
#
# Pakai:
#   scripts/sync-publish.sh                       # commit + push
#   scripts/sync-publish.sh "feat: ..."           # pesan commit khusus
#   scripts/sync-publish.sh --no-push             # siapkan commit lokal saja
#   PUBLISH_DIR=/path/lain scripts/sync-publish.sh
#
# Isi yang disalin = state TER-COMMIT (git archive), bukan working tree.
# Jadi commit dulu di repo payung; file yang di-.gitignore (.env, node_modules)
# tidak mungkin ikut karena tidak pernah masuk commit.
# ═══════════════════════════════════════════════════════════════════════════
set -euo pipefail

SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST_DIR="${PUBLISH_DIR:-$(cd "$SRC_DIR/.." && pwd)/Haswakarya-gh}"
EXPECTED_SLUG="kevinadisuryanugraha/Haswakarya"

PUSH=1
MSG=""
for arg in "$@"; do
  case "$arg" in
    --no-push) PUSH=0 ;;
    -*) echo "[sync] opsi tidak dikenal: $arg" >&2; exit 2 ;;
    *) MSG="$arg" ;;
  esac
done
MSG="${MSG:-chore: sinkron rilis $(date +%Y-%m-%dT%H:%M)}"

die() { echo "[sync] GAGAL: $*" >&2; exit 1; }

# ─── 1. Validasi sumber ────────────────────────────────────────────────────
cd "$SRC_DIR"
GIT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || die "folder proyek bukan bagian dari repo git"
# rev-parse --show-prefix memberi path relatif terhadap root git (aman di MSYS)
SRC_REL="$(git rev-parse --show-prefix)"; SRC_REL="${SRC_REL%/}"
[[ -n "$SRC_REL" ]] || die "folder proyek tidak bisa dipetakan ke root git"

if [[ -n "$(git -C "$GIT_ROOT" status --porcelain -- "$SRC_REL")" ]]; then
  echo "[sync] Perubahan belum di-commit di '$SRC_REL':"
  git -C "$GIT_ROOT" status --short -- "$SRC_REL" | sed 's/^/    /'
  die "commit dulu supaya rilis identik dengan state repo"
fi

# ─── 2. Validasi tujuan ────────────────────────────────────────────────────
[[ -d "$DEST_DIR" ]] || die "folder rilis tidak ada: $DEST_DIR (buat: git init -b main \"$DEST_DIR\")"
git -C "$DEST_DIR" rev-parse --show-toplevel >/dev/null 2>&1 || die "$DEST_DIR belum repo git"
DEST_REMOTE="$(git -C "$DEST_DIR" remote get-url origin 2>/dev/null || true)"
[[ "$DEST_REMOTE" == *"$EXPECTED_SLUG"* ]] || die "remote origin $DEST_DIR bukan $EXPECTED_SLUG (dapat: '${DEST_REMOTE:-kosong}')"

TMP_ARCHIVE="$(mktemp "${TMPDIR:-/tmp}/haswa-publish.XXXXXX.tar")"
trap 'rm -f "$TMP_ARCHIVE"' EXIT

# ─── 3. Ambil isi ter-commit, ganti seluruh worktree rilis ─────────────────
git -C "$GIT_ROOT" archive --format=tar -o "$TMP_ARCHIVE" "HEAD:$SRC_REL"
git -C "$DEST_DIR" rm -rqf . 2>/dev/null || true
find "$DEST_DIR" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
tar -xf "$TMP_ARCHIVE" -C "$DEST_DIR"

# ─── 4. Pagar rahasia ──────────────────────────────────────────────────────
LEAKS="$(cd "$DEST_DIR" && { grep -rIl -e 'BEGIN RSA PRIVATE KEY' -e 'BEGIN OPENSSH PRIVATE KEY' \
  -e 'gho_[A-Za-z0-9]\{20,\}' -e 'AKIA[0-9A-Z]\{16\}' -e 'sk-[A-Za-z0-9]\{20,\}' . 2>/dev/null || true; } \
  | grep -v '^\./scripts/sync-publish\.sh$' || true)"
[[ -z "$LEAKS" ]] || die "pola rahasia terdeteksi, rilis dibatalkan:
$LEAKS"
[[ -f "$DEST_DIR/.env" ]] && die ".env ikut tersalin, rilis dibatalkan"

# ─── 5. Commit + push ──────────────────────────────────────────────────────
cd "$DEST_DIR"
git add -A
if git diff --cached --quiet; then
  echo "[sync] Tidak ada perubahan isi; rilis sudah sinkron."
else
  git commit -q -m "$MSG"
  echo "[sync] Commit rilis: $(git log --oneline -1)"
  echo "[sync] File ter-track: $(git ls-files | wc -l)"
fi

if (( PUSH )); then
  git push origin main
  echo "[sync] Push selesai → https://github.com/$EXPECTED_SLUG"
else
  echo "[sync] --no-push: commit lokal disiapkan, belum dikirim."
fi