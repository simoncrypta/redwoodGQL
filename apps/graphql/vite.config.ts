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
    include: ["src/**/*.test.ts"],
    setupFiles: ["src/test/setup.ts"],
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
      "src/schema/generated/**",
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
          { pattern: "apps/web/src/app/components/**/*.{ts,tsx}", base: "workspace" },
          { pattern: "apps/web/src/app/pages/**/*.{ts,tsx}", base: "workspace" },
        ],
        output: [{ pattern: "apps/web/src/gql/**", base: "workspace" }, "src/types/graphql.ts"],
      },
      "export-schema": {
        command: "tsx scripts/export-schema.ts",
        dependsOn: ["regenerate-registry", ...graphqlPackageBuilds],
        input: [
          "scripts/export-schema.ts",
          "src/graphql/**/*.ts",
          "src/schema/**/*.ts",
          "src/directives/**/*.ts",
        ],
        output: ["schema.graphql"],
      },
      "regenerate-registry": {
        command:
          "tsx scripts/regenerate-registry.ts && vp fmt src/schema/generated/typeDefs.ts src/schema/generated/services.ts",
        dependsOn: [...graphqlPackageBuilds],
        input: [
          "scripts/regenerate-registry.ts",
          "src/graphql/**/*.ts",
          "src/directives/**/*.ts",
          "src/services/**/*.ts",
        ],
        output: ["src/schema/generated/typeDefs.ts", "src/schema/generated/services.ts"],
      },
    },
  },
});
