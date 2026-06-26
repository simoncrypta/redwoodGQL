# Workspace scripts

Project-specific scripts live here. Shared dev tooling lives in packages:

- [`@rwgql/task-core`](../packages/task-core) — CLI parsing, port utilities, parallel process orchestration, and Vite task helpers
- [`@rwgql/pgserve-dev`](../packages/pgserve-dev) — PostgreSQL/pgserve lifecycle and related Vite tasks (ORM-agnostic)

Pgserve configuration for this app is in [`apps/db/pgserve.config.ts`](../apps/db/pgserve.config.ts). CLI entrypoints load that module via `--config=apps/db/pgserve.config.ts`; Prisma-specific env generation is built into `@rwgql/pgserve-dev` when `appEnvAdapter: "prisma"` is set.

## Local scripts

- `seed.ts` — database seed data (`vp run seed`)

## Vite tasks

Root [`vite.config.ts`](../vite.config.ts):

- `dev:prepare` — frees dev app ports and starts/reuses pgserve
- `dev` — spawns `rwsdk#dev`, `graphql#dev`, and `graphql#codegen:watch` in parallel
- `seed` — runs `scripts/seed.ts`

[`apps/db/vite.config.ts`](../apps/db/vite.config.ts) uses `createPgserveTasks()` from `@rwgql/pgserve-dev` for `setup-env`, `pgserve`, and `prepare`, plus Prisma-specific `generate` and `migrate-deploy`.

Generated files (gitignored): `apps/db/.pgserve/connection.env`, `apps/db/.env`.
