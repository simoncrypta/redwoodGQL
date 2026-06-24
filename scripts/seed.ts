import { db } from "db";

const seedUsers = async () => {
  const users = [
    {
      email: "ada@example.com",
      fullName: "Ada Lovelace",
      hashedPassword: "fake_hash",
      id: 1,
      roles: "ADMIN",
      salt: "fake_salt",
    },
    {
      email: "grace@example.com",
      fullName: "Grace Hopper",
      hashedPassword: "fake_hash",
      id: 2,
      roles: "USER",
      salt: "fake_salt",
    },
  ] as const;

  if ((await db.user.count()) === 0) {
    await Promise.all(users.map((user) => db.user.create({ data: user })));
    console.info("Seeded users");
  } else {
    console.info("Users already seeded");
  }
};

const seedPosts = async () => {
  const posts = [
    {
      authorId: 1,
      body: "This post is served by the standalone Fastify GraphQL endpoint backed by PostgreSQL.",
      title: "Migrating Redwood Cells",
    },
    {
      authorId: 2,
      body: "The page, layout, component, and Cell structure mirrors test-project/web with a real DB.",
      title: "RWSdk Route Parity",
    },
    {
      authorId: 1,
      body: "Meh waistcoat succulents umami asymmetrical, hoodie post-ironic paleo chillwave tote bag.",
      title: "What is the meaning of life?",
    },
  ] as const;

  if ((await db.post.count()) === 0) {
    await Promise.all(posts.map((post) => db.post.create({ data: post })));
    console.info("Seeded posts");
  } else {
    console.info("Posts already seeded");
  }
};

const seedContacts = async () => {
  const contacts = [
    {
      email: "hello@example.com",
      message: "Can we run this app on RWSdk with PostgreSQL?",
      name: "Test Contact",
    },
    {
      email: "support@example.com",
      message: "This record is persisted in PostgreSQL via Prisma.",
      name: "Second Contact",
    },
  ] as const;

  if ((await db.contact.count()) === 0) {
    await Promise.all(contacts.map((contact) => db.contact.create({ data: contact })));
    console.info("Seeded contacts");
  } else {
    console.info("Contacts already seeded");
  }
};

try {
  await seedUsers();
  await seedPosts();
  await seedContacts();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await db.$disconnect();
}
