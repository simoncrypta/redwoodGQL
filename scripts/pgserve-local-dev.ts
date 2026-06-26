import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { parseStrictPort } from "./lib/portUtils.ts";
import {
  createLocalDevPgserveProvider,
  getDefaultPgserveDataDir,
  type PgserveProvider,
} from "./lib/pgserveProvider.ts";
import { loadPrismaClientConstructor } from "./lib/prismaClient.ts";

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_DATABASE_NAME = "redwoodgql";
const DEFAULT_PORT = 8432;
export const PGSERVE_READY_MARKER = "PGSERVE_CONNECTION_READY";

export const PgserveCliArgKey = {
  DataDir: "data-dir",
  Database: "database",
  Port: "port",
} as const;

export type PgserveCliArgKey = (typeof PgserveCliArgKey)[keyof typeof PgserveCliArgKey];

export type PgserveCliArgs = Partial<Record<PgserveCliArgKey, string | boolean | undefined>>;

interface StartedLocalDevPgserve {
  connectionEnvPath: string;
  databaseUrl: string;
  dataDir: string;
  env: NodeJS.ProcessEnv;
  postgresPort: number;
  provider: PgserveProvider | null;
  routerPort: number;
}

interface StartLocalDevPgserveOptions {
  detach?: boolean;
  emitReadyMarker?: boolean;
}

interface PgserveConnectionEnv {
  connectionEnvPath: string;
  databaseUrl: string;
  dataDir: string;
  env: NodeJS.ProcessEnv;
  postgresPort: number;
  prismaDatabaseUrl: string;
  routerPort: number;
  socketDir: string;
}

