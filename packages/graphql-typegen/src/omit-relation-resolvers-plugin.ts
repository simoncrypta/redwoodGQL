import type { PluginFunction } from "@graphql-codegen/plugin-helpers";

import { RELATION_OPTIONAL, wrapRelationOptionalTypes } from "./schema-relations.ts";

const plugin: PluginFunction = async (schema, documents, config) => {
  const { plugin: typescriptPlugin } = await import("@graphql-codegen/typescript");
  const result = await typescriptPlugin(schema, documents, config);

  return {
    prepend: [RELATION_OPTIONAL, ...(result.prepend ?? [])],
    content: wrapRelationOptionalTypes(schema, result.content),
  };
};

export default plugin;
export { plugin };
