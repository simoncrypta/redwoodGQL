Workspace scripts run via `tsx` and are wired into the root `vite.config.ts` task graph.

- `dev.ts` — spawns `rwsdk#dev`, `graphql#dev`, and `graphql#codegen:watch` in parallel (`dev`)
- `dev-prepare.ts` — frees dev app ports and starts/reuses pgserve (`dev:prepare`)
- `ensure-pgserve.ts` — `db#prepare` task entrypoint
- `pgserve-start.ts` — long-running `db#pgserve` task entrypoint
- `seed.ts` — database seed data (`seed`)
