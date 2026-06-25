import type { CodegenConfig } from "@graphql-codegen/cli";

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
        useTypeImports: true,
        enumsAsTypes: true,
        scalars: { DateTime: "string" },
      },
    },
  },
};

export default config;
