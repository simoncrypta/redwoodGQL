import type { GraphQLResolveInfo } from "graphql";

import type { ResolverFn } from "types/graphql";

export const resolverContext = {};
export const resolverInfo = {} as GraphQLResolveInfo;

export const callResolver = <TResult, TParent, TArgs>(
  resolver: ResolverFn<TResult, TParent, unknown, TArgs>,
  args: TArgs,
  parent?: TParent,
) => resolver(parent ?? ({} as TParent), args, resolverContext, resolverInfo);

export const callResolverWithoutArgs = <TResult, TParent = unknown>(
  resolver: ResolverFn<TResult, TParent, unknown, Record<string, never>>,
  parent?: TParent,
) => resolver(parent ?? ({} as TParent), {}, resolverContext, resolverInfo);
