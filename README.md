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
│   ├── domain/       # Business logic shared across delivery mechanisms
│   └── jobs/         # Background workers and queues
├── packages/
│   ├── auth/         # @rwgql/auth — pluggable auth abstraction
│   ├── dbauth/       # @rwgql/dbauth — self-hosted dbAuth provider
│   ├── cell/         # @rwgql/cell — Redwood-style Cells for Apollo
│   ├── rwsdk-apollo-client/ # Apollo integration for RedwoodSDK
│   └── utils/        # Shared utilities
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

## Packages

| Package                      | Description                                             |
| ---------------------------- | ------------------------------------------------------- |
| `@rwgql/auth`                | Pluggable auth — Yoga plugins                           |
| `@rwgql/dbauth`              | Self-hosted dbAuth for Fastify/Yoga and RWSDK           |
| `@rwgql/cell`                | `createCell` — query components with Loading/Empty/etc. |
| `@rwgql/rwsdk-apollo-client` | Apollo Client provider for RedwoodSDK                   |

## Getting Started

**Prerequisites:** Node.js >= 22.18.0

This project uses [Vite+](https://viteplus.dev/guide/) (`vp`) as its unified toolchain — it manages the runtime, package
manager, and frontend tooling in one place.

### 1. Install `vp`

macOS / Linux:

```bash
curl -fsSL https://vite.plus | bash
```

Windows (PowerShell):

```powershell
irm https://vite.plus/ps1 | iex
```

Open a new shell and verify:

```bash
vp help
```

### 2. Install dependencies

From the repo root:

```bash
vp install
```

### 3. Start the dev server

Install [pgserve/autopg](https://github.com/automagik-dev/autopg) for local PostgreSQL, or rely on the `pgserve` npm
package (installed automatically via `vp install`).

```bash
vp install
vp run dev
```

This starts pgserve, applies migrations, seeds the database, and runs the web app and GraphQL server in parallel. The
web app runs on [http://localhost:8910](http://localhost:8910); GraphQL Yoga runs on
[http://localhost:8911/graphql](http://localhost:8911/graphql).

### Demo login

After seeding, you can log in with these accounts (password for both is `password`):

| Email               | Role  |
| ------------------- | ----- |
| `ada@example.com`   | ADMIN |
| `grace@example.com` | USER  |

Auth runs on the GraphQL server at [http://localhost:8911/auth](http://localhost:8911/auth) using `@rwgql/dbauth`. No
extra environment variables are required for local development.

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

RedwoodGQL is an early proof of concept. Packages and apps are under active development. APIs and folder structure may
change.

## Further Reading

- [RedwoodSDK Documentation](https://docs.rwsdk.com/)
- [Vite+ Documentation](https://viteplus.dev/guide/)
- [GraphQL Yoga](https://the-guild.dev/graphql/yoga-server)
- [Apollo Client](https://www.apollographql.com/docs/react/)
- [RedwoodJS (Cedar) Documentation](https://cedarjs.com/docs/8.x/introduction)
