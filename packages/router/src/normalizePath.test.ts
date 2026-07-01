import { describe, expect, it } from "vite-plus/test";

import { normalizeRedwoodPath } from "./normalizePath.js";

describe("normalizeRedwoodPath", () => {
  it("converts Redwood path params to RWSdk colon params", () => {
    expect(normalizeRedwoodPath("/contacts/{id:Int}")).toBe("/contacts/:id");
    expect(normalizeRedwoodPath("/posts/{id:Int}/edit")).toBe("/posts/:id/edit");
    expect(normalizeRedwoodPath("/waterfall/{id}")).toBe("/waterfall/:id");
  });

  it("leaves static paths unchanged", () => {
    expect(normalizeRedwoodPath("/about")).toBe("/about");
  });
});
