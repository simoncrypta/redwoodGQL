import requireAuthDirective from "../directives/requireAuth/requireAuth.ts";
import skipAuthDirective from "../directives/skipAuth/skipAuth.ts";
import { schema as contactsSchema } from "../graphql/contacts.sdl.ts";
import { schema as postsSchema } from "../graphql/posts.sdl.ts";
import { schema as usersSchema } from "../graphql/users.sdl.ts";
import { schema as rootSchema } from "./root.ts";

export const directives = [skipAuthDirective, requireAuthDirective] as const;

export const typeDefs = [
  rootSchema,
  ...directives.map((directive) => directive.schema),
  usersSchema,
  postsSchema,
  contactsSchema,
] as const;
