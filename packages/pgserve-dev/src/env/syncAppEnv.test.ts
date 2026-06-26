import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vite-plus/test";

import type { AppEnvAdapter, ResolvedPgserveConfig } from "../types.ts";
import { setupAppEnvFallback } from "./syncAppEnv.ts";
import { formatAppEnvFile, readAppEnvFile } from "./writeAppEnv.ts";

const testConfig = (appEnvPath: string, adapter: AppEnvAdapter): ResolvedPgserveConfig => ({
  configModule: "apps/db/pgserve.config.ts",
  workspaceRoot: "/tmp",
  databaseName: "redwoodgql",
  defaultPort: 8432,
  dataDir: "/tmp/apps/db/.pgserve",
  pgserveBinPath: "/tmp/apps/db/node_modules/pgserve/bin/pgserve-wrapper.cjs",
  appEnvPath,
  appEnvAdapter: adapter,
});

describe("syncAppEnv", () => {
  it("writes fallback env via adapter when connection env is missing", () => {
    const dir = mkdtempSync(join(tmpdir(), "pgserve-dev-"));
    const appEnvPath = join(dir, ".env");
    const adapter: AppEnvAdapter = {
      fromConnection: () => ({ FROM_CONNECTION: "yes" }),
      fallback: () => ({ FALLBACK: "yes" }),
    };

    setupAppEnvFallback(testConfig(appEnvPath, adapter));

    expect(readAppEnvFile(appEnvPath)).toEqual({ FALLBACK: "yes" });
  });

  it("formats quoted env files", () => {
    expect(formatAppEnvFile({ FOO: "bar" })).toBe('FOO="bar"\n');
  });
});
