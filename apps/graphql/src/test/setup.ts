import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { ensurePrismaDatabaseUrl } from "@rwgql/prisma-dev";
import { afterAll } from "vite-plus/test";

import { db } from "db";

ensurePrismaDatabaseUrl(resolve(dirname(fileURLToPath(import.meta.url)), "../../../db/index.ts"));

afterAll(async () => {
  await db.$disconnect();
});
