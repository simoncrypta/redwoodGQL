import type { FastifyBaseLogger, FastifyReply, FastifyRequest } from "fastify";
import { createYoga } from "graphql-yoga";
import { createAuthDecoder } from "@rwgql/dbauth/server";
import { createAuthYogaPlugin } from "@rwgql/auth/graphql";

import { cookieName, getCurrentUser } from "../lib/auth.js";
import { getSchema } from "../schema/buildSchema.js";

export type YogaContext = {
  readonly currentUser: Awaited<ReturnType<typeof getCurrentUser>>;
  readonly reply: FastifyReply;
  readonly request: FastifyRequest;
};

const authDecoder = createAuthDecoder({ cookieName });

const toWebRequest = (request: FastifyRequest) =>
  new Request(`http://localhost${request.url}`, {
    headers: request.headers as HeadersInit,
    method: request.method,
  });

export const createGraphqlYoga = (logger: FastifyBaseLogger) =>
  createYoga<YogaContext>({
    context: ({ reply, request }) => ({
      currentUser: null,
      reply,
      request,
    }),
    graphqlEndpoint: "/graphql",
    landingPage: true,
    logging: {
      debug: (...args) => args.forEach((arg) => logger.debug(arg)),
      error: (...args) => args.forEach((arg) => logger.error(arg)),
      info: (...args) => args.forEach((arg) => logger.info(arg)),
      warn: (...args) => args.forEach((arg) => logger.warn(arg)),
    },
    plugins: [
      createAuthYogaPlugin({
        decodeSession: (request) => {
          const webRequest =
            request instanceof Request ? request : toWebRequest(request as FastifyRequest);

          return authDecoder(webRequest);
        },
        getCurrentUser: (session) => getCurrentUser(session as { id: number }),
      }),
    ],
    schema: getSchema(),
  });
