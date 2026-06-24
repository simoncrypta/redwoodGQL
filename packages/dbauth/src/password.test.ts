import { describe, expect, it } from "vite-plus/test";

import { decryptSession, encryptSession } from "./cookie.js";
import { hashPassword, verifyPassword } from "./password.js";

describe("password", () => {
  it("hashes and verifies passwords", () => {
    const { hashedPassword, salt } = hashPassword("password");

    expect(verifyPassword("password", salt, hashedPassword)).toBe(true);
    expect(verifyPassword("wrong", salt, hashedPassword)).toBe(false);
  });
});

describe("cookie", () => {
  it("round-trips session payloads", () => {
    const secret = "test-secret";
    const encrypted = encryptSession({ id: 42 }, secret);
    const session = decryptSession(encrypted, secret);

    expect(session).toEqual({ id: 42 });
  });
});
