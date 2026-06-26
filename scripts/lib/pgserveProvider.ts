import type { AddressInfo } from "node:net";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

import { loadPrismaClientConstructor } from "./prismaClient.ts";

const log = {
  debug(message: string) {
    if (process.env.PGSERVE_PROVIDER_DEBUG === "1") {
      console.debug(`[pgserve] ${message}`);
    }
  },
  info(message: string) {
    if (process.env.PGSERVE_PROVIDER_DEBUG === "1") {
      console.info(`[pgserve] ${message}`);
    }
  },
  error(message: string, error?: unknown) {
    console.error(`[pgserve] ${message}`, error ?? "");
  },
};

export type PgserveStorageMode = "memory" | "ram" | "persistent";

interface PgserveProviderBaseOptions {
  host?: string;
  databaseName: string;
  dataDir?: string | null;
  storageMode?: PgserveStorageMode;
  logLevel?: "error" | "warn" | "info" | "debug";
  env?: NodeJS.ProcessEnv;
  detach?: boolean;
}

type PgserveProviderPortOptions =
  | { port: number; startPort?: number }
  | { port?: undefined; startPort: number };

export type PgserveProviderOptions = PgserveProviderBaseOptions & PgserveProviderPortOptions;

type PgserveProviderOptionOverrides = Omit<PgserveProviderBaseOptions, "databaseName"> & {
  databaseName?: string;
  port?: number;
  startPort?: number;
};

const DEFAULT_HOST = "127.0.0.1";
const TEST_DATABASE_NAME = "template_test";
const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

async function findAvailablePort(startPort: number): Promise<number> {
  const net = await import("node:net");

  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(startPort, "127.0.0.1", () => {
      const address = server.address();
      const port =
        address && typeof address === "object" ? (address as AddressInfo).port : startPort;
      server.close(() => resolve(port));
    });
    server.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        findAvailablePort(startPort + 1)
          .then(resolve)
          .catch(reject);
      } else {
        reject(err);
      }
    });
  });
}

export function getDefaultPgserveDataDir(): string {
  return path.join(workspaceRoot, "apps/db/.pgserve");
}

function buildDatabaseUrl({
  host,
  port,
  databaseName,
}: {
  host: string;
  port: number;
  databaseName: string;
}): string {
  return `postgresql://postgres@${host}:${port}/${databaseName}`;
}

function getSocketDir(): string {
  return `${process.env.XDG_RUNTIME_DIR ?? `/run/user/${process.getuid?.() ?? 1000}`}/pgserve`;
}

function buildPrismaDatabaseUrl(port: number, databaseName: string): string {
  const socketDir = getSocketDir();
  return `postgresql://postgres@localhost:${port}/${databaseName}?host=${socketDir}&socket=${socketDir}`;
}

function quotePostgresIdentifier(identifier: string): string {
  return `"${identifier.replaceAll('"', '""')}"`;
}

const PGSERVE_POSTGRES_PORT_LOG_PATTERN = /"component":"postgres"[^}]*"port":(\d+)/;

function getPgserveBinPath(): string {
  return path.join(workspaceRoot, "apps/db/node_modules/pgserve/bin/pgserve-wrapper.cjs");
}

export class PgserveProvider {
  private server: ReturnType<typeof spawn> | null = null;
  private requestedPort: number | null = null;
  private actualPostgresPort: number | null = null;
  private databaseUrl: string | null = null;

  private readonly options: Required<Omit<PgserveProviderBaseOptions, "dataDir" | "env">> & {
    dataDir: string | null;
    port: number | null;
    startPort: number | null;
    env: NodeJS.ProcessEnv;
  };

  constructor(options: PgserveProviderOptions) {
    const storageMode = options.storageMode ?? (options.dataDir ? "persistent" : "ram");

    this.options = {
      host: options.host ?? DEFAULT_HOST,
      startPort: options.startPort ?? null,
      port: options.port ?? null,
      databaseName: options.databaseName,
      dataDir: options.dataDir ?? null,
      storageMode,
      logLevel: options.logLevel ?? "info",
      env: options.env ?? process.env,
      detach: options.detach ?? false,
    };
  }

  private getEffectivePort(): number {
    const port = this.actualPostgresPort ?? this.requestedPort;
    if (!port) {
      throw new Error("Pgserve port not initialized");
    }
    return port;
  }

