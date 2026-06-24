import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { PrismaClient } from "@prisma/client";

const loadPrismaDatabaseUrl = () => {
  if (process.env.PRISMA_DATABASE_URL) {
    return;
  }

  const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

  for (const fileName of [".env", ".env.defaults"]) {
    const envPath = resolve(packageRoot, fileName);
    if (!existsSync(envPath)) {
      continue;
    }

    for (const line of readFileSync(envPath, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const match = trimmed.match(/^PRISMA_DATABASE_URL=(.*)$/);
      if (!match) {
        continue;
      }

      process.env.PRISMA_DATABASE_URL = match[1]!.replace(/^["']|["']$/g, "");
      return;
    }
  }
};

loadPrismaDatabaseUrl();

export const db = new PrismaClient();
