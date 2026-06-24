import Fastify from "fastify";

import { db } from "db";
import { createGraphqlYoga } from "./src/functions/graphql.js";

const app = Fastify({
  logger: true,
});

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
