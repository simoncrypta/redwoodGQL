#!/usr/bin/env bash
set -euo pipefail

# Prisma CLI lives in the db workspace package.
pnpm --filter db exec prisma generate
PRISMA_DATABASE_URL="${DATABASE_URL:?DATABASE_URL is required}" pnpm --filter db exec prisma migrate deploy

exec node apps/graphql/.output/server/index.mjs
