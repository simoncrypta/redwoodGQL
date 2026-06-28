import { defineConfig } from "vite-plus";

const graphqlPackageBuilds = [
  "@rwgql/auth#build",
  "@rwgql/dbauth#build",
  "@rwgql/log-formatter#build",
] as const;

export default defineConfig({
  fmt: {
    ignorePatterns: [".nitro/**", ".output/**", "schema.graphql"],
  },
  lint: {
    ignorePatterns: [".nitro/**", ".output/**", "schema.graphql"],
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  run: {
    tasks: {
      build: {
        command: "nitro build",
        dependsOn: [...graphqlPackageBuilds],
      },
      check: {
        command: "vp check",
        dependsOn: [...graphqlPackageBuilds],
      },
      dev: {
        command: "nitro dev",
        dependsOn: [...graphqlPackageBuilds],
        cache: false,
      },
      "export-schema": {
        command: "tsx scripts/export-schema.ts",
        dependsOn: [...graphqlPackageBuilds],
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
        output: [{ pattern: "apps/web/src/gql/**", base: "workspace" }],
      },
      "codegen:watch": {
        command: "graphql-codegen --config codegen.ts --watch",
        dependsOn: ["export-schema"],
        cache: false,
      },
    },
  },
});
