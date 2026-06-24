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
        command: "vp exec prisma generate",
        dependsOn: ["setup-env"],
        input: ["prisma/schema.prisma"],
      },
      pgserve: {
        command: "vp exec pgserve postmaster --port 8432 --data .pgserve",
        cache: false,
      },
      prepare: {
        command: "bash -lc 'node ../../scripts/wait-for-pg.ts'",
      },
      "migrate-deploy": {
        command: "vp exec prisma migrate deploy",
        dependsOn: ["generate", "prepare"],
        input: ["prisma/schema.prisma", "prisma/migrations/**"],
      },
    },
  },
});
