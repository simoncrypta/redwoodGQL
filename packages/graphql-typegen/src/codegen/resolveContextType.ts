import path from "node:path";

/** Default output path for generated server resolver types. */
export const DEFAULT_RESOLVER_TYPES_OUTPUT = "./src/types/graphql.ts";

/** Default GraphQL context export name for Redwood-style Yoga apps. */
export const DEFAULT_CONTEXT_EXPORT = "YogaContext";

/**
 * Resolve the graphql-codegen `contextType` import for a generated `graphql.ts` file.
 * Convention: context lives at `../graphql.ts` relative to the types output.
 */
export const resolveContextType = (
  outputPath: string,
  contextExport: string = DEFAULT_CONTEXT_EXPORT,
): string => {
  const outputDir = path.dirname(outputPath);
  const contextModule = path.normalize(path.join(outputDir, "../graphql.ts"));
  const relativeModule = path.relative(outputDir, contextModule).replace(/\\/g, "/");
  const importPath = relativeModule.startsWith(".") ? relativeModule : `./${relativeModule}`;

  return `${importPath}#${contextExport}`;
};
