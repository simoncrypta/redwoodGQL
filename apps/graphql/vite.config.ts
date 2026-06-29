import { defineConfig } from "vite-plus";

const graphqlPackageBuilds = [
  "@rwgql/auth#build",
  "@rwgql/dbauth#build",
  "@rwgql/log-formatter#build",
] as const;

export default defineConfig({
  test: {
    environment: "node",
    fileParallelism: false,
    include: ["src/**/*.test.ts"],
    setupFiles: ["src/test/setup.ts"],
  },
  fmt: {
    ignorePatterns: [".nitro/**", ".output/**", "schema.graphql", "src/types/graphql.ts"],
  },
  lint: {
    ignorePatterns: [".nitro/**", ".output/**", "schema.graphql", "src/types/graphql.ts"],
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  run: {
    tasks: {
      build: {
        command: "nitro build",
        dependsOn: [...graphqlPackageBuilds, "codegen"],
      },
      check: {
        command: "vp check",
        dependsOn: [...graphqlPackageBuilds, "codegen"],
      },
      test: {
        command: "vp test",
        dependsOn: [...graphqlPackageBuilds, "codegen"],
      },
      dev: {
        command:
          process.platform === "win32"
            ? "graphql-codegen --config codegen.ts --watch & nitro dev"
            : "sh -c 'trap \"kill 0\" INT TERM; graphql-codegen --config codegen.ts --watch & exec nitro dev'",
        dependsOn: [...graphqlPackageBuilds],
        cache: false,
      },
      "export-schema": {
        command: "tsx scripts/export-schema.ts",
        dependsOn: [...graphqlPackageBuilds, "db#generate"],
        input: [
          "scripts/export-schema.ts",
          "src/graphql/**/*.ts",
          "src/schema/**/*.ts",
          "src/directives/**/*.ts",
        ],
        output: ["schema.graphql"],
      },
      codegen: {
        command: "graphql-codegen --config codegen.ts",
        dependsOn: ["export-schema"],
        input: [
          "codegen.ts",
          "schema.graphql",
          { pattern: "apps/web/src/app/components/**/*.{ts,tsx}", base: "workspace" },
          { pattern: "apps/web/src/app/pages/**/*.{ts,tsx}", base: "workspace" },
        ],
        output: [{ pattern: "apps/web/src/gql/**", base: "workspace" }, "src/types/graphql.ts"],
      },
    },
  },
});
