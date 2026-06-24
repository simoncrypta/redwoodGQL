import { buildSchema, type GraphQLSchema } from "graphql";

import { fixtureResolvers } from "./fixtureData.js";

const typeDefs = `
  scalar DateTime

  type ApolloPoc {
    framework: String!
    runtime: String!
    integration: String!
    transport: String!
    notes: [String!]!
  }

  type User {
    id: Int!
    email: String!
    fullName: String!
    roles: String
    posts: [Post]!
  }

  type Post {
    id: Int!
    title: String!
    body: String!
    authorId: Int!
    author: User!
    createdAt: DateTime!
  }

  type Contact {
    id: Int!
    name: String!
    email: String!
    message: String!
    createdAt: DateTime!
  }

  input CreatePostInput {
    title: String!
    body: String!
    authorId: Int!
  }

  input UpdatePostInput {
    title: String
    body: String
    authorId: Int
  }

  input CreateContactInput {
    name: String!
    email: String!
    message: String!
  }

  input UpdateContactInput {
    name: String
    email: String
    message: String
  }

  type Query {
    redwoodApolloPoc: ApolloPoc!
    posts: [Post!]!
    post(id: Int!): Post
    user(id: Int!): User
    contacts: [Contact!]!
    contact(id: Int!): Contact
  }

  type Mutation {
    createPost(input: CreatePostInput!): Post!
    updatePost(id: Int!, input: UpdatePostInput!): Post!
    deletePost(id: Int!): Post!
    createContact(input: CreateContactInput!): Contact!
    updateContact(id: Int!, input: UpdateContactInput!): Contact!
    deleteContact(id: Int!): Contact!
  }
`;

let schema: GraphQLSchema | undefined;

export const getSchema = (): GraphQLSchema => {
  schema ??= buildSchema(typeDefs);
  return schema;
};

const apolloPoc = {
  framework: "RedwoodSDK",
  runtime: "Cloudflare Workers with React Server Components",
  integration: "Local @rwgql/rwsdk-apollo-client streaming SSR provider",
  transport: "RWSDK route handler at POST /graphql",
  notes: [
    "The page shell remains a RedwoodSDK server component.",
    "ApolloRwsdkProvider uses Apollo's shared streaming transport primitives.",
    "RWSDK passes a request-derived GraphQL URL and CSP nonce into the provider.",
  ],
} as const;

export const rootValue = {
  redwoodApolloPoc: () => apolloPoc,
  ...fixtureResolvers,
} as const;
