import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { mergeTypeDefs } from "@graphql-tools/merge";
import { print } from "graphql";

import { schema as requireAuthDirective } from "../src/directives/requireAuth/requireAuth.ts";
import { schema as skipAuthDirective } from "../src/directives/skipAuth/skipAuth.ts";
import { schema as contactsSchema } from "../src/graphql/contacts.sdl.ts";
import { schema as postsSchema } from "../src/graphql/posts.sdl.ts";
import { schema as usersSchema } from "../src/graphql/users.sdl.ts";
import { schema as rootSchema } from "../src/schema/root.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = join(__dirname, "..", "schema.graphql");

const typeDefs = [
  rootSchema,
  skipAuthDirective,
  requireAuthDirective,
  usersSchema,
  postsSchema,
  contactsSchema,
] as const;

const merged = mergeTypeDefs([...typeDefs]);
writeFileSync(outputPath, `${print(merged)}\n`);

console.log(`Wrote ${outputPath}`);
