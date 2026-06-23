export const schema = `
  scalar DateTime

  type Query {
    redwoodApolloPoc: ApolloPoc!
  }

  type ApolloPoc {
    framework: String!
    runtime: String!
    integration: String!
    transport: String!
    notes: [String!]!
  }
`;

export const redwoodApolloPoc = {
  framework: "RedwoodSDK",
  integration: "Standalone Fastify GraphQL Yoga endpoint with local fixture services",
  notes: [
    "The page shell remains a RedwoodSDK server component.",
    "ApolloRwsdkProvider uses Apollo's shared streaming transport primitives.",
    "The web app fetches GraphQL over HTTP from apps/graphql.",
  ],
  runtime: "Nitro server entry running Fastify on Node.js",
  transport: "GraphQL Yoga mounted at POST /graphql",
} as const;
