# Production deployment

RedwoodGQL production uses **Cloudflare Workers** for the web app and **Render** for the GraphQL API and PostgreSQL database.

```text
Browser → Cloudflare Worker (apps/web)
              ↓ VITE_GRAPHQL_URL / VITE_AUTH_URL
         Render web service (apps/graphql)
              ↓ internal DATABASE_URL
         Render Managed PostgreSQL
```

Local development is unchanged: `vp run dev` uses pgserve and does not touch production infrastructure.

## Prerequisites

- [Vite+](https://viteplus.dev/guide/) (`vp`) for builds
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) for the web Worker
- GitHub repo pushed (Render deploys from Git)
- Cloudflare account with Workers enabled
- Render account (personal workspace recommended for this PoC)

## 1. Render MCP (optional, for agent-driven ops)

1. Create an API key in [Render Account Settings → API Keys](https://dashboard.render.com/u/*/settings#api-keys)
   on your **personal** account.
2. Set the bearer token in `~/.cursor/mcp.json` under the `Render` server `Authorization` header.
3. Restart Cursor.
4. Ask the agent to run `list_workspaces()` and `select_workspace(ownerID)` for **Simon Gagnon's Workspace**
   (`tea-csptbf0gph6c73b7b12g`).

**PoC resources (Simon Gagnon's Workspace):**

| Resource            | URL / ID                                                               |
| ------------------- | ---------------------------------------------------------------------- |
| Postgres `rwgql-db` | [Dashboard](https://dashboard.render.com/d/dpg-d92sm04vikkc73b2tkag-a) |
| API `rwgql-api`     | <https://rwgql-api.onrender.com>                                       |
| Web Worker          | <https://rwgql-rwsdk.hello-091.workers.dev>                            |

Without a valid API key, use the Render Dashboard and [`render.yaml`](../render.yaml) Blueprint instead.

## 2. Render: database + API

### Apply the Blueprint

1. Push this repo to GitHub.
2. In Render: **New → Blueprint** → connect the repo.
3. Render provisions `rwgql-db` (Postgres) and `rwgql-api` (web service) from [`render.yaml`](../render.yaml).

### Set required env vars (Dashboard)

After the Blueprint is created, set these on the **rwgql-api** service (they are `sync: false` in the Blueprint):

| Variable                | Example                   | Purpose                                          |
| ----------------------- | ------------------------- | ------------------------------------------------ |
| `WEB_ORIGIN`            | `https://app.example.com` | CORS allowlist for the Cloudflare web app        |
| `DB_AUTH_COOKIE_DOMAIN` | `.example.com`            | Shared session cookie across `app.*` and `api.*` |

`DATABASE_URL` is wired automatically from the linked Postgres instance (internal URL).

`DB_AUTH_SECRET` is auto-generated on first Blueprint apply. Copy it from the Render service env tab — you need
the same value on Cloudflare.

### Migrations and seed

`scripts/render-start.sh` runs `pnpm --filter db exec prisma generate` and `migrate deploy` on each API start. The build
uses `scripts/render-build.sh` (`vp run bootstrap`, Prisma generate, `graphql#build`) and Nitro inlines `@rwgql/*` and
`db` so the server output does not depend on `node_modules` dist paths at runtime.

Optional one-time seed (Render shell — `DATABASE_URL` is already set; use the external URL only when seeding from your laptop):

```bash
rm -f apps/db/.env apps/db/connection.env
pnpm --filter db exec prisma generate
pnpm exec tsx apps/scripts/seed.ts
```

From your machine with the external connection string from the `rwgql-db` dashboard:

```bash
DATABASE_URL="postgresql://..." pnpm --filter db exec prisma generate
DATABASE_URL="postgresql://..." pnpm exec tsx apps/scripts/seed.ts
```

### Custom domain (API)

1. Render service → **Settings → Custom Domains** → add `api.example.com`.
2. In Cloudflare DNS, CNAME `api` → Render’s hostname.

Note the public API URL for the web build step below.

## 3. Cloudflare: web Worker

### Build-time variables

Set when building (baked into the Worker bundle):

| Variable           | Example                           |
| ------------------ | --------------------------------- |
| `VITE_GRAPHQL_URL` | `https://api.example.com/graphql` |
| `VITE_AUTH_URL`    | `https://api.example.com/auth`    |

### Runtime secret

Must match Render’s `DB_AUTH_SECRET`:

```bash
cd apps/web
wrangler secret put DB_AUTH_SECRET
```

### Build and deploy

```bash
cd apps/web
VITE_GRAPHQL_URL=https://api.example.com/graphql \
VITE_AUTH_URL=https://api.example.com/auth \
vp run release
```

**PoC Worker URL:** `https://rwgql-rwsdk.hello-091.workers.dev` — rebuild with your real `api.*` URLs before go-live.

Copy `DB_AUTH_SECRET` from [`.deploy-secrets.local`](../.deploy-secrets.local) (gitignored) to Render after the
Blueprint applies. The Worker already has this secret via `wrangler secret put`.

Or step by step:

```bash
vp run clean && vp run build && wrangler deploy
```

### Custom domain (web)

Attach `app.example.com` to the Worker in the Cloudflare dashboard or via wrangler routes.

## Environment matrix

| Variable                  | Web (CF)       | API (Render) | When                                          |
| ------------------------- | -------------- | ------------ | --------------------------------------------- |
| `VITE_GRAPHQL_URL`        | build          | —            | Worker build                                  |
| `VITE_AUTH_URL`           | build          | —            | Worker build                                  |
| `DB_AUTH_SECRET`          | runtime secret | env          | Must match                                    |
| `WEB_ORIGIN`              | —              | env          | CORS                                          |
| `DB_AUTH_COOKIE_DOMAIN`   | —              | env          | e.g. `.example.com`                           |
| `DB_AUTH_COOKIE_SAMESITE` | —              | env          | `Lax` (default) or `None` if truly cross-site |
| `DATABASE_URL`            | —              | from DB link | Prisma + migrations                           |
| `NODE_ENV`                | —              | `production` | API                                           |

Local dev uses pgserve URLs in `apps/db/.env` (generated); do not point local dev at production unless intentional.

## Security notes

- **Forgot password:** production returns a generic message without sending email until a provider is configured.
  Reset tokens are only logged in non-production.
- **Signup:** enabled by default; restrict in production via product policy or future env flag if needed.
- **Cookies:** set `DB_AUTH_COOKIE_DOMAIN` when web and API are on sibling subdomains so Worker SSR can read the session.
- Never commit secrets. Use Render env vars and `wrangler secret put`.

## Smoke test checklist

After both services are live:

1. `GET https://api.example.com/graphql/health` → 2xx
2. Public GraphQL `posts` query (no auth)
3. Login at web app with a seeded user (if seeded)
4. Authenticated `contacts` query when logged in
5. SSR route guard: protected page redirects or shows auth state without client-only flicker

## Troubleshooting

| Symptom                                    | Check                                                                                                          |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| CORS errors                                | `WEB_ORIGIN` matches exact web URL (scheme + host, no trailing slash)                                          |
| SSR always logged out                      | `DB_AUTH_COOKIE_DOMAIN`, `DB_AUTH_SECRET` match on both sides                                                  |
| Prisma engine error on Render              | `binaryTargets` includes `debian-openssl-3.0.x` in schema                                                      |
| Build fails on Render                      | Node ≥ 22, `bash scripts/render-build.sh` logs, workspace `packages/*/dist` present                            |
| Empty posts but seed says "already seeded" | API was using `apps/db/.env` from build (localhost pgserve); redeploy after fix; seed targets `rwgql-db`       |
| `getToken` 401 on `/auth`                  | Normal when logged out; cross-origin cookies need `DB_AUTH_COOKIE_SAMESITE=None` + custom domains for SSR auth |
| MCP unauthorized                           | Personal Render API key in `~/.cursor/mcp.json`, restart Cursor                                                |