export function getStringArg(args: PgserveCliArgs, key: PgserveCliArgKey): string | undefined {
  const value = args[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export function parseCliArgs(argv = process.argv.slice(2)): PgserveCliArgs {
  return argv.reduce((acc, arg) => {
    const match = arg.match(/^--([^=]+)(?:=(.*))?$/);
    if (match) {
      const [, key, value] = match;
      return { ...acc, [key!]: value === undefined ? true : value };
    }
    return acc;
  }, {} as PgserveCliArgs);
}

function getSocketDir(): string {
  return `${process.env.XDG_RUNTIME_DIR ?? `/run/user/${process.getuid?.() ?? 1000}`}/pgserve`;
}

function buildPrismaDatabaseUrl(port: number, databaseName: string): string {
  const socketDir = getSocketDir();
  return `postgresql://postgres@localhost:${port}/${databaseName}?host=${socketDir}&socket=${socketDir}`;
}

function getDatabaseHost(databaseUrl: string): string {
  return new URL(databaseUrl).hostname;
}

function isProcessRunning(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function readPostmasterPid(dataDir: string): number | null {
  const pidPath = path.join(dataDir, "postmaster.pid");
  if (!fs.existsSync(pidPath)) {
    return null;
  }

  const pid = Number.parseInt(fs.readFileSync(pidPath, "utf8").split("\n")[0] ?? "", 10);
  return Number.isInteger(pid) && pid > 0 ? pid : null;
}

function hasLivePostmaster(dataDir: string): boolean {
  const pid = readPostmasterPid(dataDir);
  return pid !== null && isProcessRunning(pid);
}

async function waitForPostmasterExit(dataDir: string): Promise<boolean> {
  const startedAt = Date.now();
  const timeoutMs = 5000;

  while (Date.now() - startedAt < timeoutMs) {
    if (!hasLivePostmaster(dataDir)) {
      return true;
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  return !hasLivePostmaster(dataDir);
}

async function stopLivePostmaster(dataDir: string): Promise<void> {
  const pid = readPostmasterPid(dataDir);
  if (pid === null || !isProcessRunning(pid)) {
    return;
  }

  console.warn(
    `Found an existing pgserve PostgreSQL process (${pid}) for ${dataDir} without reusable connection metadata; stopping it before starting a fresh pgserve.`,
  );
  process.kill(pid, "SIGTERM");
  if (await waitForPostmasterExit(dataDir)) {
    return;
  }

  process.kill(pid, "SIGKILL");
  if (!(await waitForPostmasterExit(dataDir))) {
    throw new Error(
      `Timed out stopping existing pgserve PostgreSQL process (${pid}) for ${dataDir}`,
    );
  }
}

export function removeIncompletePgserveDataDir(dataDir: string): void {
  if (!fs.existsSync(dataDir) || fs.existsSync(path.join(dataDir, "PG_VERSION"))) {
    return;
  }

  const entries = fs.readdirSync(dataDir);
  if (entries.length === 0 || hasLivePostmaster(dataDir)) {
    return;
  }

  console.warn(`Removing incomplete pgserve data directory without PG_VERSION: ${dataDir}`);
  fs.rmSync(dataDir, { recursive: true, force: true });
}

export async function stopProvider(provider: PgserveProvider | null) {
  if (!provider) {
    return;
  }

  await provider.stop().catch((error) => {
    console.error("Failed to stop pgserve cleanly:", error);
  });
}

export function getConnectionEnvPath(args: PgserveCliArgs = {}): string {
  const dataDir = path.resolve(
    getStringArg(args, PgserveCliArgKey.DataDir) ?? getDefaultPgserveDataDir(),
  );
  return path.join(dataDir, "connection.env");
}

export function removeConnectionEnvFiles(
  args: PgserveCliArgs = {},
  dataDir = path.resolve(
    getStringArg(args, PgserveCliArgKey.DataDir) ?? getDefaultPgserveDataDir(),
  ),
): void {
  const paths = new Set([getConnectionEnvPath(args), path.join(dataDir, "connection.env")]);

  for (const connectionEnvPath of paths) {
    fs.rmSync(connectionEnvPath, { force: true });
  }
}

function writeConnectionEnv({
  databaseUrl,
  dataDir,
  port,
  postgresPort,
  prismaDatabaseUrl,
  socketDir,
}: {
  databaseUrl: string;
  dataDir: string;
  port: number;
  postgresPort: number;
  prismaDatabaseUrl: string;
  socketDir: string;
}) {
  fs.mkdirSync(dataDir, { recursive: true });
  const content = [
    `DATABASE_URL=${databaseUrl}`,
    `PRISMA_DATABASE_URL=${prismaDatabaseUrl}`,
    `PGSERVE_PORT=${port}`,
    `PGSERVE_POSTGRES_PORT=${postgresPort}`,
    `PGSERVE_DATA_DIR=${dataDir}`,
    `PGSERVE_SOCKET_DIR=${socketDir}`,
    `PRISMA_HIDE_UPDATE_MESSAGE=true`,
    "",
  ].join("\n");

  fs.writeFileSync(path.join(dataDir, "connection.env"), content);
}

export function writeAppDbEnv(connection: PgserveConnectionEnv): void {
  const envPath = path.join(workspaceRoot, "apps/db/.env");
  const content = [
    `DATABASE_URL="${connection.databaseUrl}"`,
    `PRISMA_DATABASE_URL="${connection.prismaDatabaseUrl}"`,
    `PRISMA_HIDE_UPDATE_MESSAGE=true`,
    "",
  ].join("\n");
  fs.writeFileSync(envPath, content);
}

async function canReachDatabase(databaseUrl: string): Promise<boolean> {
  const PrismaClient = loadPrismaClientConstructor();
  const prisma = new PrismaClient({
    datasources: { db: { url: databaseUrl } },
  });

  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  } finally {
    await prisma.$disconnect().catch(() => undefined);
  }
}

function readConnectionEnvAtPath(connectionEnvPath: string): PgserveConnectionEnv {
  if (!fs.existsSync(connectionEnvPath)) {
    throw new Error(
      `Missing pgserve connection env at ${connectionEnvPath}. Run vp run db#pgserve first.`,
    );
  }

  const values = Object.fromEntries(
    fs
      .readFileSync(connectionEnvPath, "utf8")
      .split("\n")
      .filter((line) => line.trim().length > 0 && line.includes("="))
      .map((line) => {
        const separatorIndex = line.indexOf("=");
        return [line.slice(0, separatorIndex), line.slice(separatorIndex + 1)];
      }),
  );

  const databaseUrl = values.DATABASE_URL;
  const prismaDatabaseUrl = values.PRISMA_DATABASE_URL;
  const dataDir = values.PGSERVE_DATA_DIR;
  const socketDir = values.PGSERVE_SOCKET_DIR ?? getSocketDir();
  const routerPort = Number.parseInt(values.PGSERVE_PORT ?? "", 10);
  const postgresPort = Number.parseInt(values.PGSERVE_POSTGRES_PORT ?? "", 10);

  if (!databaseUrl || !prismaDatabaseUrl || !dataDir || !routerPort || !postgresPort) {
    throw new Error(`Invalid pgserve connection env at ${connectionEnvPath}`);
  }

  return {
    connectionEnvPath,
    databaseUrl,
    dataDir,
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
      PRISMA_DATABASE_URL: prismaDatabaseUrl,
      PGSERVE_DATABASE_URL: databaseUrl,
      PGSERVE_HOST: getDatabaseHost(databaseUrl),
      PGSERVE_PORT: String(routerPort),
      PGSERVE_POSTGRES_PORT: String(postgresPort),
      PGSERVE_DATA_DIR: dataDir,
      PGSERVE_SOCKET_DIR: socketDir,
      PGSERVE_CONNECTION_ENV: connectionEnvPath,
      PRISMA_HIDE_UPDATE_MESSAGE: "true",
    },
    postgresPort,
    prismaDatabaseUrl,
    routerPort,
    socketDir,
  };
}

export function readConnectionEnv(args: PgserveCliArgs = {}): PgserveConnectionEnv {
  return readConnectionEnvAtPath(getConnectionEnvPath(args));
}

export async function waitForConnectionEnv(args: PgserveCliArgs = {}): Promise<void> {
  const connectionEnvPath = getConnectionEnvPath(args);
  const maxAttempts = 300;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (fs.existsSync(connectionEnvPath)) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  throw new Error(`Timed out waiting for pgserve connection env at ${connectionEnvPath}`);
}

export function printPgserveReadyMarker(): void {
  console.log(PGSERVE_READY_MARKER);
}

export function printConnectionInfo(connection: PgserveConnectionEnv) {
  console.log(`\npgserve local dev database is ready:`);
  console.log(`  DATABASE_URL=${connection.databaseUrl}`);
  console.log(`  PRISMA_DATABASE_URL=${connection.prismaDatabaseUrl}`);
  console.log(`  PGSERVE_PORT=${connection.routerPort}`);
  console.log(`  PGSERVE_POSTGRES_PORT=${connection.postgresPort}`);
  console.log(`  PGSERVE_DATA_DIR=${connection.dataDir}`);
  console.log(`  PGSERVE_CONNECTION_ENV=${connection.connectionEnvPath}\n`);
}

async function reuseRunningPgserveIfAvailable({
  args,
  dataDir,
  requestedPort,
}: {
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

    const existingConnection = readConnectionEnvAtPath(connectionEnvPath);
    if (
      path.resolve(existingConnection.dataDir) !== dataDir ||
      (requestedPort !== undefined && existingConnection.routerPort !== requestedPort) ||
      !(await canReachDatabase(existingConnection.prismaDatabaseUrl))
    ) {
      return null;
    }

    writeConnectionEnv({
      databaseUrl: existingConnection.databaseUrl,
      dataDir,
      port: existingConnection.routerPort,
      postgresPort: existingConnection.postgresPort,
      prismaDatabaseUrl: existingConnection.prismaDatabaseUrl,
      socketDir: existingConnection.socketDir,
    });
    const connection = readConnectionEnv(args);
    writeAppDbEnv(connection);
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
  args,
  dataDir,
  requestedPort,
}: {
  args: PgserveCliArgs;
  dataDir: string;
  requestedPort: number | undefined;
}): Promise<StartedLocalDevPgserve | null> {
  const maxAttempts = 150;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const reused = await reuseRunningPgserveIfAvailable({
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
  args: PgserveCliArgs,
  options: StartLocalDevPgserveOptions = {},
): Promise<StartedLocalDevPgserve> {
  const { detach = false, emitReadyMarker = true } = options;
  const dataDir = path.resolve(
    getStringArg(args, PgserveCliArgKey.DataDir) ?? getDefaultPgserveDataDir(),
  );
  const databaseName = getStringArg(args, PgserveCliArgKey.Database) ?? DEFAULT_DATABASE_NAME;
  const portArg = getStringArg(args, PgserveCliArgKey.Port);
  const port = parseStrictPort(portArg, `Invalid --port value: ${portArg}`);

  const existingConnection = await waitForReuseablePgserve({
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

  removeConnectionEnvFiles(args, dataDir);
  await stopLivePostmaster(dataDir);
  removeIncompletePgserveDataDir(dataDir);

  const portOptions = port === undefined ? { startPort: DEFAULT_PORT } : { port };

  const provider = createLocalDevPgserveProvider({
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
    const prismaDatabaseUrl = buildPrismaDatabaseUrl(postgresPort, databaseName);
    const env = {
      ...process.env,
      DATABASE_URL: databaseUrl,
      PRISMA_DATABASE_URL: prismaDatabaseUrl,
      PGSERVE_DATABASE_URL: databaseUrl,
      PGSERVE_HOST: getDatabaseHost(databaseUrl),
      PGSERVE_PORT: String(routerPort),
      PGSERVE_POSTGRES_PORT: String(postgresPort),
      PGSERVE_DATA_DIR: dataDir,
      PGSERVE_SOCKET_DIR: socketDir,
      PGSERVE_CONNECTION_ENV: getConnectionEnvPath(args),
      PRISMA_HIDE_UPDATE_MESSAGE: "true",
    };

    writeConnectionEnv({
      databaseUrl,
      dataDir,
      port: routerPort,
      postgresPort,
      prismaDatabaseUrl,
      socketDir,
    });
    const connection = readConnectionEnv(args);
    writeAppDbEnv(connection);
    printConnectionInfo(connection);

    if (emitReadyMarker) {
      printPgserveReadyMarker();
    }

    return {
      connectionEnvPath: getConnectionEnvPath(args),
      databaseUrl,
      dataDir,
      env,
      postgresPort,
      provider,
      routerPort,
    };
  } catch (error) {
    await stopProvider(provider);
    removeConnectionEnvFiles(args, dataDir);
    throw error;
  }
}

export function registerShutdown(
  provider: PgserveProvider | null,
  args: PgserveCliArgs = {},
  dataDir?: string,
) {
  const shutdown = async () => {
    await stopProvider(provider);
    removeConnectionEnvFiles(
      args,
      dataDir ??
        path.resolve(getStringArg(args, PgserveCliArgKey.DataDir) ?? getDefaultPgserveDataDir()),
    );
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}
