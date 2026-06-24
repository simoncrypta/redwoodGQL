import { getDirective, MapperKind, mapSchema } from "@graphql-tools/utils";
import { defaultFieldResolver, type GraphQLSchema } from "graphql";
import type { Plugin } from "graphql-yoga";

import { AuthenticationError, ForbiddenError } from "./errors.js";

export { AuthenticationError, ForbiddenError } from "./errors.js";
export { hasRoleForUser } from "./hasRole.js";

type AuthContext = {
  readonly currentUser?: Record<string, unknown> | null;
};

const extendAuthContext = (
  extendContext: (contextExtension: Partial<Record<string, unknown>>) => void,
  currentUser: Record<string, unknown> | null,
) => {
  extendContext({ currentUser });
};

type DecodeSession = (
  request: Request,
) => Promise<null | Record<string, unknown>> | null | Record<string, unknown>;

type GetCurrentUser = (
  session: Record<string, unknown>,
) => Promise<Record<string, unknown> | null> | null | Record<string, unknown>;

type RequireAuthFn = (context: AuthContext, options?: { roles?: string[] | string }) => void;

type SkipAuthFn = (context: AuthContext) => void;

export const createAuthYogaPlugin = ({
  decodeSession,
  getCurrentUser,
}: {
  decodeSession: DecodeSession;
  getCurrentUser: GetCurrentUser;
}): Plugin => ({
  onContextBuilding: async ({ context, extendContext }) => {
    const request = (context as { request?: Request }).request;
    const setCurrentUser = extendContext as (
      contextExtension: Partial<Record<string, unknown>>,
    ) => void;

    if (!request) {
      extendAuthContext(setCurrentUser, null);
      return;
    }

    const session = await decodeSession(request);

    if (!session) {
      extendAuthContext(setCurrentUser, null);
      return;
    }

    const currentUser = await getCurrentUser(session);
    extendAuthContext(setCurrentUser, currentUser ?? null);
  },
});

export const createAuthDirectiveTransformers = ({
  requireAuth,
  skipAuth = () => undefined,
}: {
  requireAuth: RequireAuthFn;
  skipAuth?: SkipAuthFn;
}) => {
  return (schema: GraphQLSchema): GraphQLSchema =>
    mapSchema(schema, {
      [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
        const requireAuthDirective = getDirective(schema, fieldConfig, "requireAuth")?.[0] as
          | { roles?: string[] }
          | undefined;
        const skipAuthDirective = getDirective(schema, fieldConfig, "skipAuth")?.[0];

        if (!requireAuthDirective && !skipAuthDirective) {
          return fieldConfig;
        }

        const { resolve = defaultFieldResolver } = fieldConfig;

        fieldConfig.resolve = (source, args, context, info) => {
          const authContext = context as AuthContext;

          if (skipAuthDirective) {
            skipAuth(authContext);
          }

          if (requireAuthDirective) {
            try {
              requireAuth(authContext, { roles: requireAuthDirective.roles });
            } catch (error) {
              if (error instanceof AuthenticationError || error instanceof ForbiddenError) {
                throw error;
              }

              throw error;
            }
          }

          return resolve(source, args, context, info);
        };

        return fieldConfig;
      },
    });
};
