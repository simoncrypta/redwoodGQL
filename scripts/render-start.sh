#!/usr/bin/env bash
set -euo pipefail

PRISMA_SCHEMA=apps/db/prisma/schema.prisma

# Generate client and migrate using Render's DATABASE_URL (no local pgserve tasks).
pnpm exec prisma generate --schema "$PRISMA_SCHEMA"
PRISMA_DATABASE_URL="${DATABASE_URL:?DATABASE_URL is required}" pnpm exec prisma migrate deploy --schema "$PRISMA_SCHEMA"

exec node apps/graphql/.output/server/index.mjs
