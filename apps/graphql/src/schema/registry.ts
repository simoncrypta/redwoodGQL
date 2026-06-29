import * as contactsService from "../services/contacts/contacts.ts";
import * as postsService from "../services/posts/posts.ts";
import * as usersService from "../services/users/users.ts";
import { redwoodApolloPoc } from "./root.ts";
import { directives, typeDefs } from "./typeDefs.ts";

export { directives, typeDefs };

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
