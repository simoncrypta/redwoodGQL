import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vite-plus/test";

import {
  discoverSchemaRegistryFiles,
  generateGetSchemaSource,
  generateSchemaRegistrySource,
  generateServicesRegistrySource,
  generateTypeDefsRegistrySource,
  writeSchemaRegistry,
} from "./generateSchemaRegistry.ts";

const graphqlAppRoot = join(dirname(fileURLToPath(import.meta.url)), "../../../../apps/graphql");

const graphqlAppRegistryConfig = {
  outputDir: join(graphqlAppRoot, "src/generated"),
  patterns: {
    directives: "src/directives/**/*.ts",
    sdl: "src/graphql/**/*.sdl.ts",
    services: "src/services/**/*.ts",
  },
  projectRoot: graphqlAppRoot,
} as const;

const createFixtureProject = (root: string): void => {
  mkdirSync(join(root, "src/graphql"), { recursive: true });
  mkdirSync(join(root, "src/directives/alphaAuth"), { recursive: true });
  mkdirSync(join(root, "src/directives/betaAuth"), { recursive: true });
  mkdirSync(join(root, "src/services/comments"), { recursive: true });
  mkdirSync(join(root, "src/services/posts"), { recursive: true });
  mkdirSync(join(root, "src/generated"), { recursive: true });

  writeFileSync(
    join(root, "src/graphql/comments.sdl.ts"),
    'export const schema = "type Comment { id: Int! }";',
  );
  writeFileSync(
    join(root, "src/graphql/posts.sdl.ts"),
    'export const schema = "type Post { id: Int! }";',
  );
  writeFileSync(
    join(root, "src/directives/alphaAuth/alphaAuth.ts"),
    'const alphaAuth = { schema: "directive @alphaAuth on FIELD_DEFINITION" };\nexport default alphaAuth;',
  );
  writeFileSync(
    join(root, "src/directives/betaAuth/betaAuth.ts"),
    'const betaAuth = { schema: "directive @betaAuth on FIELD_DEFINITION" };\nexport default betaAuth;',
  );
  writeFileSync(
    join(root, "src/directives/betaAuth/betaAuth.test.ts"),
    'export default "ignored";',
  );
  writeFileSync(
    join(root, "src/services/comments/comments.ts"),
    "export const comments = () => [];",
  );
  writeFileSync(join(root, "src/services/posts/posts.ts"), "export const posts = () => [];");
  writeFileSync(join(root, "src/services/posts/posts.test.ts"), "export const ignored = true;");
  writeFileSync(
    join(root, "src/services/posts/helpers.ts"),
    'export const ignored = "not a service module";',
  );
};

