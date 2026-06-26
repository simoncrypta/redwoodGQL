import { spawn, spawnSync, type ChildProcess, type SpawnOptions } from "node:child_process";

export interface SpawnParallelOptions {
  command?: string;
  args?: string[];
  tasks?: string[];
  stopTasks?: readonly string[];
  spawnOptions?: Omit<SpawnOptions, "stdio">;
}

export const getSignalExitCode = (signal: NodeJS.Signals): number =>
  signal === "SIGINT" ? 130 : 143;

export function parseTaskList(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((task) => task.trim())
    .filter(Boolean);
}

export function shouldRunStopTasks(
  interrupted: boolean,
  exitCode: number,
  stopTasks: readonly string[],
): boolean {
  return stopTasks.length > 0 && (interrupted || exitCode !== 0);
}

const spawnTask = (
  command: string,
  args: string[],
  spawnOptions: Omit<SpawnOptions, "stdio">,
): ChildProcess =>
  spawn(command, args, {
    ...spawnOptions,
    stdio: "inherit",
  });

function runStopTasks(
  command: string,
  baseArgs: string[],
  stopTasks: readonly string[],
  spawnOptions: Omit<SpawnOptions, "stdio">,
): void {
  for (const task of stopTasks) {
    const result = spawnSync(command, [...baseArgs, task], {
      ...spawnOptions,
      stdio: "inherit",
    });

    if (result.error) {
      console.error(result.error);
      continue;
    }

    if (result.status !== 0 && result.status !== null) {
      console.error(`Stop task ${task} failed with exit code ${result.status}`);
    }
  }
}

export function spawnParallelVpTasks(
  tasks: readonly string[],
  options: Omit<SpawnParallelOptions, "tasks"> = {},
): void {
  const command = options.command ?? "vp";
  const baseArgs = options.args ?? ["run"];
  const stopTasks = options.stopTasks ?? parseTaskList(process.env.RWGQL_DEV_STOP_TASKS) ?? [];
  const spawnOptions = options.spawnOptions ?? {
    env: process.env,
    shell: process.platform === "win32",
  };

  const children = tasks.map((task) => spawnTask(command, [...baseArgs, task], spawnOptions));
  let exitCode = 0;
  let exited = 0;
  let interrupted = false;

  const forwardSignal = (signal: NodeJS.Signals) => {
    interrupted = true;
    for (const child of children) {
      if (!child.killed) {
        child.kill(signal);
      }
    }
  };

  const finish = () => {
    if (shouldRunStopTasks(interrupted, exitCode, stopTasks)) {
      runStopTasks(command, baseArgs, stopTasks, spawnOptions);
    }

    process.exit(exitCode);
  };

  process.once("SIGINT", () => forwardSignal("SIGINT"));
  process.once("SIGTERM", () => forwardSignal("SIGTERM"));

  for (const child of children) {
    child.on("error", (error) => {
      console.error(error);
      exitCode = 1;
    });

    child.on("exit", (code, signal) => {
      exited += 1;

      if (signal) {
        exitCode = getSignalExitCode(signal);
      } else if (code !== 0 && code !== null) {
        exitCode = code;
      }

      if (exited === children.length) {
        finish();
      }
    });
  }
}
