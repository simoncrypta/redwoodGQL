import { defineConfig } from "vite-plus";

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
    tasks: {
      "setup-env": {
        command: "bash ../../scripts/setup-db-env.sh",
        input: ["../../scripts/setup-db-env.sh"],
      },
      generate: {
        command: "prisma generate",
        dependsOn: ["setup-env"],
        input: ["prisma/schema.prisma"],
      },
      pgserve: {
        command: "tsx ../../scripts/pgserve-start.ts",
        cache: false,
      },
      prepare: {
        command: "tsx ../../scripts/ensure-pgserve.ts",
        dependsOn: ["generate"],
        cache: false,
      },
      "migrate-deploy": {
        command: "prisma migrate deploy",
        dependsOn: ["prepare"],
        cache: false,
      },
    },
  },
});
