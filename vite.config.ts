import { defineConfig } from "vite-plus";
import { configDefaults } from "vite-plus/test/config";
import { createBinCommand } from "@rwgql/task-core/vite";

const devTasks = ["rwsdk#dev", "graphql#dev", "graphql#codegen:watch"] as const;
const devStopTasks = ["db#dev:stop"] as const;
const devCommand = `RWGQL_DEV_STOP_TASKS=${devStopTasks.join(",")} RWGQL_DEV_TASKS=${devTasks.join(",")} ${createBinCommand("@rwgql/task-core", "rwgql-dev")}`;

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
    projects: ["packages/*"],
  },
  run: {
    cache: true,
    tasks: {
      "check:markdown": {
        command: "markdownlint-cli2",
        input: [{ pattern: "**/*.md", base: "workspace" }, ".markdownlint-cli2.jsonc"],
      },
      dev: {
        command: devCommand,
        dependsOn: ["db#dev:prepare", "seed", "graphql#codegen"],
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
