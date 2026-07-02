#!/usr/bin/env bash
set -euo pipefail

# pgserve setup-env during build can write localhost URLs to apps/db/.env; remove before start.
rm -f apps/db/.env apps/db/connection.env

# Prisma CLI lives in the db workspace package.
pnpm --filter db exec prisma generate
export PRISMA_DATABASE_URL="${DATABASE_URL:?DATABASE_URL is required}"
pnpm --filter db exec prisma migrate deploy

exec node apps/graphql/.output/server/index.mjs
