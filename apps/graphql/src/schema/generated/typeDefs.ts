// AUTO-GENERATED — do not edit. Run `vp run regenerate-registry` to update.

import { schema as rootSchema } from "../root.ts";
import requireAuthDirective from "../../directives/requireAuth/requireAuth.ts";
import skipAuthDirective from "../../directives/skipAuth/skipAuth.ts";
import { schema as contactsSchema } from "../../graphql/contacts.sdl.ts";
import { schema as postsSchema } from "../../graphql/posts.sdl.ts";
import { schema as usersSchema } from "../../graphql/users.sdl.ts";

export const directives = [requireAuthDirective, skipAuthDirective] as const;

export const typeDefs = [
  rootSchema,
  ...directives.map((directive) => directive.schema),
  contactsSchema,
  postsSchema,
  usersSchema,
] as const;
