import fs from "node:fs";
import path from "node:path";

import { buildPostgresSocketUrl } from "../postgres/urls.ts";
import type { PgserveConnectionEnv, ResolvedPgserveConfig } from "../types.ts";
import { writeAppEnvFile } from "./writeAppEnv.ts";

type AppEnvVariables = Record<string, string>;

function buildPrismaAppEnvFromConnection(
  config: ResolvedPgserveConfig,
  connection: PgserveConnectionEnv,
): AppEnvVariables {
  return {
    DATABASE_URL: connection.databaseUrl,
    PRISMA_DATABASE_URL: buildPostgresSocketUrl(connection.postgresPort, config.databaseName),
    PRISMA_HIDE_UPDATE_MESSAGE: "true",
  };
}

function buildPrismaAppEnvFallback(config: ResolvedPgserveConfig): AppEnvVariables {
  const databaseUrl = `postgresql://postgres@localhost:${config.defaultPort}/${config.databaseName}`;
  return {
    DATABASE_URL: databaseUrl,
    PRISMA_DATABASE_URL: buildPostgresSocketUrl(config.defaultPort, config.databaseName),
    PRISMA_HIDE_UPDATE_MESSAGE: "true",
  };
}

export async function syncAppEnvFromConnection(
  config: ResolvedPgserveConfig,
  connection: PgserveConnectionEnv,
): Promise<void> {
  if (!config.appEnvAdapter || !config.appEnvPath) {
    return;
  }

  writeAppEnvFile(config.appEnvPath, buildPrismaAppEnvFromConnection(config, connection));
}

export function setupAppEnvFallback(config: ResolvedPgserveConfig): void {
  if (!config.appEnvAdapter || !config.appEnvPath) {
    return;
  }

  const connectionEnvPath = path.join(config.dataDir, "connection.env");
  if (fs.existsSync(connectionEnvPath)) {
    return;
  }

  writeAppEnvFile(config.appEnvPath, buildPrismaAppEnvFallback(config));
}

export function buildPrismaFallbackEnv(config: ResolvedPgserveConfig): AppEnvVariables {
  return buildPrismaAppEnvFallback(config);
}
