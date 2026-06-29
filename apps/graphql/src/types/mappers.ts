import type { User } from "db";

export type PublicUser = Pick<User, "email" | "fullName" | "id" | "roles">;
