import { db, type Post } from "db";

import type { PublicUser, RelationResolver, ServiceResolver } from "../../types.js";

const publicUserSelect = {
  email: true,
  fullName: true,
  id: true,
  roles: true,
} as const;

export const user: ServiceResolver<PublicUser | null, { readonly id: number }> = ({ id }) =>
  db.user.findUnique({
    select: publicUserSelect,
    where: { id },
  });

export const UserRelations = {
  posts: (async (root) => {
    const posts = await db.user.findUnique({ where: { id: root.id } }).posts();
    return posts ?? [];
  }) satisfies RelationResolver<PublicUser, readonly Post[]>,
} as const;
