import type { Contact, Post, User } from "db";

export type { Contact, Post, User };

export type PublicUser = Pick<User, "email" | "fullName" | "id" | "roles">;

export type CreatePostInput = Pick<Post, "authorId" | "body" | "title">;
export type UpdatePostInput = Partial<CreatePostInput>;
export type CreateContactInput = Pick<Contact, "email" | "message" | "name">;
export type UpdateContactInput = Partial<CreateContactInput>;

export type ResolverArgs<TArgs extends object = Record<string, never>> = Readonly<TArgs>;
export type ResolverContext = Record<string, never>;

export type ServiceResolver<TResult, TArgs extends object = Record<string, never>> = (
  args: ResolverArgs<TArgs>,
) => TResult | Promise<TResult>;

export type RelationResolver<TRoot, TResult> = (root: TRoot) => TResult | Promise<TResult>;
