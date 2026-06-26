import { defineConfig } from "vite-plus";
import { createBinResolver, mergeTasks } from "@rwgql/task-core/vite";
import { createPgserveTasks } from "@rwgql/pgserve-dev/tasks";

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
    tasks: mergeTasks(createPgserveTasks(pgserveDevConfig, { bin: pgserveBin }), {
      generate: {
        command: "prisma generate",
        dependsOn: ["setup-env"],
        input: ["prisma/schema.prisma"],
      },
      "migrate-deploy": {
        command: "prisma migrate deploy",
        dependsOn: ["prepare"],
        cache: false,
      },
    }),
  },
});
