# RedwoodGQL

A proof of concept to carry forward the legacy of **RedwoodJS GraphQL Bighorn Epoch** — now **RedwoodGQL**.

RedwoodGQL is a [Vite+](https://viteplus.dev/guide/) monorepo that pairs **RedwoodSDK** on the React front-end with an
**Apollo Client** and a **GraphQL Yoga** server on **Fastify**. The goal is a set of reusable packages that bring back
what people loved about Redwood — Cells, pluggable auth, a preconfigured GraphQL server, Prisma ORM — without the
baggage that slowed RedwoodJS GraphQL down.

RedwoodGQL is not a framework. It is a **"framework"** — the same stance RedwoodSDK takes.

RedwoodSDK resisted calling itself a framework for a long time. It was described as a toolkit, or more precisely an SDK,
because most of the heavy lifting should come from the browser and the network, not a JavaScript runtime pretending to
be the platform.

RedwoodSDK embraces web-native primitives, minimizes abstraction, and gives you full control over the code you write. It
is idiomatic to JavaScript and aligned with the platform.

Over time, the term "framework" was adopted for clarity and discoverability. At its core, RedwoodGQL inherits the same
idea: a lightweight, composable set of tools that stays out of your way.

## Quick Start

Install `vp` (only if you do not already have it):

```bash
curl -fsSL https://vite.plus | bash
```

Then:

```bash
git clone https://github.com/simoncrypta/redwoodGQL.git && cd redwoodGQL && ./quickstart.sh
```

Requires macOS/Linux. Validates Node.js (>= 22.18.0), installs dependencies, and starts dev. See
[Getting Started](#getting-started) for details.

## What RedwoodGQL Brings Back

- **Cells** — declarative data-fetching components built on Apollo Client (`@rwgql/cell`)
- **Pluggable auth** — directive-based auth on the GraphQL server (`requireAuth`, `skipAuth`)
- **Preconfigured GraphQL server** — Yoga on Fastify with SDL, resolvers, and directives
- **Prisma ORM** — PostgreSQL data layer with a clear migration story
- **Monorepo ergonomics** — shared packages, one toolchain, parallel dev servers

## What RedwoodGQL Leaves Behind

Classic RedwoodJS GraphQL carried constraints that blocked progress. RedwoodGQL removes them by design:

| Removed                       | Replaced with                        |
| ----------------------------- | ------------------------------------ |
| CommonJS module graph         | ESM everywhere (`"type": "module"`)  |
| Obscure Babel transforms      | Standard TypeScript + Vite/Rolldown  |
| Slow, opaque type generation  | Explicit types and direct imports    |
| Limited re-export of packages | First-class Apollo, Yoga, Prisma use |

## Design Principles

These principles come from RedwoodSDK and drive every architectural decision in RedwoodGQL.

### 1. Zero Magic

No hidden behavior. No transpilation side effects. No special treatment of file names or exports. Only explicit import
and export statements. Everything respects JavaScript's core contracts. If the runtime relies on convention instead of
clarity, it breaks the language contract. What you write is what runs.

### 2. Composability Over Configuration

Primitives, not policy. Build from functions, modules, and types. No opinionated wrappers or rigid folder structures.
Prioritize developer intent and application code. Encourage co-location of logic, UI, and infrastructure. You are in
control.

### 3. Web-First Architecture

Built for the web as it exists today. Uses native Web APIs. No abstraction over `fetch`, `Request`, `Response`, or
`URL`. If the platform already gives you a tool, we do not wrap it — we help you use it directly and idiomatically.

### Why This Matters

Stay close to the platform. Minimize abstraction, reduce complexity, remove hidden behavior, and make code easier to
understand and maintain. RedwoodGQL is not just about writing software — it is about understanding the software you are
writing.

## Architecture

```text
redwoodGQL/
├── apps/
│   ├── web/          # RedwoodSDK React app with Apollo Client
│   ├── graphql/      # GraphQL Yoga server on Fastify (Nitro)
│   ├── db/           # Prisma schema, migrations, and database layer
│   ├── domain/       # Business logic (planned; services live in graphql/ today)
│   └── jobs/         # Background workers and queues (planned)
├── packages/
│   ├── auth/         # @rwgql/auth — pluggable auth abstraction
│   ├── dbauth/       # @rwgql/dbauth — self-hosted dbAuth provider
│   ├── cell/         # @rwgql/cell — Redwood-style Cells for Apollo
│   ├── rwsdk-apollo-client/ # Apollo integration for RedwoodSDK
│   ├── pgserve-dev/  # @rwgql/pgserve-dev — local Postgres dev workflow
│   ├── prisma-dev/   # @rwgql/prisma-dev — Prisma migrate/generate tasks
│   ├── task-core/    # @rwgql/task-core — parallel dev orchestration
│   ├── log-formatter/# @rwgql/log-formatter — GraphQL operation logging
│   └── utils/        # @rwgql/utils — shared utilities (stub)
└── test-project/     # Legacy RedwoodJS reference app for comparison
```

The data flow follows a familiar Redwood shape, rebuilt on modern primitives:

```text
Browser (RedwoodSDK + Apollo Client)
        │
        ▼ GraphQL over HTTP
GraphQL Yoga / Fastify
        │
        ▼
Domain services
        │
        ▼
Prisma → PostgreSQL
```

Services and resolvers currently live under `apps/graphql`; `apps/domain` is reserved for a
future extraction layer.

## Packages

| Package                      | Description                                             |
| ---------------------------- | ------------------------------------------------------- |
| `@rwgql/auth`                | Pluggable auth — Yoga plugins, `requireAuth`/`skipAuth` |
| `@rwgql/dbauth`              | Self-hosted dbAuth for Fastify/Yoga and RWSDK web       |
| `@rwgql/cell`                | `createCell` — query components with Loading/Empty/etc. |
| `@rwgql/rwsdk-apollo-client` | Apollo Client provider for RedwoodSDK                   |
| `@rwgql/pgserve-dev`         | Local Postgres via pgserve — start, env sync, teardown  |
| `@rwgql/prisma-dev`          | Prisma dev tasks — migrate, generate, env wiring        |
| `@rwgql/task-core`           | Vite+ task helpers — parallel dev server orchestration  |
| `@rwgql/log-formatter`       | Vite-style per-operation GraphQL logging                |

## Getting Started

**Prerequisites:** [Vite+](https://viteplus.dev/guide/) (`vp`). Vite+ manages Node.js (>= 22.18.0) and pnpm for this
repo — you do not need to install Node or pnpm separately.

`./quickstart.sh` runs, in order: install `vp` (if missing) → `vp env doctor` → `vp install` → `vp run dev`.

### Already have the repo?

From the repo root after clone or pull:

```bash
vp env doctor && vp install && vp run dev
```

First time with Vite+? Install `vp` once with `curl -fsSL https://vite.plus | bash`, then open a new shell. See the
[Vite+ install guide](https://viteplus.dev/guide/) for Windows and troubleshooting.

### What `vp run dev` does

`vp run dev` bootstraps workspace packages, starts Postgres, migrates, seeds, and runs the web app and GraphQL server in
parallel:

- Web — [http://localhost:8910](http://localhost:8910)
- GraphQL — [http://localhost:8911/graphql](http://localhost:8911/graphql)
- Auth — [http://localhost:8911/auth](http://localhost:8911/auth)

**Demo login** (password for both is `password`): `ada@example.com` (ADMIN), `grace@example.com` (USER). No extra
environment variables are required for local development.

See [Vite+](https://viteplus.dev/guide/) for Windows install, troubleshooting, and other `vp` commands.

## Development

Run `vp help` for the full command list.

Verify the monorepo is ready (format, lint, type-check, test, build):

```bash
vp run ready
```

Other useful commands:

```bash
# Run tests across packages
vp run -r test

# Build the monorepo
vp run -r build

# Format, lint, and type-check
vp check
```

## Status

RedwoodGQL is an early proof of concept. The demo app runs end-to-end locally; APIs and layout
may still change.

### Working today

- **Dev workflow** — `vp run dev` starts Postgres (pgserve), migrates, seeds, and runs web +
  GraphQL in parallel
- **Web app** — RedwoodSDK + Apollo Client; scaffold pages (Posts, Contacts, Blog) using Cells
  and typed GraphQL codegen
- **GraphQL API** — Yoga on Fastify with SDL, resolvers, Prisma services, and auth directives
- **Auth** — `@rwgql/dbauth` (login, signup, logout, forgot/reset password), session cookies,
  web route guards, and `requireAuth`/`skipAuth` on the schema
- **Data layer** — Prisma schema, migrations, and seed data in `apps/db`
- **Tooling packages** — `@rwgql/pgserve-dev`, `@rwgql/prisma-dev`, `@rwgql/task-core`,
  `@rwgql/log-formatter`

### Parity vs `test-project/`

Compared to the classic RedwoodJS GraphQL scaffold in `test-project/`, remaining work is tracked on GitHub:

- [Parity roadmap (Project)](https://github.com/users/simoncrypta/projects/3)
- [Parity issues](https://github.com/simoncrypta/redwoodGQL/issues?q=is%3Aissue+is%3Aopen+label%3Aparity)
- [Roadmap milestones](https://github.com/simoncrypta/redwoodGQL/milestones) — High, Medium, and Lower priority / by design

## Further Reading

- [RedwoodSDK Documentation](https://docs.rwsdk.com/)
- [Vite+ Documentation](https://viteplus.dev/guide/)
- [GraphQL Yoga](https://the-guild.dev/graphql/yoga-server)
- [Apollo Client](https://www.apollographql.com/docs/react/)
- [RedwoodJS (Cedar) Documentation](https://cedarjs.com/docs/8.x/introduction)
