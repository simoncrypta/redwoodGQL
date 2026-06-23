import type { TypedDocumentNode } from "@apollo/client";

export type { TypedDocumentNode };

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

export type BlogPostsQuery = { readonly blogPosts: readonly Post[] };
export type BlogPostsQueryVariables = Record<string, never>;
export type FindAuthorQuery = { readonly author: User | null };
export type FindAuthorQueryVariables = { readonly id: number };
export type FindBlogPostQuery = { readonly blogPost: Post | null };
export type FindBlogPostQueryVariables = { readonly id: number };
export type FindWaterfallBlogPostQuery = { readonly waterfallBlogPost: Post | null };
export type FindWaterfallBlogPostQueryVariables = { readonly id: number };
export type FindPosts = { readonly posts: readonly Post[] };
export type FindPostsVariables = Record<string, never>;
export type FindPostById = { readonly post: Post | null };
export type FindPostByIdVariables = { readonly id: number };
export type EditPostById = { readonly post: Post | null };
export type FindContacts = { readonly contacts: readonly Contact[] };
export type FindContactsVariables = Record<string, never>;
export type FindContactById = { readonly contact: Contact | null };
export type FindContactByIdVariables = { readonly id: number };
export type EditContactById = { readonly contact: Contact | null };

export type CreatePostMutation = { readonly createPost: Post };
export type CreatePostMutationVariables = { readonly input: CreatePostInput };
export type UpdatePostMutationVariables = {
  readonly id: number;
  readonly input: UpdatePostInput;
};
export type DeletePostMutation = { readonly deletePost: Post };
export type DeletePostMutationVariables = { readonly id: number };
export type CreateContactMutation = { readonly createContact: Contact };
export type CreateContactMutationVariables = { readonly input: CreateContactInput };
export type UpdateContactMutationVariables = {
  readonly id: number;
  readonly input: UpdateContactInput;
};
export type DeleteContactMutation = { readonly deleteContact: Contact };
export type DeleteContactMutationVariables = { readonly id: number };
