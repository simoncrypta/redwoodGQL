import { render } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";

import Author from "./Author";

const author = {
  email: "test.user@email.com",
  fullName: "Test User",
};

describe("Author", () => {
  it("renders successfully", () => {
    expect(() => {
      render(<Author author={author} />);
    }).not.toThrow();
  });
});
