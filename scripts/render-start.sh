#!/usr/bin/env bash
set -euo pipefail

# Migrate on startup (Render free tier has no preDeployCommand).
pnpm exec vp run db#migrate-deploy

exec node apps/graphql/.output/server/index.mjs
