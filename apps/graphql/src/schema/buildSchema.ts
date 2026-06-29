import { mergeTypeDefs } from "@graphql-tools/merge";
import { makeExecutableSchema } from "@graphql-tools/schema";
import type { GraphQLSchema } from "graphql";

import { applyValidatorDirectives } from "@rwgql/auth/graphql";

import { bindResolver } from "@rwgql/graphql-typegen/yoga";
import { directives, rootResolvers, services, typeDefs } from "./registry.ts";

const dateTimeScalar = {
  DateTime: {
    parseValue: (value: unknown) => new Date(value as string),
    serialize: (value: unknown) => (value instanceof Date ? value.toISOString() : value),
  },
} as const;

const serviceResolvers = {
  Mutation: {
    createContact: bindResolver(services.contacts.createContact),
    createPost: bindResolver(services.posts.createPost),
    deleteContact: bindResolver(services.contacts.deleteContact),
    deletePost: bindResolver(services.posts.deletePost),
    updateContact: bindResolver(services.contacts.updateContact),
    updatePost: bindResolver(services.posts.updatePost),
  },
  Post: {
    author: bindResolver(services.posts.author),
  },
  Query: {
    contact: bindResolver(services.contacts.contact),
    contacts: bindResolver(services.contacts.contacts),
    post: bindResolver(services.posts.post),
    posts: bindResolver(services.posts.posts),
    user: bindResolver(services.users.user),
  },
  User: {
    posts: bindResolver(services.users.posts),
  },
} as const;

let schema: GraphQLSchema | undefined;

const applyAuthDirectives = applyValidatorDirectives(directives, {
  enforceOn: ["Query", "Mutation"],
});

export const getSchema = (): GraphQLSchema => {
  schema ??= applyAuthDirectives(
    makeExecutableSchema({
      resolvers: {
        ...dateTimeScalar,
        ...rootResolvers,
        ...serviceResolvers,
      },
      typeDefs: mergeTypeDefs([...typeDefs], {
        throwOnConflict: true,
      }),
    }),
  );

  return schema;
};
