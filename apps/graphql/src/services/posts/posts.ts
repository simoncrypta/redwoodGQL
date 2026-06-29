import type { Post as DbPost, User } from "db";
import { db } from "db";

import type {
  MutationCreatePostArgs,
  MutationDeletePostArgs,
  MutationUpdatePostArgs,
  QueryPostArgs,
  ResolverFn,
} from "types/graphql";

export const posts: ResolverFn<DbPost[], unknown, unknown, Record<string, never>> = () =>
  db.post.findMany();

export const post: ResolverFn<DbPost | null, unknown, unknown, QueryPostArgs> = (_parent, { id }) =>
  db.post.findUnique({
    where: { id },
  });

export const createPost: ResolverFn<DbPost, unknown, unknown, MutationCreatePostArgs> = (
  _parent,
  { input },
) =>
  db.post.create({
    data: input,
  });

export const updatePost: ResolverFn<DbPost, unknown, unknown, MutationUpdatePostArgs> = (
  _parent,
  { id, input },
) =>
  db.post.update({
    data: input as Parameters<typeof db.post.update>[0]["data"],
    where: { id },
  });

export const deletePost: ResolverFn<DbPost, unknown, unknown, MutationDeletePostArgs> = (
  _parent,
  { id },
) =>
  db.post.delete({
    where: { id },
  });

export const postAuthor: ResolverFn<User | null, DbPost, unknown, Record<string, never>> = (root) =>
  db.post.findUnique({ where: { id: root.id } }).author();

export const Post = {
  author: postAuthor,
};
