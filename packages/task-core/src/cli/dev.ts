import { spawnParallelVpTasks } from "../process/spawnParallel.ts";

const tasksArg = process.env.RWGQL_DEV_TASKS;

if (!tasksArg) {
  console.error("RWGQL_DEV_TASKS environment variable is required");
  process.exit(1);
}

const tasks = tasksArg
  .split(",")
  .map((task) => task.trim())
  .filter(Boolean);

if (tasks.length === 0) {
  console.error("RWGQL_DEV_TASKS must contain at least one task");
  process.exit(1);
}

spawnParallelVpTasks(tasks);
