import fs from "node:fs";
import path from "node:path";

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

export function hasLivePostmaster(dataDir: string): boolean {
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

export async function stopLivePostmaster(dataDir: string): Promise<void> {
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
