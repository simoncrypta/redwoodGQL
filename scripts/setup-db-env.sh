#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
connection_env="$root_dir/apps/db/.pgserve/connection.env"
env_file="$root_dir/apps/db/.env"

if [ -f "$connection_env" ]; then
  # pgserve is already running; apps/db/.env is maintained by ensure-pgserve.
  exit 0
fi

socket_dir="${XDG_RUNTIME_DIR:-/run/user/$(id -u)}/pgserve"

# DATABASE_URL must stay free of Prisma-only query params (?host=, ?socket=).
# pgserve reads it for its admin pool and treats query params as PostgreSQL GUCs.
cat > "$env_file" <<EOF
DATABASE_URL="postgresql://postgres@localhost:8432/redwoodgql"
PRISMA_DATABASE_URL="postgresql://postgres@localhost:8432/redwoodgql?host=${socket_dir}&socket=${socket_dir}"
PRISMA_HIDE_UPDATE_MESSAGE=true
EOF
