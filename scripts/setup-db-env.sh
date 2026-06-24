#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
socket_dir="${XDG_RUNTIME_DIR:-/run/user/$(id -u)}/pgserve"

# DATABASE_URL must stay free of Prisma-only query params (?host=, ?socket=).
# pgserve reads it for its admin pool and treats query params as PostgreSQL GUCs.
cat > "$root_dir/apps/db/.env" <<EOF
DATABASE_URL="postgresql://postgres@localhost:8432/redwoodgql"
PRISMA_DATABASE_URL="postgresql://postgres@localhost:8432/redwoodgql?host=${socket_dir}&socket=${socket_dir}"
PRISMA_HIDE_UPDATE_MESSAGE=true
EOF
