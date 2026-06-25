import { defineConfig } from "vite-plus";

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
      dev: {
        command: "vp run @rwgql/auth#build && vp run @rwgql/dbauth#build && nitro dev",
        cache: false,
      },
      "export-schema": {
        command: "node --experimental-strip-types scripts/export-schema.ts",
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
