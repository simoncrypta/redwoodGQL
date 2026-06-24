import { db, type Post } from "db";

import type {
  CreatePostInput,
  PublicUser,
  RelationResolver,
  ServiceResolver,
  UpdatePostInput,
} from "../../types.js";

export const posts: ServiceResolver<readonly Post[]> = () => db.post.findMany();

export const post: ServiceResolver<Post | null, { readonly id: number }> = ({ id }) =>
  db.post.findUnique({
    where: { id },
  });

export const createPost: ServiceResolver<Post, { readonly input: CreatePostInput }> = ({ input }) =>
  db.post.create({
    data: input,
  });

export const updatePost: ServiceResolver<
  Post,
  { readonly id: number; readonly input: UpdatePostInput }
> = ({ id, input }) =>
  db.post.update({
    data: input,
    where: { id },
  });

export const deletePost: ServiceResolver<Post, { readonly id: number }> = ({ id }) =>
  db.post.delete({
    where: { id },
  });

export const PostRelations = {
  author: (async (root) =>
    db.post.findUnique({ where: { id: root.id } }).author()) satisfies RelationResolver<
    Post,
    PublicUser | null
  >,
} as const;
