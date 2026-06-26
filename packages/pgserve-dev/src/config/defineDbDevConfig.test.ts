import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { describe, expect, it } from "vite-plus/test";

import { defineDbDevConfig } from "./defineDbDevConfig.ts";

const noopAdapter = {
  fromConnection: () => ({}),
  fallback: () => ({}),
};

describe("defineDbDevConfig", () => {
  it("applies package defaults from the config module location", () => {
    const workspaceParent = mkdtempSync(join(tmpdir(), "rwgql-"));
    const workspaceRoot = join(workspaceParent, "redwoodGQL");
    const dbDir = join(workspaceRoot, "apps", "db");
    const configPath = join(dbDir, "pgserve.config.ts");

    mkdirSync(dbDir, { recursive: true });
    writeFileSync(join(workspaceRoot, "package.json"), JSON.stringify({ name: "rwgql" }), "utf8");
    writeFileSync(join(dbDir, "package.json"), JSON.stringify({ name: "db" }), "utf8");

    const config = defineDbDevConfig(pathToFileURL(configPath).href, {
      appEnvAdapter: noopAdapter,
      workspaceLevelsUp: 2,
      pgserveBinPath: "apps/db/node_modules/pgserve/bin/pgserve-wrapper.cjs",
    });

    expect(config.configModule).toBe("apps/db/pgserve.config.ts");
    expect(config.databaseName).toBe("redwoodgql");
    expect(config.defaultPort).toBe(8432);
    expect(config.dataDir).toBe("apps/db/.pgserve");
    expect(config.appEnvPath).toBe("apps/db/.env");
    expect(config.devPorts).toEqual([8910, 8911, 8912, 8913]);
    expect(config.appEnvAdapter).toBe(noopAdapter);
    expect(config.pgserveBinPath).toBe("apps/db/node_modules/pgserve/bin/pgserve-wrapper.cjs");
  });

  it("resolves pgserve from the db package devDependencies", () => {
    const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
    const configPath = join(repoRoot, "apps/db/pgserve.config.ts");

    const config = defineDbDevConfig(pathToFileURL(configPath).href, {
      appEnvAdapter: noopAdapter,
    });

    expect(config.pgserveBinPath).toContain("pgserve/bin/pgserve-wrapper.cjs");
    expect(config.databaseName).toBe("redwoodgql");
  });
});
