import { describe, expect, it, vi } from "vite-plus/test";

import { bindResolver, callService } from "./yoga.ts";

describe("bindResolver", () => {
  it("maps GraphQL args to callable service resolver args", async () => {
    const service = vi.fn(({ id }: { id: number }) => ({ id }));
    const resolver = bindResolver(service);

    await resolver({}, { id: 1 }, { userId: 2 }, {} as never);

    expect(service).toHaveBeenCalledWith({ id: 1 }, { root: {}, context: { userId: 2 }, info: {} });
  });
});

describe("callService", () => {
  it("invokes callable service resolvers with args and root", async () => {
    const service = vi.fn(({ id }: { id: number }) => ({ id }));
    const result = await callService(service, { id: 1 }, { title: "Post" });

    expect(service).toHaveBeenCalledWith(
      { id: 1 },
      { root: { title: "Post" }, context: undefined },
    );
    expect(result).toEqual({ id: 1 });
  });
});
