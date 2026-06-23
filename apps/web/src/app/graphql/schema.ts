import { buildSchema, type GraphQLSchema } from "graphql";

const typeDefs = `
  type ApolloPoc {
    framework: String!
    runtime: String!
    integration: String!
    transport: String!
    notes: [String!]!
  }

  type Query {
    redwoodApolloPoc: ApolloPoc!
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
  integration: "Local @rwsdk/apollo streaming SSR provider",
  transport: "RWSDK route handler at POST /graphql",
  notes: [
    "The page shell remains a RedwoodSDK server component.",
    "ApolloRwsdkProvider uses Apollo's shared streaming transport primitives.",
    "RWSDK passes a request-derived GraphQL URL and CSP nonce into the provider.",
  ],
} as const;

export const rootValue = {
  redwoodApolloPoc: () => apolloPoc,
} as const;