  private getReadinessUrl(): string {
    return buildDatabaseUrl({
      host: this.options.host,
      port: this.getEffectivePort(),
      databaseName: "postgres",
    });
  }

  private buildDatabaseUrl(databaseName = this.options.databaseName): string {
    return buildDatabaseUrl({
      host: this.options.host,
      port: this.getEffectivePort(),
      databaseName,
    });
  }

  private buildRouterDatabaseUrl(databaseName = this.options.databaseName): string {
    if (!this.requestedPort) {
      throw new Error("Pgserve server not started");
    }

    return buildDatabaseUrl({
      host: this.options.host,
      port: this.requestedPort,
      databaseName,
    });
  }

  private async waitForDatabaseReady(): Promise<string> {
    if (!this.databaseUrl) {
      throw new Error("Pgserve database URL not initialized");
    }

    const maxAttempts = 30;
    const { host, port } = (() => {
      const url = new URL(this.getReadinessUrl());
      return {
        host: url.hostname,
        port: Number(url.port || 5432),
      };
    })();

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const connected = await this.canConnectViaTcp(host, port);
      if (connected) {
        log.info(`pgserve ready at ${host}:${port}`);
        return this.databaseUrl;
      }

      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    throw new Error(`pgserve failed to start at ${host}:${port}`);
  }

  private async canConnectViaTcp(host: string, port: number): Promise<boolean> {
    const net = await import("node:net");

    return new Promise((resolve) => {
      const socket = net.createConnection({ host, port });
      socket.setTimeout(250);
      socket.once("connect", () => {
        socket.end();
        resolve(true);
      });
      socket.once("timeout", () => {
        socket.destroy();
        resolve(false);
      });
      socket.once("error", () => {
        socket.destroy();
        resolve(false);
      });
    });
  }

  private getPrismaReadinessUrl(): string {
    return buildPrismaDatabaseUrl(this.getEffectivePort(), "postgres");
  }

  async ensureDatabaseExists(databaseName = this.options.databaseName): Promise<string> {
    const PrismaClient = loadPrismaClientConstructor();
    const prisma = new PrismaClient({
      datasources: { db: { url: this.getPrismaReadinessUrl() } },
    });

    try {
      const rows = (await prisma.$queryRaw`
        SELECT EXISTS(
          SELECT 1
          FROM pg_database
          WHERE datname = ${databaseName}
        ) AS "exists"
      `) as Array<{ exists: boolean }>;

      if (!rows[0]?.exists) {
        await prisma.$executeRawUnsafe(`CREATE DATABASE ${quotePostgresIdentifier(databaseName)}`);
      }

      return this.getDatabaseUrl(databaseName);
    } finally {
      await prisma.$disconnect().catch(() => undefined);
    }
  }

