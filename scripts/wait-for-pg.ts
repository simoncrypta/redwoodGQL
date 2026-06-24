const DEFAULT_DATABASE_URL = "postgresql://localhost:8432/redwoodgql";
const DEFAULT_TIMEOUT_MS = 30_000;
const POLL_INTERVAL_MS = 250;

const parseDatabaseUrl = (databaseUrl: string) => {
  const url = new URL(databaseUrl);
  const port = url.port ? Number(url.port) : 5432;

  if (!Number.isFinite(port)) {
    throw new Error(`Invalid DATABASE_URL port: ${url.port}`);
  }

  return {
    host: url.hostname,
    port,
  };
};

const waitForPostgres = async (host: string, port: number, timeoutMs: number) => {
  const net = await import("node:net");
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const connected = await new Promise<boolean>((resolve) => {
      const socket = net.createConnection({ host, port });

      socket.setTimeout(POLL_INTERVAL_MS);
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

    if (connected) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error(`Timed out waiting for PostgreSQL at ${host}:${port}`);
};

const databaseUrl = process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL;
const { host, port } = parseDatabaseUrl(databaseUrl);

await waitForPostgres(host, port, DEFAULT_TIMEOUT_MS);
console.info(`PostgreSQL is ready at ${host}:${port}`);
