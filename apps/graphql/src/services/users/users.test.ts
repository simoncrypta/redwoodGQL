import { beforeEach, describe, expect, it } from "vite-plus/test";

import { resetDatabase, seedUsersFixture } from "../../test/db.js";
import { user } from "./users.js";

describe("users", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("returns a single user", async () => {
    const fixture = await seedUsersFixture();
    const result = await user({ id: fixture.user.one.id });

    expect(result).toEqual({
      email: fixture.user.one.email,
      fullName: fixture.user.one.fullName,
      id: fixture.user.one.id,
      roles: fixture.user.one.roles,
    });
  });
});
