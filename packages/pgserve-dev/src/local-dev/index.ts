import fs from "node:fs";
import path from "node:path";

import { getStringArg, parseCliArgs } from "@rwgql/task-core/cli";
import { parseStrictPort } from "@rwgql/task-core/port";

import { syncAppEnvFromConnection } from "../env/syncAppEnv.ts";
import { canQueryDatabase } from "../postgres/client.ts";
import { buildPostgresSocketUrl, getSocketDir } from "../postgres/urls.ts";
import {
  createLocalDevPgserveProvider,
  type PgserveProvider,
} from "../provider/pgserveProvider.ts";
import {
  PGSERVE_READY_MARKER,
  PgserveCliArgKey,
  type PgserveCliArgs,
  type PgserveConnectionEnv,
  type ResolvedPgserveConfig,
  type StartLocalDevPgserveOptions,
  type StartedLocalDevPgserve,
} from "../types.ts";
import {
  buildConnectionEnv,
  getConnectionEnvPath,
  persistConnectionEnv,
  readConnectionEnv,
  removeConnectionEnvFiles,
  waitForConnectionEnv,
} from "./connectionEnv.ts";
import {
  hasLivePostmaster,
  removeIncompletePgserveDataDir,
  stopLivePostmaster,
} from "./postmaster.ts";

export { PGSERVE_READY_MARKER, PgserveCliArgKey, type PgserveCliArgs };
export { getConnectionEnvPath, readConnectionEnv, removeConnectionEnvFiles, waitForConnectionEnv };

export async function stopProvider(provider: PgserveProvider | null) {
  if (!provider) {
    return;
  }

  await provider.stop().catch((error) => {
    console.error("Failed to stop pgserve cleanly:", error);
  });
}

export function printPgserveReadyMarker(): void {
  console.log(PGSERVE_READY_MARKER);
}

export function printConnectionInfo(connection: PgserveConnectionEnv) {
  console.log(`\npgserve local dev database is ready:`);
  console.log(`  DATABASE_URL=${connection.databaseUrl}`);
  console.log(`  PGSERVE_PORT=${connection.routerPort}`);
  console.log(`  PGSERVE_POSTGRES_PORT=${connection.postgresPort}`);
  console.log(`  PGSERVE_DATA_DIR=${connection.dataDir}`);
  console.log(`  PGSERVE_CONNECTION_ENV=${connection.connectionEnvPath}\n`);
}

async function reuseRunningPgserveIfAvailable({
  config,
  args,
  dataDir,
  requestedPort,
}: {
  config: ResolvedPgserveConfig;
  args: PgserveCliArgs;
  dataDir: string;
  requestedPort: number | undefined;
}): Promise<StartedLocalDevPgserve | null> {
  if (!hasLivePostmaster(dataDir)) {
    return null;
  }

  try {
    const connectionEnvPath = path.join(dataDir, "connection.env");
    if (!fs.existsSync(connectionEnvPath)) {
      return null;
    }

    const existingConnection = readConnectionEnv(config, args);
    if (
      path.resolve(existingConnection.dataDir) !== dataDir ||
      (requestedPort !== undefined && existingConnection.routerPort !== requestedPort) ||
      !(await canQueryDatabase(
        buildPostgresSocketUrl(existingConnection.postgresPort, config.databaseName),
      ))
    ) {
      return null;
    }

    const connection = persistConnectionEnv(existingConnection);
    await syncAppEnvFromConnection(config, connection);
    console.log("Reusing running pgserve for this worktree data directory.");
    printConnectionInfo(connection);

    return {
      connectionEnvPath: connection.connectionEnvPath,
      databaseUrl: connection.databaseUrl,
      dataDir: connection.dataDir,
      env: connection.env,
      postgresPort: connection.postgresPort,
      provider: null,
      routerPort: connection.routerPort,
    };
  } catch {
    return null;
  }
}

async function waitForReuseablePgserve({
  config,
  args,
  dataDir,
  requestedPort,
}: {
  config: ResolvedPgserveConfig;
  args: PgserveCliArgs;
  dataDir: string;
  requestedPort: number | undefined;
}): Promise<StartedLocalDevPgserve | null> {
  const maxAttempts = 150;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const reused = await reuseRunningPgserveIfAvailable({
      config,
      args,
      dataDir,
      requestedPort,
    });
    if (reused) {
      return reused;
    }

    if (!hasLivePostmaster(dataDir)) {
      return null;
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  return null;
}

export async function startLocalDevPgserve(
  config: ResolvedPgserveConfig,
  args: PgserveCliArgs = parseCliArgs(),
  options: StartLocalDevPgserveOptions = {},
): Promise<StartedLocalDevPgserve> {
  const { detach = false, emitReadyMarker = true } = options;
  const dataDir = path.resolve(getStringArg(args, PgserveCliArgKey.DataDir) ?? config.dataDir);
  const databaseName = getStringArg(args, PgserveCliArgKey.Database) ?? config.databaseName;
  const portArg = getStringArg(args, PgserveCliArgKey.Port);
  const port = parseStrictPort(portArg, `Invalid --port value: ${portArg}`);

  const existingConnection = await waitForReuseablePgserve({
    config,
    args,
    dataDir,
    requestedPort: port,
  });
  if (existingConnection) {
    if (emitReadyMarker) {
      printPgserveReadyMarker();
    }
    return existingConnection;
  }

  removeConnectionEnvFiles(config, args);
  await stopLivePostmaster(dataDir);
  removeIncompletePgserveDataDir(dataDir);

  const portOptions = port === undefined ? { startPort: config.defaultPort } : { port };

  const provider = createLocalDevPgserveProvider(config.pgserveBinPath, {
    dataDir,
    databaseName,
    detach,
    ...portOptions,
  });

  try {
    await provider.start();
    const databaseUrl = await provider.ensureDatabaseExists(databaseName);
    const routerPort = provider.getPort();
    const postgresPort = provider.getPostgresPort();
    const socketDir = getSocketDir();
    const connection = persistConnectionEnv(
      buildConnectionEnv({
        connectionEnvPath: getConnectionEnvPath(config, args),
        databaseUrl,
        dataDir,
        routerPort,
        postgresPort,
        socketDir,
      }),
    );

    await syncAppEnvFromConnection(config, connection);
    printConnectionInfo(connection);

    if (emitReadyMarker) {
      printPgserveReadyMarker();
    }

    return {
      connectionEnvPath: connection.connectionEnvPath,
      databaseUrl: connection.databaseUrl,
      dataDir: connection.dataDir,
      env: connection.env,
      postgresPort: connection.postgresPort,
      provider,
      routerPort: connection.routerPort,
    };
  } catch (error) {
    await stopProvider(provider);
    removeConnectionEnvFiles(config, args);
    throw error;
  }
}

export function registerShutdown(
  config: ResolvedPgserveConfig,
  provider: PgserveProvider | null,
  args: PgserveCliArgs = {},
) {
  const shutdown = async () => {
    await stopProvider(provider);
    removeConnectionEnvFiles(config, args);
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}
