import type { TaskDefinition, TaskPluginContext } from "@rwgql/task-core/vite";

import { buildPgserveConfigArg } from "./config/resolveConfig.ts";
import type { PgserveDevConfig } from "./types.ts";

function pgserveTaskCommand(
  ctx: TaskPluginContext,
  cliName: string,
  config: PgserveDevConfig,
): string {
  return `${ctx.bin(cliName)} ${buildPgserveConfigArg(config)}`;
}

export interface CreatePgserveTasksOptions {
  prepareDependsOn?: string[];
}

export function createPgserveTasks(
  config: PgserveDevConfig,
  ctx: TaskPluginContext,
  options: CreatePgserveTasksOptions = {},
): Record<string, TaskDefinition> {
  const prepareDependsOn = options.prepareDependsOn ?? [];

  const tasks: Record<string, TaskDefinition> = {
    pgserve: {
      command: pgserveTaskCommand(ctx, "rwgql-pgserve-start", config),
      cache: false,
    },
    prepare: {
      command: pgserveTaskCommand(ctx, "rwgql-pgserve-ensure", config),
      ...(prepareDependsOn.length > 0 ? { dependsOn: prepareDependsOn } : {}),
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
  options: { dependsOn?: string[] } = {},
): Record<string, TaskDefinition> {
  return {
    "dev:prepare": {
      command: pgserveTaskCommand(ctx, "rwgql-pgserve-dev-prepare", config),
      dependsOn: options.dependsOn ?? [],
      cache: false,
    },
  };
}

export function createDevStopTask(
  config: PgserveDevConfig,
  ctx: TaskPluginContext,
): Record<string, TaskDefinition> {
  return {
    "dev:stop": {
      command: pgserveTaskCommand(ctx, "rwgql-pgserve-stop", config),
      cache: false,
    },
  };
}
