#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root_dir"

wait_for_port_free() {
  local port=$1
  local deadline=$((SECONDS + 15))

  while [ "$SECONDS" -lt "$deadline" ]; do
    if ! ss -tln 2>/dev/null | grep -q ":${port} "; then
      return 0
    fi
    sleep 0.25
  done

  echo "Port ${port} still in use after ${deadline}s; forcing cleanup" >&2
  fuser -k "${port}/tcp" 2>/dev/null || true
  sleep 1
}

stop_postgres() {
  fuser -k 8432/tcp 2>/dev/null || true
  pkill -9 -f "pgserve postmaster --port 8432" 2>/dev/null || true
  pkill -9 -f "postgres.*apps/db/.pgserve" 2>/dev/null || true
}

for port in 8910 8911 8912 8913; do
  fuser -k "${port}/tcp" 2>/dev/null || true
done

stop_postgres
sleep 1
wait_for_port_free 8432
rm -rf apps/db/.pgserve

bash scripts/setup-db-env.sh

vp run db#pgserve &
pgserve_pid=$!

cleanup() {
  kill "$pgserve_pid" 2>/dev/null || true
  stop_postgres
}

trap cleanup EXIT INT TERM

node --experimental-strip-types scripts/wait-for-pg.ts

vp run rwgql#seed

vp run graphql#codegen

vp run rwsdk#dev &
rwsdk_pid=$!

vp run graphql#dev &
graphql_pid=$!

vp run graphql#codegen:watch &
codegen_pid=$!

wait "$rwsdk_pid" "$graphql_pid" "$codegen_pid"
