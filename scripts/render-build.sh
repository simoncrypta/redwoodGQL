#!/usr/bin/env bash
set -euo pipefail

pnpm install
pnpm exec vp run bootstrap
pnpm --filter db exec prisma generate
pnpm exec vp run graphql#build

for file in \
  packages/auth/dist/graphql.mjs \
  packages/dbauth/dist/server.mjs \
  packages/graphql-typegen/dist/index.mjs \
  packages/log-formatter/dist/index.mjs; do
  if [ ! -f "$file" ]; then
    echo "Missing workspace build output: $file" >&2
    exit 1
  fi
done
