import { redwoodApolloPoc } from "./root.ts";

export { directives, typeDefs } from "./generated/typeDefs.ts";
export { services } from "./generated/services.ts";

export const rootResolvers = {
  Query: {
    redwoodApolloPoc: () => redwoodApolloPoc,
  },
} as const;
