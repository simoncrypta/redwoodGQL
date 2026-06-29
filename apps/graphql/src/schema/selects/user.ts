import type { Prisma } from "db";

/** Prisma select for User fields declared in users.sdl.ts. */
export const userSelect = {
  email: true,
  fullName: true,
  id: true,
  roles: true,
} as const satisfies Prisma.UserSelect;