describe("generateSchemaRegistry", () => {
  it("discovers SDL, directives, and service modules using conventions", async () => {
    const root = mkdtempSync(join(tmpdir(), "rwgql-registry-"));
    createFixtureProject(root);

    const files = await discoverSchemaRegistryFiles({
      outputDir: join(root, "src/generated"),
      patterns: {
        directives: "src/directives/**/*.ts",
        sdl: "src/graphql/**/*.sdl.ts",
        services: "src/services/**/*.ts",
      },
      projectRoot: root,
    });

    expect(files.sdl).toEqual(["src/graphql/comments.sdl.ts", "src/graphql/posts.sdl.ts"]);
    expect(files.directives).toEqual([
      "src/directives/alphaAuth/alphaAuth.ts",
      "src/directives/betaAuth/betaAuth.ts",
    ]);
    expect(files.services).toEqual([
      "src/services/comments/comments.ts",
      "src/services/posts/posts.ts",
    ]);
  });

  it("generates explicit ESM imports and exports", () => {
    const root = "/workspace/apps/graphql";
    const outputDir = join(root, "src/generated");

    const source = generateSchemaRegistrySource(
      {
        outputDir,
        patterns: {
          directives: "src/directives/**/*.ts",
          sdl: "src/graphql/**/*.sdl.ts",
          services: "src/services/**/*.ts",
        },
        projectRoot: root,
      },
      {
        directives: [
          "src/directives/requireAuth/requireAuth.ts",
          "src/directives/skipAuth/skipAuth.ts",
        ],
        sdl: [
          "src/graphql/contacts.sdl.ts",
          "src/graphql/generic.sdl.ts",
          "src/graphql/posts.sdl.ts",
          "src/graphql/users.sdl.ts",
        ],
        services: [
          "src/services/contacts/contacts.ts",
          "src/services/posts/posts.ts",
          "src/services/users/users.ts",
        ],
      },
    );

    expect(source).not.toContain("rootSchema");
    expect(source).toContain(
      'import requireAuthDirective from "../directives/requireAuth/requireAuth.ts";',
    );
    expect(source).toContain(
      'import { schema as contactsSchema } from "../graphql/contacts.sdl.ts";',
    );
    expect(source).toContain(
      'import * as contactsService from "../services/contacts/contacts.ts";',
    );
    expect(source).toContain("contacts: contactsService,");
    expect(source).toContain("...directives.map((directive) => directive.schema),");
  });

  it("generates getSchema source", () => {
    const source = generateGetSchemaSource({
      outputDir: join(graphqlAppRoot, "src/generated"),
      patterns: graphqlAppRegistryConfig.patterns,
      projectRoot: graphqlAppRoot,
    });

    expect(source).toContain("createServiceSchema");
    expect(source).toContain("applyValidatorDirectives");
    expect(source).toContain('enforceOn: ["Query", "Mutation"]');
  });

  it("writes generated registry files", async () => {
    const root = mkdtempSync(join(tmpdir(), "rwgql-registry-write-"));
    createFixtureProject(root);

    const outputDir = join(root, "src/generated");

    await writeSchemaRegistry({
      outputDir,
      patterns: {
        directives: "src/directives/**/*.ts",
        sdl: "src/graphql/**/*.sdl.ts",
        services: "src/services/**/*.ts",
      },
      projectRoot: root,
    });

    const services = readFileSync(join(outputDir, "services.ts"), "utf8");
    const typeDefs = readFileSync(join(outputDir, "typeDefs.ts"), "utf8");
    const getSchema = readFileSync(join(outputDir, "getSchema.ts"), "utf8");

    expect(services).toContain("AUTO-GENERATED");
    expect(services).toContain("comments: commentsService,");
    expect(services).not.toContain("helpers.ts");
    expect(typeDefs).toContain("alphaAuthDirective");
    expect(typeDefs).not.toContain("commentsService");
    expect(services).not.toContain("betaAuth.test.ts");
    expect(getSchema).toContain("createServiceSchema");
  });

  it("discovers the demo GraphQL app modules without manual registry edits", async () => {
    const files = await discoverSchemaRegistryFiles(graphqlAppRegistryConfig);

    expect(files.sdl).toEqual([
      "src/graphql/contacts.sdl.ts",
      "src/graphql/generic.sdl.ts",
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

  it("keeps the committed generated registry in sync with discovery", async () => {
    const files = await discoverSchemaRegistryFiles(graphqlAppRegistryConfig);
    const typeDefs = generateTypeDefsRegistrySource(graphqlAppRegistryConfig, files);
    const services = generateServicesRegistrySource(graphqlAppRegistryConfig, files);
    const getSchema = generateGetSchemaSource(graphqlAppRegistryConfig);

    expect(typeDefs).toBe(readFileSync(join(graphqlAppRoot, "src/generated/typeDefs.ts"), "utf8"));
    expect(services).toBe(readFileSync(join(graphqlAppRoot, "src/generated/services.ts"), "utf8"));
    expect(getSchema).toBe(
      readFileSync(join(graphqlAppRoot, "src/generated/getSchema.ts"), "utf8"),
    );
  });
});
