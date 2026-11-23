#!/bin/sh
# ═══════════════════════════════════════════════════════════════════════════
# libpq_url <url> — bersihkan URL database sebelum diserahkan ke libpq.
#
# Prisma memakai parameter kueri khasnya sendiri (`?schema=public`), sedangkan
# psql/pg_dump/pg_restore menolak parameter yang tidak dikenal:
#   pg_dump: error: invalid URI query parameter: "schema"
# Helper ini menyisakan hanya parameter yang benar-benar dipahami libpq
# (mis. `sslmode` untuk Postgres terkelola) dan membuang sisanya.
#
# Hanya mengeluarkan URL hasil; tidak menulis log.
# ═══════════════════════════════════════════════════════════════════════════

libpq_url() {
  _url="$1"
  case "$_url" in
    *\?*) ;;
    *) printf '%s' "$_url"; return 0 ;;
  esac

  _base="${_url%%\?*}"
  _query="${_url#*\?}"
  _kept=""
  _old_ifs="$IFS"
  IFS='&'
  for _pair in $_query; do
    _key="${_pair%%=*}"
    case "$_key" in
      sslmode|sslrootcert|sslcert|sslkey|sslcrl|sslcrldir|sslcompression|sslsni|requiressl|\
      connect_timeout|application_name|fallback_application_name|options|target_session_attrs|\
      keepalives|keepalives_idle|keepalives_interval|keepalives_count|\
      tcp_user_timeout|gssencmode|channel_binding|passfile|service)
        if [ -z "$_kept" ]; then _kept="$_pair"; else _kept="$_kept&$_pair"; fi
        ;;
    esac
  done
  IFS="$_old_ifs"

  if [ -n "$_kept" ]; then
    printf '%s?%s' "$_base" "$_kept"
  else
    printf '%s' "$_base"
  fi
}