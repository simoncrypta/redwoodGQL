import { defineConfig } from "vite-plus";

const graphqlPackageBuilds = [
  "@rwgql/auth#build",
  "@rwgql/dbauth#build",
  "@rwgql/graphql-typegen#build",
  "@rwgql/log-formatter#build",
] as const;

export default defineConfig({
  test: {
    environment: "node",
    fileParallelism: false,
    globalSetup: ["testUtils/globalSetup.ts"],
    include: ["src/**/*.test.ts"],
    setupFiles: ["testUtils/setup.ts"],
  },
  fmt: {
    ignorePatterns: [".nitro/**", ".output/**", "schema.graphql", "src/types/graphql.ts"],
  },
  lint: {
    ignorePatterns: [
      ".nitro/**",
      ".output/**",
      "schema.graphql",
      "src/types/graphql.ts",
      "src/generated/**",
    ],
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
      dev: {
        command: "tsx scripts/dev.ts",
        dependsOn: [...graphqlPackageBuilds, "regenerate-registry"],
        cache: false,
      },
      codegen: {
        command: "graphql-codegen --config codegen.ts",
        dependsOn: ["export-schema", ...graphqlPackageBuilds],
        input: [
          "codegen.ts",
          "schema.graphql",
          { pattern: "apps/web/src/components/**/*.{ts,tsx}", base: "workspace" },
          { pattern: "apps/web/src/pages/**/*.{ts,tsx}", base: "workspace" },
        ],
        output: [{ pattern: "apps/web/src/gql/**", base: "workspace" }, "src/types/graphql.ts"],
      },
      "export-schema": {
        command: "tsx scripts/export-schema.ts",
        dependsOn: ["regenerate-registry", ...graphqlPackageBuilds],
        input: [
          "scripts/export-schema.ts",
          "src/graphql/**/*.ts",
          "src/directives/**/*.ts",
          "src/generated/**/*.ts",
        ],
        output: ["schema.graphql"],
      },
      "regenerate-registry": {
        command:
          "tsx scripts/regenerate-registry.ts && vp fmt src/generated/typeDefs.ts src/generated/services.ts src/generated/getSchema.ts",
        dependsOn: [...graphqlPackageBuilds],
        input: [
          "scripts/regenerate-registry.ts",
          "src/graphql/**/*.ts",
          "src/directives/**/*.ts",
          "src/services/**/*.ts",
        ],
        output: [
          "src/generated/typeDefs.ts",
          "src/generated/services.ts",
          "src/generated/getSchema.ts",
        ],
      },
    },
  },
});
