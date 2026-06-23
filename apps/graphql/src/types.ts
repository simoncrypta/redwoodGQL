export type User = {
  readonly email: string;
  readonly fullName: string;
  readonly id: number;
  readonly roles?: string | null;
};

export type Post = {
  readonly author?: User;
  readonly authorId: number;
  readonly body: string;
  readonly createdAt: string;
  readonly id: number;
  readonly title: string;
};

export type Contact = {
  readonly createdAt: string;
  readonly email: string;
  readonly id: number;
  readonly message: string;
  readonly name: string;
};

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
