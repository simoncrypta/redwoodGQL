import { mergeTypeDefs } from "@graphql-tools/merge";
import { makeExecutableSchema } from "@graphql-tools/schema";
import type { Post } from "db";
import type { GraphQLSchema } from "graphql";

import { applyValidatorDirectives } from "@rwgql/auth/graphql";

import { callResolver, callResolverWithoutArgs } from "../lib/resolvers.js";
import type {
  MutationCreateContactArgs,
  MutationCreatePostArgs,
  MutationDeleteContactArgs,
  MutationDeletePostArgs,
  MutationUpdateContactArgs,
  MutationUpdatePostArgs,
  QueryContactArgs,
  QueryPostArgs,
  QueryUserArgs,
} from "../types/graphql.js";
import type { PublicUser } from "../types/mappers.js";
import { directives, rootResolvers, services, typeDefs } from "./registry.js";

const isPostRoot = (root: unknown): root is Post =>
  typeof root === "object" && root !== null && "authorId" in root;

const isUserRoot = (root: unknown): root is PublicUser =>
  typeof root === "object" && root !== null && "id" in root;

const dateTimeScalar = {
  DateTime: {
    parseValue: (value: unknown) => new Date(value as string),
    serialize: (value: unknown) => (value instanceof Date ? value.toISOString() : value),
  },
} as const;

const serviceResolvers = {
  Mutation: {
    createContact: (_root: unknown, args: MutationCreateContactArgs) =>
      callResolver(services.contacts.createContact, args, _root),
    createPost: (_root: unknown, args: MutationCreatePostArgs) =>
      callResolver(services.posts.createPost, args, _root),
    deleteContact: (_root: unknown, args: MutationDeleteContactArgs) =>
      callResolver(services.contacts.deleteContact, args, _root),
    deletePost: (_root: unknown, args: MutationDeletePostArgs) =>
      callResolver(services.posts.deletePost, args, _root),
    updateContact: (_root: unknown, args: MutationUpdateContactArgs) =>
      callResolver(services.contacts.updateContact, args, _root),
    updatePost: (_root: unknown, args: MutationUpdatePostArgs) =>
      callResolver(services.posts.updatePost, args, _root),
  },
  Post: {
    author: (root: unknown) =>
      isPostRoot(root) ? callResolver(services.posts.postAuthor, {}, root) : null,
  },
  Query: {
    contact: (_root: unknown, args: QueryContactArgs) =>
      callResolver(services.contacts.contact, args, _root),
    contacts: () => callResolverWithoutArgs(services.contacts.contacts),
    post: (_root: unknown, args: QueryPostArgs) => callResolver(services.posts.post, args, _root),
    posts: () => callResolverWithoutArgs(services.posts.posts),
    user: (_root: unknown, args: QueryUserArgs) => callResolver(services.users.user, args, _root),
  },
  User: {
    posts: (root: unknown) =>
      isUserRoot(root) ? callResolver(services.users.userPosts, {}, root) : [],
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
