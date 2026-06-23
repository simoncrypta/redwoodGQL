import type { FastifyBaseLogger, FastifyReply, FastifyRequest } from "fastify";
import { createYoga } from "graphql-yoga";

import { getSchema } from "../schema/buildSchema.js";

type YogaContext = {
  readonly reply: FastifyReply;
  readonly request: FastifyRequest;
};

export const createGraphqlYoga = (logger: FastifyBaseLogger) =>
  createYoga<YogaContext>({
    graphqlEndpoint: "/graphql",
    landingPage: true,
    logging: {
      debug: (...args) => args.forEach((arg) => logger.debug(arg)),
      error: (...args) => args.forEach((arg) => logger.error(arg)),
      info: (...args) => args.forEach((arg) => logger.info(arg)),
      warn: (...args) => args.forEach((arg) => logger.warn(arg)),
    },
    schema: getSchema(),
  });
