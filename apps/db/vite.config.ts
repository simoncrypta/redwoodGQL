import { defineConfig } from "vite-plus";
import { createBinResolver, mergeTasks } from "@rwgql/task-core/vite";
import {
  createPgserveTasks,
  createDevPrepareTask,
  createDevStopTask,
} from "@rwgql/pgserve-dev/tasks";
import { createPrismaTasks } from "@rwgql/prisma-dev/tasks";

import { pgserveDevConfig } from "./pgserve.config.ts";

const pgserveBin = createBinResolver("@rwgql/pgserve-dev");

export default defineConfig({
  fmt: {
    ignorePatterns: [".pgserve/**"],
  },
  lint: {
    ignorePatterns: [".pgserve/**"],
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  run: {
    tasks: mergeTasks(
      createPgserveTasks(pgserveDevConfig, { bin: pgserveBin }, { prepareDependsOn: ["generate"] }),
      createPrismaTasks({ dependsOnPrepare: "dev:prepare", schemaPath: "src/schema.prisma" }),
      createDevPrepareTask(pgserveDevConfig, { bin: pgserveBin }, { dependsOn: ["generate"] }),
      createDevStopTask(pgserveDevConfig, { bin: pgserveBin }),
    ),
  },
});
