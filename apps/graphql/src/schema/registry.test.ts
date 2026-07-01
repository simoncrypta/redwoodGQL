import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vite-plus/test";

import { discoverSchemaRegistryFiles } from "@rwgql/graphql-typegen/codegen";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

describe("schema registry discovery", () => {
  it("discovers the demo GraphQL modules without manual registry edits", async () => {
    const files = await discoverSchemaRegistryFiles({
      outputDir: join(projectRoot, "src/schema/generated"),
      patterns: {
        directives: "src/directives/**/*.ts",
        sdl: "src/graphql/**/*.sdl.ts",
        services: "src/services/**/*.ts",
      },
      projectRoot,
      rootSchemaImportPath: "../root.ts",
    });

    expect(files.sdl).toEqual([
      "src/graphql/contacts.sdl.ts",
      "src/graphql/posts.sdl.ts",
      "src/graphql/users.sdl.ts",
    ]);
    expect(files.directives).toEqual([
      "src/directives/requireAuth/requireAuth.ts",
      "src/directives/skipAuth/skipAuth.ts",
    ]);
    expect(files.services).toEqual([
      "src/services/contacts/contacts.ts",
      "src/services/posts/posts.ts",
      "src/services/users/users.ts",
    ]);
  });

  it("keeps the committed generated registry in sync with discovery", () => {
    const servicesPath = join(projectRoot, "src/schema/generated/services.ts");
    const typeDefsPath = join(projectRoot, "src/schema/generated/typeDefs.ts");
    const services = readFileSync(servicesPath, "utf8");
    const typeDefs = readFileSync(typeDefsPath, "utf8");

    expect(services).toContain("contacts: contactsService,");
    expect(services).toContain("posts: postsService,");
    expect(services).toContain("users: usersService,");
    expect(typeDefs).toContain("contactsSchema,");
    expect(typeDefs).toContain("postsSchema,");
    expect(typeDefs).toContain("usersSchema,");
  });
});
