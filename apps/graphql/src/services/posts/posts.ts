import {
  buildPost,
  patchPost,
  posts as fixturePosts,
  resolvePostAuthor,
  withAuthor,
} from "../../data/fixtures.js";
import type {
  CreatePostInput,
  Post,
  RelationResolver,
  ServiceResolver,
  UpdatePostInput,
  User,
} from "../../types.js";

export const posts: ServiceResolver<readonly Post[]> = () => fixturePosts.map(withAuthor);

export const post: ServiceResolver<Post | null, { readonly id: number }> = ({ id }) => {
  const foundPost = fixturePosts.find((item) => item.id === id);
  return foundPost ? withAuthor(foundPost) : null;
};

export const createPost: ServiceResolver<Post, { readonly input: CreatePostInput }> = ({ input }) =>
  buildPost(input);

export const updatePost: ServiceResolver<
  Post,
  { readonly id: number; readonly input: UpdatePostInput }
> = ({ id, input }) => patchPost(id, input);

export const deletePost: ServiceResolver<Post, { readonly id: number }> = ({ id }) =>
  withAuthor(fixturePosts.find((item) => item.id === id) ?? fixturePosts[0]);

export const PostRelations = {
  author: ((root) => resolvePostAuthor(root)) satisfies RelationResolver<Post, User>,
} as const;
