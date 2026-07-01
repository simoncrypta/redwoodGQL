import { describe, expect, it } from "vite-plus/test";

import { createRedwoodResolverGenerateEntry } from "./index.ts";
import { DEFAULT_RESOLVER_TYPES_OUTPUT, resolveContextType } from "./resolveContextType.ts";

describe("resolveContextType", () => {
  it("resolves the Yoga context import relative to the generated graphql.ts path", () => {
    expect(resolveContextType("./src/types/graphql.ts")).toBe("../graphql.ts#YogaContext");
  });

  it("supports a custom context export name", () => {
    expect(resolveContextType("./src/types/graphql.ts", "GraphQLContext")).toBe(
      "../graphql.ts#GraphQLContext",
    );
  });
});

describe("createRedwoodResolverGenerateEntry", () => {
  it("uses the default resolver types output path", () => {
    const entry = createRedwoodResolverGenerateEntry({});
    const generated = entry[DEFAULT_RESOLVER_TYPES_OUTPUT];

    expect(Object.keys(entry)).toEqual([DEFAULT_RESOLVER_TYPES_OUTPUT]);
    expect(generated).toMatchObject({
      config: {
        contextType: "../graphql.ts#YogaContext",
      },
    });
  });

  it("allows overriding the output path", () => {
    const entry = createRedwoodResolverGenerateEntry({
      output: "./generated/api/graphql.ts",
    });

    expect(Object.keys(entry)).toEqual(["./generated/api/graphql.ts"]);
  });
});
