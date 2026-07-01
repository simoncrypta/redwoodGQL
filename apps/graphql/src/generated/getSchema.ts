// AUTO-GENERATED — do not edit. Run `vp run regenerate-registry` to update.

import type { GraphQLSchema } from "graphql";

import { applyValidatorDirectives } from "@rwgql/auth/graphql";
import { createServiceSchema } from "@rwgql/graphql-typegen/yoga";

import { directives, typeDefs } from "./typeDefs.ts";
import { services } from "./services.ts";

let schema: GraphQLSchema | undefined;

export const getSchema = (): GraphQLSchema => {
  schema ??= createServiceSchema({
    applyDirectives: (executable) =>
      applyValidatorDirectives(directives, { enforceOn: ["Query", "Mutation"] })(executable),
    services,
    typeDefs,
  });

  return schema;
};
