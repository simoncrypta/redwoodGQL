import { schema as requireAuthDirective } from "../directives/requireAuth/requireAuth.js";
import { schema as skipAuthDirective } from "../directives/skipAuth/skipAuth.js";
import { schema as contactsSchema } from "../graphql/contacts.sdl.js";
import { schema as postsSchema } from "../graphql/posts.sdl.js";
import { schema as usersSchema } from "../graphql/users.sdl.js";
import * as contactsService from "../services/contacts/contacts.js";
import * as postsService from "../services/posts/posts.js";
import * as usersService from "../services/users/users.js";
import { redwoodApolloPoc, schema as rootSchema } from "./root.js";

export const typeDefs = [
  rootSchema,
  skipAuthDirective,
  requireAuthDirective,
  usersSchema,
  postsSchema,
  contactsSchema,
] as const;

export const services = {
  contacts: contactsService,
  posts: postsService,
  users: usersService,
} as const;

export const rootResolvers = {
  Query: {
    redwoodApolloPoc: () => redwoodApolloPoc,
  },
} as const;
