import { resolveUserPosts, users } from "../../data/fixtures.js";
import type { Post, RelationResolver, ServiceResolver, User } from "../../types.js";

export const user: ServiceResolver<User | null, { readonly id: number }> = ({ id }) =>
  users.find((item) => item.id === id) ?? null;

export const UserRelations = {
  posts: ((root) => resolveUserPosts(root)) satisfies RelationResolver<User, readonly Post[]>,
} as const;
