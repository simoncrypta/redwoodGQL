import cors from "@fastify/cors";
import Fastify from "fastify";
import { registerDbAuthRoutes } from "@rwgql/dbauth/server";

import { dbAuthOptions } from "./src/auth/dbAuthConfig.js";
import { createGraphqlYoga } from "./src/functions/graphql.js";
import { db } from "db";

const app = Fastify({
  logger: true,
});

await app.register(cors, {
  credentials: true,
  origin: process.env.WEB_ORIGIN ?? "http://localhost:8910",
});

registerDbAuthRoutes(app, dbAuthOptions);

const yoga = createGraphqlYoga(app.log);

app.route({
  handler: (request, reply) =>
    yoga.handleNodeRequestAndResponse(request, reply, {
      reply,
      request,
    }),
  method: ["GET", "POST", "OPTIONS"],
  url: yoga.graphqlEndpoint,
});

const disconnect = async () => {
  await db.$disconnect();
};

process.on("SIGINT", () => {
  void disconnect().finally(() => process.exit(0));
});
process.on("SIGTERM", () => {
  void disconnect().finally(() => process.exit(0));
});

await app.ready();

const routing = app.routing.bind(app);

export default routing;
