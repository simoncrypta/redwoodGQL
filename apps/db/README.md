# db

PostgreSQL data layer with Prisma ORM for RedwoodGQL.

## Prerequisites

Install [pgserve/autopg](https://github.com/automagik-dev/autopg) for local PostgreSQL:

```bash
curl -fsSL https://raw.githubusercontent.com/automagik-dev/autopg/main/install.sh | bash
```

## Local development

The dev stack starts pgserve, applies migrations, and seeds data automatically via `vp run dev` from the repo root.

This package owns the db task graph in [`vite.config.ts`](vite.config.ts). Root orchestration depends on these tasks via `db#...` references.

Manual db tasks:

```bash
vp run db#pgserve          # start PostgreSQL on port 8432 (data in .pgserve/)
vp run db#generate         # ensure pgserve + generate Prisma client
vp run db#migrate-deploy   # apply migrations (starts/reuses pgserve via prepare)
vp run db#dev:prepare      # free dev ports and start/reuse pgserve
vp run seed                # seed dev data (root task; depends on db#migrate-deploy)
```

`db#prepare` starts or reuses pgserve, writes `apps/db/.pgserve/connection.env`, and updates `apps/db/.env`. Copy `.env.defaults` to `.env` only when overriding the generated values.

## Schema

Models live in [`src/schema.prisma`](src/schema.prisma) with migrations in [`src/migrations/`](src/migrations/). They mirror [`test-project/api/db/schema.prisma`](../../test-project/api/db/schema.prisma): `UserExample`, `User`, `Post`, `Contact`.

Initial migration:

```bash
vp run db#pgserve
vp run db#generate
cd apps/db && vp exec prisma migrate dev --name init
```
