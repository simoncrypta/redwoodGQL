import { mergeTypeDefs } from "@graphql-tools/merge";
import { makeExecutableSchema } from "@graphql-tools/schema";
import type { GraphQLSchema } from "graphql";

import type { Post, User } from "../types.js";
import { rootResolvers, services, typeDefs } from "./registry.js";

const isPostRoot = (root: unknown): root is Post =>
  typeof root === "object" && root !== null && "authorId" in root;

const isUserRoot = (root: unknown): root is User =>
  typeof root === "object" && root !== null && "id" in root;

const serviceResolvers = {
  Mutation: {
    createContact: (_root: unknown, args: Parameters<typeof services.contacts.createContact>[0]) =>
      services.contacts.createContact(args),
    createPost: (_root: unknown, args: Parameters<typeof services.posts.createPost>[0]) =>
      services.posts.createPost(args),
    deleteContact: (_root: unknown, args: Parameters<typeof services.contacts.deleteContact>[0]) =>
      services.contacts.deleteContact(args),
    deletePost: (_root: unknown, args: Parameters<typeof services.posts.deletePost>[0]) =>
      services.posts.deletePost(args),
    updateContact: (_root: unknown, args: Parameters<typeof services.contacts.updateContact>[0]) =>
      services.contacts.updateContact(args),
    updatePost: (_root: unknown, args: Parameters<typeof services.posts.updatePost>[0]) =>
      services.posts.updatePost(args),
  },
  Post: {
    author: (root: unknown) =>
      isPostRoot(root) ? services.posts.PostRelations.author(root) : null,
  },
  Query: {
    contact: (_root: unknown, args: Parameters<typeof services.contacts.contact>[0]) =>
      services.contacts.contact(args),
    contacts: () => services.contacts.contacts({}),
    post: (_root: unknown, args: Parameters<typeof services.posts.post>[0]) =>
      services.posts.post(args),
    posts: () => services.posts.posts({}),
    user: (_root: unknown, args: Parameters<typeof services.users.user>[0]) =>
      services.users.user(args),
  },
  User: {
    posts: (root: unknown) => (isUserRoot(root) ? services.users.UserRelations.posts(root) : []),
  },
} as const;

let schema: GraphQLSchema | undefined;

export const getSchema = (): GraphQLSchema => {
  schema ??= makeExecutableSchema({
    resolvers: {
      ...rootResolvers,
      ...serviceResolvers,
    },
    typeDefs: mergeTypeDefs([...typeDefs], {
      throwOnConflict: true,
    }),
  });

  return schema;
};
