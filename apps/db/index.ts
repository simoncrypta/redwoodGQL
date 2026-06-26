import { PrismaClient } from "@prisma/client";
import { ensurePrismaDatabaseUrl } from "@rwgql/prisma-dev";

ensurePrismaDatabaseUrl(import.meta.url, { levelsUp: 0 });

export const db = new PrismaClient();

export type * from "@prisma/client";
