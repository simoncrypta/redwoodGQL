import type { TaskDefinition, TaskPluginContext } from "@rwgql/task-core/vite";

import { buildPgserveConfigArg } from "./config/resolveConfig.ts";
import type { PgserveDevConfig } from "./types.ts";

function pgserveTaskCommand(
  ctx: TaskPluginContext,
  cliName: string,
  config: PgserveDevConfig,
): string {
  return `tsx ${ctx.bin(cliName)} ${buildPgserveConfigArg(config)}`;
}

export function createPgserveTasks(
  config: PgserveDevConfig,
  ctx: TaskPluginContext,
): Record<string, TaskDefinition> {
  const tasks: Record<string, TaskDefinition> = {
    pgserve: {
      command: pgserveTaskCommand(ctx, "rwgql-pgserve-start", config),
      cache: false,
    },
    prepare: {
      command: pgserveTaskCommand(ctx, "rwgql-pgserve-ensure", config),
      dependsOn: ["generate"],
      cache: false,
    },
  };

  if (config.appEnvPath && config.appEnvAdapter) {
    tasks["setup-env"] = {
      command: pgserveTaskCommand(ctx, "rwgql-pgserve-setup-env", config),
      input: [config.configModule],
    };
  }

  return tasks;
}

export function createDevPrepareTask(
  config: PgserveDevConfig,
  ctx: TaskPluginContext,
): Record<string, TaskDefinition> {
  return {
    "dev:prepare": {
      command: pgserveTaskCommand(ctx, "rwgql-pgserve-dev-prepare", config),
      cache: false,
    },
  };
}
