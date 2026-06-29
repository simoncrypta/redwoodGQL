import type { Post as DbPost } from "db";
import { db } from "db";

import type { QueryUserArgs, ResolverFn } from "types/graphql";

import type { PublicUser } from "../../types/mappers.js";

const publicUserSelect = {
  email: true,
  fullName: true,
  id: true,
  roles: true,
} as const;

export const user: ResolverFn<PublicUser | null, unknown, unknown, QueryUserArgs> = (
  _parent,
  { id },
) =>
  db.user.findUnique({
    select: publicUserSelect,
    where: { id },
  });

export const userPosts: ResolverFn<DbPost[], PublicUser, unknown, Record<string, never>> = async (
  root,
) => {
  const posts = await db.user.findUnique({ where: { id: root.id } }).posts();
  return posts ?? [];
};

export const User = {
  posts: userPosts,
};
