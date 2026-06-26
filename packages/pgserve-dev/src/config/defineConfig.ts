import path from "node:path";
import { fileURLToPath } from "node:url";

import type { PgserveDevConfig } from "../types.ts";

export interface DefinePgserveConfigOptions extends Omit<
  PgserveDevConfig,
  "workspaceRoot" | "configModule"
> {
  workspaceRoot?: string;
  /** Levels up from the config file directory to the workspace root. Defaults to 2 (apps/db). */
  workspaceLevelsUp?: number;
}

export function definePgserveConfig(
  moduleUrl: string,
  config: DefinePgserveConfigOptions,
): PgserveDevConfig {
  const configFilePath = fileURLToPath(moduleUrl);
  const configDir = path.dirname(configFilePath);
  const levelsUp = config.workspaceLevelsUp ?? 2;
  const workspaceRoot =
    config.workspaceRoot ??
    path.resolve(configDir, ...Array.from({ length: levelsUp }, () => ".."));

  const { workspaceLevelsUp: _workspaceLevelsUp, ...rest } = config;

  const appEnvPath = rest.appEnvPath ?? path.relative(workspaceRoot, path.join(configDir, ".env"));
  const configModule = path.relative(workspaceRoot, configFilePath);

  return {
    ...rest,
    workspaceRoot,
    configModule,
    appEnvPath,
  };
}
