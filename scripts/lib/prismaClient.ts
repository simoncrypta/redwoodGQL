import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type PrismaClientConstructor = new (args?: { datasources?: { db?: { url?: string } } }) => {
  $connect: () => Promise<void>;
  $disconnect: () => Promise<void>;
  $queryRaw: (...args: unknown[]) => Promise<unknown>;
  $executeRawUnsafe: (query: string) => Promise<unknown>;
};

type PrismaClientModule = {
  PrismaClient?: unknown;
  default?: unknown;
};

const hasPrismaClientConstructor = (
  value: unknown,
): value is { PrismaClient: PrismaClientConstructor } => {
  return (
    typeof value === "object" &&
    value !== null &&
    "PrismaClient" in value &&
    typeof (value as PrismaClientModule).PrismaClient === "function"
  );
};

const dbPackageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../apps/db");
const requireFromDb = createRequire(path.join(dbPackageRoot, "package.json"));

export const loadPrismaClientConstructor = (): PrismaClientConstructor => {
  const prismaPackage: unknown = requireFromDb("@prisma/client");

  if (hasPrismaClientConstructor(prismaPackage)) {
    return prismaPackage.PrismaClient;
  }

  const defaultExport =
    typeof prismaPackage === "object" && prismaPackage !== null
      ? (prismaPackage as PrismaClientModule).default
      : undefined;

  if (hasPrismaClientConstructor(defaultExport)) {
    return defaultExport.PrismaClient;
  }

  throw new Error(
    "Could not load PrismaClient from @prisma/client. Run vp run db#generate and retry.",
  );
};
