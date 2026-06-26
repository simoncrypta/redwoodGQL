import { spawn, type ChildProcess, type SpawnOptions } from "node:child_process";

export interface SpawnParallelOptions {
  command?: string;
  args?: string[];
  tasks?: string[];
  spawnOptions?: Omit<SpawnOptions, "stdio">;
}

export const getSignalExitCode = (signal: NodeJS.Signals): number =>
  signal === "SIGINT" ? 130 : 143;

const spawnTask = (
  command: string,
  args: string[],
  spawnOptions: Omit<SpawnOptions, "stdio">,
): ChildProcess =>
  spawn(command, args, {
    ...spawnOptions,
    stdio: "inherit",
  });

export function spawnParallelVpTasks(
  tasks: readonly string[],
  options: Omit<SpawnParallelOptions, "tasks"> = {},
): void {
  const command = options.command ?? "vp";
  const baseArgs = options.args ?? ["run"];
  const spawnOptions = options.spawnOptions ?? {
    env: process.env,
    shell: process.platform === "win32",
  };

  const children = tasks.map((task) => spawnTask(command, [...baseArgs, task], spawnOptions));
  let exitCode = 0;
  let exited = 0;

  const forwardSignal = (signal: NodeJS.Signals) => {
    for (const child of children) {
      if (!child.killed) {
        child.kill(signal);
      }
    }
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
        process.exit(exitCode);
      }
    });
  }
}
