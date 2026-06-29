import { render } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";

import HomePage from "./HomePage";

describe("HomePage", () => {
  it("renders successfully", () => {
    expect(() => {
      render(<HomePage />);
    }).not.toThrow();
  });
});
