import Fastify from "fastify";

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

await app.ready();

const routing = app.routing.bind(app);

export default routing;
