import { describe, expect, it } from "vite-plus/test";

import { buildPrismaFallbackEnv } from "./syncAppEnv.ts";
import { formatAppEnvFile } from "./writeAppEnv.ts";

describe("setupAppEnvFallback", () => {
  it("builds fallback env from config defaults", () => {
    const variables = buildPrismaFallbackEnv({
      configModule: "apps/db/pgserve.config.ts",
      workspaceRoot: "/tmp",
      databaseName: "redwoodgql",
      defaultPort: 8432,
      dataDir: "/tmp/apps/db/.pgserve",
      pgserveBinPath: "/tmp/apps/db/node_modules/pgserve/bin/pgserve-wrapper.cjs",
      appEnvPath: "/tmp/apps/db/.env",
      appEnvAdapter: "prisma",
    });

    expect(variables.DATABASE_URL).toContain("8432/redwoodgql");
    expect(variables.PRISMA_DATABASE_URL).toContain("host=");
    expect(variables.PRISMA_HIDE_UPDATE_MESSAGE).toBe("true");
  });

  it("formats quoted env files", () => {
    expect(formatAppEnvFile({ FOO: "bar" })).toBe('FOO="bar"\n');
  });
});
