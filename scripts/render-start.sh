#!/usr/bin/env bash
set -euo pipefail

# pgserve setup-env during build can write localhost URLs to apps/db/.env; never use at runtime.
rm -f apps/db/.env apps/db/connection.env

export NODE_ENV=production
export PRISMA_DATABASE_URL="${DATABASE_URL:?DATABASE_URL is required}"
export DATABASE_URL="${PRISMA_DATABASE_URL}"

pnpm --filter db exec prisma generate
pnpm --filter db exec prisma migrate deploy

# PoC: reset demo data on each deploy/start (no Render shell needed). Remove FORCE_DEMO_SEED for production.
export FORCE_DEMO_SEED=1
pnpm exec tsx apps/scripts/seed.ts

rm -f apps/db/.env apps/db/connection.env

exec env NODE_ENV=production PRISMA_DATABASE_URL="$DATABASE_URL" DATABASE_URL="$DATABASE_URL" \
  node apps/graphql/.output/server/index.mjs
