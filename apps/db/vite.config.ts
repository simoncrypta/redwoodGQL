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
        command: "pgserve postmaster --port 8432 --data .pgserve",
        cache: false,
      },
      prepare: {
        command: "node --experimental-strip-types ../../scripts/wait-for-pg.ts",
        cache: false,
      },
      "migrate-deploy": {
        command: "prisma migrate deploy",
        dependsOn: ["generate", "prepare"],
        cache: false,
      },
    },
  },
});
