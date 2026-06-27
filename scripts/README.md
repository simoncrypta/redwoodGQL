# Workspace scripts

Project-specific scripts live here. Shared dev tooling lives in packages:

- [`@rwgql/task-core`](../packages/task-core) — CLI parsing, port utilities, parallel process orchestration, and Vite
  task helpers
- [`@rwgql/pgserve-dev`](../packages/pgserve-dev) — PostgreSQL/pgserve lifecycle and related Vite tasks (ORM-agnostic)
- [`@rwgql/prisma-dev`](../packages/prisma-dev) — Prisma env loading and Vite tasks (`generate`, `migrate-deploy`)

Pgserve configuration for this app is in [`apps/db/pgserve.config.ts`](../apps/db/pgserve.config.ts). CLI entrypoints
load that module via an absolute `--config` path derived from the workspace root; pgserve defaults come from
`defineDbDevConfig()` in `@rwgql/pgserve-dev`, with the Prisma env adapter from `createPrismaEnvAdapter()` in
`@rwgql/prisma-dev`.

## Local scripts

- `seed.ts` — database seed data (`vp run seed`)

## Vite tasks

Root [`vite.config.ts`](../vite.config.ts) orchestrates workspace flows:

- `dev` — depends on `db#dev:prepare`, `seed`, and `graphql#codegen`; spawns `rwsdk#dev`, `graphql#dev`, and
  `graphql#codegen:watch` in parallel; on Ctrl+C runs `db#dev:stop` to shut down detached pgserve
- `seed` — runs `scripts/seed.ts`; depends on `db#migrate-deploy`

[`apps/db/vite.config.ts`](../apps/db/vite.config.ts) owns the db task graph via `createPgserveTasks()` and
`createPrismaTasks()`:

- `setup-env`, `pgserve`, `prepare`, `dev:prepare`, `dev:stop`
- `generate`, `migrate-deploy`

Cross-package ordering uses Vite+ `package#task` notation in `dependsOn` (e.g. `db#migrate-deploy`).

Generated files (gitignored): `apps/db/.pgserve/connection.env`, `apps/db/.env`.
