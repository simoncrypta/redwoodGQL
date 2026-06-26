import { PrismaClient } from "@prisma/client";
import { ensurePrismaDatabaseUrl } from "@rwgql/prisma-dev";

ensurePrismaDatabaseUrl(import.meta.url);

export const db = new PrismaClient();

export type * from "@prisma/client";
