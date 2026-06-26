import { defineConfig } from "vite-plus";
import { configDefaults } from "vite-plus/test/config";
import { createBinCommand, createBinResolver, mergeTasks } from "@rwgql/task-core/vite";
import { createDevPrepareTask } from "@rwgql/pgserve-dev/tasks";

import { pgserveDevConfig } from "./apps/db/pgserve.config.ts";

const pgserveBin = createBinResolver("@rwgql/pgserve-dev");
const devTasks = ["rwsdk#dev", "graphql#dev", "graphql#codegen:watch"] as const;
const devCommand = `RWGQL_DEV_TASKS=${devTasks.join(",")} ${createBinCommand("@rwgql/task-core", "rwgql-dev")}`;

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
    tasks: mergeTasks(createDevPrepareTask(pgserveDevConfig, { bin: pgserveBin }), {
      dev: {
        command: devCommand,
        dependsOn: ["dev:prepare", "seed", "graphql#codegen"],
        cache: false,
      },
      seed: {
        command: "tsx scripts/seed.ts",
        dependsOn: ["db#migrate-deploy", "@rwgql/dbauth#build"],
        cache: false,
      },
    }),
  },
});
