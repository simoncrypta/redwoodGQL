export { getStringArg, parseCliArgs, type CliArgs } from "./cli/parseArgs.ts";
export { parsePort, parseStrictPort, type ParsePortOptions } from "./port/parsePort.ts";
export {
  freeTcpPort,
  freeTcpPorts,
  getSignalExitCode,
  spawnParallelVpTasks,
  type SpawnParallelOptions,
} from "./process/index.ts";
export {
  createBinCommand,
  createBinResolver,
  mergeTasks,
  type Task,
  type TaskDefinition,
  type TaskPluginContext,
} from "./vite/index.ts";
