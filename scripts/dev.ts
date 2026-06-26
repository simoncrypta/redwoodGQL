import { spawn, type ChildProcess } from "node:child_process";

const DEV_TASKS = ["rwsdk#dev", "graphql#dev", "graphql#codegen:watch"] as const;

const getSignalExitCode = (signal: NodeJS.Signals): number => (signal === "SIGINT" ? 130 : 143);

const spawnDevTask = (task: string): ChildProcess =>
  spawn("vp", ["run", task], {
    env: process.env,
    shell: process.platform === "win32",
    stdio: "inherit",
  });

function main() {
  const children = DEV_TASKS.map(spawnDevTask);
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

main();
