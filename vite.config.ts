import { defineConfig } from "vite-plus";
import { configDefaults } from "vite-plus/test/config";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
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
    projects: ["packages/*"],
  },
  run: {
    cache: true,
    tasks: {
      "dev:prepare": {
        command: "tsx scripts/dev-prepare.ts",
        cache: false,
      },
      dev: {
        command: "tsx scripts/dev.ts",
        dependsOn: ["dev:prepare", "seed", "graphql#codegen"],
        cache: false,
      },
      seed: {
        command: "tsx scripts/seed.ts",
        dependsOn: ["db#migrate-deploy", "@rwgql/dbauth#build"],
        cache: false,
      },
    },
  },
});
