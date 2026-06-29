import type { GraphQLResolveInfo } from "graphql";

import type { CustomResolverType } from "./index.ts";

export const bindResolver =
  <TResult, TParent, TContext, TArgs>(
    resolver: CustomResolverType<TResult, TParent, TContext, TArgs>,
  ) =>
  (parent: TParent, args: TArgs, context: TContext, info: GraphQLResolveInfo) =>
    resolver(args, { root: parent, context, info });

export const callService = <TResult, TParent, TContext, TArgs>(
  resolver: CustomResolverType<TResult, TParent, TContext, TArgs>,
  args: TArgs,
  root: TParent = {} as TParent,
  context?: TContext,
) => resolver(args, { root, context });
