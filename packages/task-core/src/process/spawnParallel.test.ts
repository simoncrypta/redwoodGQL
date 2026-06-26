import { describe, expect, it } from "vite-plus/test";

import { getSignalExitCode, parseTaskList, shouldRunStopTasks } from "./spawnParallel.ts";

describe("spawnParallel helpers", () => {
  it("maps SIGINT to exit code 130", () => {
    expect(getSignalExitCode("SIGINT")).toBe(130);
  });

  it("maps SIGTERM to exit code 143", () => {
    expect(getSignalExitCode("SIGTERM")).toBe(143);
  });

  it("parses comma-separated task lists", () => {
    expect(parseTaskList("db#dev:stop, graphql#dev")).toEqual(["db#dev:stop", "graphql#dev"]);
    expect(parseTaskList(undefined)).toEqual([]);
    expect(parseTaskList("  ")).toEqual([]);
  });

  it("runs stop tasks on interrupt or non-zero exit", () => {
    const stopTasks = ["db#dev:stop"];

    expect(shouldRunStopTasks(true, 0, stopTasks)).toBe(true);
    expect(shouldRunStopTasks(false, 1, stopTasks)).toBe(true);
    expect(shouldRunStopTasks(false, 0, stopTasks)).toBe(false);
    expect(shouldRunStopTasks(true, 0, [])).toBe(false);
  });
});
