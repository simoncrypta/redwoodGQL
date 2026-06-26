import type { TaskDefinition } from "./types.ts";

export function mergeTasks(
  ...taskGroups: Array<Record<string, TaskDefinition>>
): Record<string, TaskDefinition> {
  return Object.assign({}, ...taskGroups);
}
