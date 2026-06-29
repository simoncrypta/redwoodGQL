import { defineConfig } from "vite-plus";
import { configDefaults } from "vite-plus/test/config";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
    "*.md": "markdownlint-cli2 --fix",
  },
  fmt: {
    ignorePatterns: ["test-project/**"],
  },
  lint: {
    ignorePatterns: ["test-project/**"],
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
    overrides: [
      {
        files: ["scripts/**"],
        env: { node: true },
      },
    ],
  },
  test: {
    exclude: [...configDefaults.exclude, "test-project/**"],
    projects: ["packages/*", "apps/graphql", "apps/web"],
  },
  run: {
    cache: true,
    tasks: {
      bootstrap: {
        // Build workspace packages via Vite+ task runner. Limit concurrency to avoid
        // parallel tsgo spawns racing on the native binary (spawn EBUSY on first clone).
        command: 'vp run --filter "./packages/*" --concurrency-limit 2 build',
      },
      "check:markdown": {
        command: "markdownlint-cli2",
        input: [{ pattern: "**/*.md", base: "workspace" }, ".markdownlint-cli2.jsonc"],
      },
      dev: {
        command: "vp run --parallel --filter rwsdk --filter graphql --filter db dev",
        dependsOn: ["bootstrap", "db#generate", "db#dev:prepare", "seed", "graphql#codegen"],
        cache: false,
      },
      seed: {
        command: "tsx scripts/seed.ts",
        dependsOn: ["db#migrate-deploy"],
        cache: false,
      },
      ready: {
        dependsOn: ["bootstrap"],
        command: "vp check && vp run check:markdown && vp run -r test && vp run -r build",
      },
    },
  },
});
