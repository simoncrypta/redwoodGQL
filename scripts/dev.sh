#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root_dir"

fuser -k 8432/tcp 2>/dev/null || true
for port in 8910 8911 8912 8913; do
  fuser -k "${port}/tcp" 2>/dev/null || true
done
pkill -9 -f "pgserve postmaster --port 8432" 2>/dev/null || true
pkill -9 -f "postgres.*apps/db/.pgserve" 2>/dev/null || true
rm -rf apps/db/.pgserve

vp run db#pgserve &
pgserve_pid=$!

cleanup() {
  kill "$pgserve_pid" 2>/dev/null || true
  fuser -k 8432/tcp 2>/dev/null || true
  pkill -9 -f "pgserve postmaster --port 8432" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

sleep 3

vp run rwgql#seed

vp run rwsdk#dev &
rwsdk_pid=$!

vp run graphql#dev &
graphql_pid=$!

wait "$rwsdk_pid" "$graphql_pid"
