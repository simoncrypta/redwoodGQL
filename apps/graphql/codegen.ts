import type { CodegenConfig } from "@graphql-codegen/cli";

const sharedConfig = {
  useTypeImports: true,
  enumsAsTypes: true,
  scalars: {
    DateTime: "Date",
  },
} as const;

const config: CodegenConfig = {
  schema: "./schema.graphql",
  documents: ["../web/src/app/components/**/*.{ts,tsx}", "../web/src/app/pages/**/*.{ts,tsx}"],
  ignoreNoDocuments: true,
  generates: {
    "../web/src/gql/": {
      preset: "client",
      presetConfig: {
        fragmentMasking: { unmaskFunctionName: "getFragmentData" },
      },
      config: {
        ...sharedConfig,
        scalars: {
          DateTime: "string",
        },
      },
    },
    "./src/types/graphql.ts": {
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        ...sharedConfig,
        mappers: {
          User: "./mappers.js#PublicUser",
        },
      },
    },
  },
};

export default config;
