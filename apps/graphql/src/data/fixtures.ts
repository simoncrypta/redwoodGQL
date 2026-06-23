import type {
  Contact,
  CreateContactInput,
  CreatePostInput,
  Post,
  UpdateContactInput,
  UpdatePostInput,
  User,
} from "../types.js";

export const users = [
  {
    email: "ada@example.com",
    fullName: "Ada Lovelace",
    id: 1,
    roles: "ADMIN",
  },
  {
    email: "grace@example.com",
    fullName: "Grace Hopper",
    id: 2,
    roles: "USER",
  },
] as const satisfies readonly User[];

export const posts = [
  {
    authorId: 1,
    body: "This hardcoded post is served by the standalone Fastify GraphQL endpoint for the migration PoC.",
    createdAt: "2026-06-20T14:30:00.000Z",
    id: 1,
    title: "Migrating Redwood Cells",
  },
  {
    authorId: 2,
    body: "The page, layout, component, and Cell structure mirrors test-project/web without a DB.",
    createdAt: "2026-06-21T10:15:00.000Z",
    id: 2,
    title: "RWSdk Route Parity",
  },
] as const satisfies readonly Post[];

export const contacts = [
  {
    createdAt: "2026-06-19T12:00:00.000Z",
    email: "hello@example.com",
    id: 1,
    message: "Can we run this fixture app on RWSdk?",
    name: "Test Contact",
  },
  {
    createdAt: "2026-06-22T09:45:00.000Z",
    email: "support@example.com",
    id: 2,
    message: "This record is hardcoded, not persisted.",
    name: "Second Contact",
  },
] as const satisfies readonly Contact[];

export const resolvePostAuthor = (post: Pick<Post, "authorId">): User =>
  users.find((user) => user.id === post.authorId) ?? users[0];

export const resolveUserPosts = (user: Pick<User, "id">): readonly Post[] =>
  posts.filter((post) => post.authorId === user.id);

export const withAuthor = (post: Post): Post => ({
  ...post,
  author: resolvePostAuthor(post),
});

const nextId = (items: readonly { readonly id: number }[]) =>
  Math.max(...items.map((item) => item.id)) + 1;

export const buildContact = (input: CreateContactInput): Contact => ({
  createdAt: new Date(0).toISOString(),
  id: nextId(contacts),
  ...input,
});

export const buildPost = (input: CreatePostInput): Post =>
  withAuthor({
    createdAt: new Date(0).toISOString(),
    id: nextId(posts),
    ...input,
  });

export const patchContact = (id: number, input: UpdateContactInput): Contact => ({
  ...(contacts.find((contact) => contact.id === id) ?? contacts[0]),
  ...input,
});

export const patchPost = (id: number, input: UpdatePostInput): Post =>
  withAuthor({
    ...(posts.find((post) => post.id === id) ?? posts[0]),
    ...input,
  });
