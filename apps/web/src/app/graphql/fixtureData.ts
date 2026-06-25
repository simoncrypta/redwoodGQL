type User = {
  readonly email: string;
  readonly fullName: string;
  readonly id: number;
  readonly roles?: string | null;
};

type Post = {
  readonly author?: User;
  readonly authorId: number;
  readonly body: string;
  readonly createdAt: string;
  readonly id: number;
  readonly title: string;
};

type Contact = {
  readonly createdAt: string;
  readonly email: string;
  readonly id: number;
  readonly message: string;
  readonly name: string;
};

type CreatePostInput = Pick<Post, "authorId" | "body" | "title">;
type UpdatePostInput = Partial<CreatePostInput>;
type CreateContactInput = Pick<Contact, "email" | "message" | "name">;
type UpdateContactInput = Partial<CreateContactInput>;

const users = [
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

const posts = [
  {
    authorId: 1,
    body: "This hardcoded post is served by the RWSdk GraphQL endpoint for the migration PoC.",
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

const contacts = [
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

const withAuthor = (post: Post): Post => ({
  ...post,
  author: users.find((user) => user.id === post.authorId) ?? users[0],
});

const nextId = (items: readonly { readonly id: number }[]) =>
  Math.max(...items.map((item) => item.id)) + 1;

export const fixtureResolvers = {
  contact: ({ id }: { readonly id: number }) =>
    contacts.find((contact) => contact.id === id) ?? null,
  contacts: () => contacts,
  createContact: ({ input }: { readonly input: CreateContactInput }) => ({
    createdAt: new Date(0).toISOString(),
    id: nextId(contacts),
    ...input,
  }),
  createPost: ({ input }: { readonly input: CreatePostInput }) =>
    withAuthor({
      createdAt: new Date(0).toISOString(),
      id: nextId(posts),
      ...input,
    }),
  deleteContact: ({ id }: { readonly id: number }) =>
    contacts.find((contact) => contact.id === id) ?? contacts[0],
  deletePost: ({ id }: { readonly id: number }) =>
    withAuthor(posts.find((post) => post.id === id) ?? posts[0]),
  post: ({ id }: { readonly id: number }) => {
    const post = posts.find((item) => item.id === id);
    return post ? withAuthor(post) : null;
  },
  posts: () => posts.map(withAuthor),
  updateContact: ({ id, input }: { readonly id: number; readonly input: UpdateContactInput }) => ({
    ...(contacts.find((contact) => contact.id === id) ?? contacts[0]),
    ...input,
  }),
  updatePost: ({ id, input }: { readonly id: number; readonly input: UpdatePostInput }) =>
    withAuthor({
      ...(posts.find((post) => post.id === id) ?? posts[0]),
      ...input,
    }),
  user: ({ id }: { readonly id: number }) => users.find((user) => user.id === id) ?? null,
} as const;
