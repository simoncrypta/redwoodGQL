import { db } from "db";

import type { QueryResolvers, UserResolvers } from "types/graphql";
import type { ServiceResolver } from "@rwgql/graphql-typegen";

import { userSelect } from "../../schema/selects/user.ts";

export const user: ServiceResolver<QueryResolvers["user"]> = ({ id }) =>
  db.user.findUnique({
    select: userSelect,
    where: { id },
  });

export const posts: ServiceResolver<UserResolvers["posts"]> = async (_obj, { root }) => {
  const posts = await db.user.findUnique({ where: { id: root.id } }).posts();
  return posts ?? [];
};