  async start(): Promise<string> {
    if (this.server) {
      throw new Error("Pgserve server already running");
    }

    this.requestedPort = await this.getRequestedPort();
    if (this.options.host !== DEFAULT_HOST) {
      throw new Error(
        `pgserve postmaster only binds localhost; unsupported host: ${this.options.host}`,
      );
    }

    const args: string[] = [
      "serve",
      "--port",
      String(this.requestedPort),
      "--log",
      this.options.logLevel,
    ];

    if (this.options.storageMode === "persistent") {
      const dataDir = this.options.dataDir ?? getDefaultPgserveDataDir();
      fs.mkdirSync(dataDir, { recursive: true });
      args.push("--data", dataDir);
    } else if (this.options.storageMode === "ram" && process.platform === "linux") {
      args.push("--ram");
    }

    log.info(
      `Starting pgserve (${this.options.storageMode}, requested port ${this.requestedPort})...`,
    );
    this.databaseUrl = this.buildRouterDatabaseUrl();

    return new Promise((resolve, reject) => {
      this.server = spawn(process.execPath, [getPgserveBinPath(), ...args], {
        stdio: this.options.detach ? "ignore" : ["ignore", "pipe", "pipe"],
        env: { ...this.options.env },
        detached: this.options.detach,
      });

      if (this.options.detach && this.server.pid) {
        this.server.unref();
      }

      let settled = false;

      const rejectIfPending = (error: Error) => {
        if (settled) {
          return;
        }

        settled = true;
        reject(error);
      };

      const resolveIfPending = (databaseUrl: string) => {
        if (settled) {
          return;
        }

        settled = true;
        resolve(databaseUrl);
      };

      let stdout = "";
      let stderr = "";

      this.server.stdout?.on("data", (data: Buffer) => {
        const chunk = data.toString();
        stdout += chunk;
        log.debug(`[pgserve stdout]: ${chunk.trim()}`);

        if (this.actualPostgresPort === null) {
          const match = stdout.match(PGSERVE_POSTGRES_PORT_LOG_PATTERN);
          if (match) {
            const detected = Number.parseInt(match[1]!, 10);
            if (Number.isFinite(detected)) {
              this.actualPostgresPort = detected;
              this.databaseUrl = this.buildDatabaseUrl();
              log.info(
                `pgserve Postgres listener detected on port ${detected} (requested port ${this.requestedPort})`,
              );
            }
          }
        }
      });

      this.server.stderr?.on("data", (data: Buffer) => {
        stderr += data.toString();
        log.debug(`[pgserve stderr]: ${data.toString().trim()}`);
      });

      this.server.on("error", (error: Error) => {
        log.error("Failed to start pgserve:", error);
        rejectIfPending(error);
      });

      this.server.on("exit", (code: number | null, signal: string | null) => {
        if (this.options.detach && settled) {
          return;
        }

        this.clearState();

        const exitMessage = signal
          ? `pgserve exited with signal ${signal}`
          : `pgserve exited with code ${code}`;
        log.error(exitMessage);
        log.error("stdout:", stdout);
        log.error("stderr:", stderr);

        if (settled) {
          return;
        }

        rejectIfPending(new Error(`${exitMessage}: ${stderr || stdout}`));
      });

      void this.waitForDatabaseReady()
        .then(resolveIfPending)
        .catch(async (error) => {
          await this.stop().catch(() => undefined);
          rejectIfPending(error);
        });
    });
  }

  private async getRequestedPort(): Promise<number> {
    if (this.options.port !== null) {
      return this.options.port;
    }

    if (this.options.startPort !== null) {
      return findAvailablePort(this.options.startPort);
    }

    throw new Error("PgserveProvider requires either port or startPort");
  }

  private clearState(): void {
    this.server = null;
    this.requestedPort = null;
    this.actualPostgresPort = null;
    this.databaseUrl = null;
  }

  getDatabaseUrl(databaseName = this.options.databaseName): string {
    return this.buildDatabaseUrl(databaseName);
  }

  getPort(): number {
    if (!this.requestedPort) {
      throw new Error("Pgserve server not started");
    }
    return this.requestedPort;
  }

  getPostgresPort(): number {
    return this.getEffectivePort();
  }

  isRunning(): boolean {
    return this.server !== null && this.server.exitCode === null;
  }

  async stop(): Promise<void> {
    if (!this.server) {
      return;
    }

    log.info("Stopping pgserve...");

    if (this.server.exitCode !== null || this.server.signalCode !== null) {
      this.clearState();
      return;
    }

    return new Promise((resolve) => {
      const killTimer = setTimeout(() => {
        if (this.server && !this.server.killed) {
          this.server.kill("SIGKILL");
        }
      }, 5000);

      this.server!.on("exit", () => {
        clearTimeout(killTimer);
        this.clearState();
        resolve();
      });

      this.server!.kill("SIGTERM");
    });
  }
}

export class PgserveTestProvider extends PgserveProvider {
  constructor(options: PgserveProviderOptionOverrides = {}) {
    const baseOptions = {
      host: options.host,
      databaseName: options.databaseName ?? TEST_DATABASE_NAME,
      dataDir: options.dataDir,
      storageMode: options.storageMode ?? "ram",
      logLevel: options.logLevel,
      env: options.env ?? { ...process.env, NODE_ENV: "test" },
      detach: options.detach,
    };

    if (options.port !== undefined) {
      super({
        ...baseOptions,
        startPort: options.startPort,
        port: options.port,
      });
      return;
    }

    super({
      ...baseOptions,
      startPort: options.startPort ?? 0,
    });
  }
}

export function createLocalDevPgserveProvider(options: PgserveProviderOptions): PgserveProvider {
  return new PgserveProvider({
    storageMode: "persistent",
    ...options,
  });
}
