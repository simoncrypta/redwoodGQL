import type { TaskDefinition } from "@rwgql/task-core/vite";

export interface CreatePrismaTasksOptions {
  schemaPath?: string;
  dependsOnSetupEnv?: string;
  dependsOnPrepare?: string;
}

export function createPrismaTasks(
  options: CreatePrismaTasksOptions = {},
): Record<string, TaskDefinition> {
  const schemaPath = options.schemaPath ?? "prisma/schema.prisma";
  const dependsOnSetupEnv = options.dependsOnSetupEnv ?? "setup-env";
  const dependsOnPrepare = options.dependsOnPrepare ?? "prepare";

  return {
    generate: {
      command: "prisma generate",
      dependsOn: [dependsOnSetupEnv],
      input: [schemaPath],
    },
    "migrate-deploy": {
      command: "prisma migrate deploy",
      dependsOn: [dependsOnPrepare],
      cache: false,
    },
  };
}
