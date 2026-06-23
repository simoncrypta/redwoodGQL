import { graphql } from "graphql";
import type { RequestInfo } from "rwsdk/worker";
import { z } from "zod";

import { getSchema, rootValue } from "./schema.js";

type GraphqlRouteInfo = RequestInfo<Record<string, never>>;

const graphqlVariablesSchema = z.record(z.string(), z.unknown());

const graphqlRequestSchema = z.looseObject({
  operationName: z.string().nullish(),
  query: z.string().min(1),
  variables: graphqlVariablesSchema.nullish(),
});

const graphqlResponseContentType = "application/graphql-response+json; charset=utf-8";

const jsonResponse = (body: unknown, init: ResponseInit = {}): Response => {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", graphqlResponseContentType);

  return new Response(JSON.stringify(body), {
    ...init,
    headers,
  });
};

const errorResponse = (message: string, status: number): Response =>
  jsonResponse(
    {
      errors: [{ message }],
    },
    { status },
  );

export const handleGraphqlPost = async ({ request }: GraphqlRouteInfo): Promise<Response> => {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return errorResponse("GraphQL requests must use an application/json body.", 415);
  }

  let requestBody: unknown;

  try {
    requestBody = await request.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse("GraphQL request body must be valid JSON.", 400);
    }

    throw error;
  }

  const parsedRequest = graphqlRequestSchema.safeParse(requestBody);

  if (!parsedRequest.success) {
    return errorResponse("GraphQL request body must include a non-empty query string.", 400);
  }

  const { operationName, query, variables } = parsedRequest.data;

  const result = await graphql({
    operationName: operationName ?? undefined,
    rootValue,
    schema: getSchema(),
    source: query,
    variableValues: variables ?? undefined,
  });

  return jsonResponse(result);
};
