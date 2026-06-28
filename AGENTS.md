You can find doc for @redwoodjs/ packages online at https://cedarjs.com/docs/8.x/introduction You can find doc for
RedwoodSDK (@rwsdk/ packages) online at https://docs.rwsdk.com/

## RedwoodGQL Direction

RedwoodGQL is an early proof of concept for a new RedwoodJS GraphQL path that can migrate block by block from the
classic RedwoodJS app in `test-project/`.

- Use `README.md` as the source of truth for product direction, architecture, package intent, and parity goals.
- Treat `apps/` as demo / PoC applications that prove the packages working together end-to-end.
- Treat `packages/` as the WIP "framework" / SDK surface. Each package should keep dependencies minimal, expose focused
  primitives, and work in isolation when its direct peer requirements are present.
- Prefer package boundaries that let users adopt one block at a time. For example, `@rwgql/cell` should work with
  Apollo Client, `@rwgql/rwsdk-apollo-client` should require only RedwoodSDK plus Apollo GraphQL pieces,
  `@rwgql/pgserve-dev` should work anywhere Vite Task is available, and `@rwgql/prisma-dev` should require Vite Task
  plus Prisma.
- Keep `test-project/` as the legacy RedwoodJS reference app and migration target tracker; do not refactor it as part of
  normal package or demo-app work unless the task is explicitly about parity comparison.

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Quick Start

See `README.md` for the full onboarding flow. From the repo root:

```bash
vp env doctor && vp install && vp run dev
```

New clone (install `vp` first with `curl -fsSL https://vite.plus | bash` if needed):
`git clone https://github.com/simoncrypta/redwoodGQL.git && cd redwoodGQL && ./quickstart.sh`

Other common commands: `vp check`, `vp test`, `vp run ready`.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Use Vite+ best practices for all tooling. Add automation as Vite Task tasks in `vite.config.ts` / package
      `vite.config.ts`, then run it through `vp run ...`; do not add `.sh` scripts for project tooling (except
      `quickstart.sh` for onboarding).
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via
      `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking
      for help.

<!--VITE PLUS END-->
