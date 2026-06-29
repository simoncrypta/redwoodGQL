import { render } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";

import BlogPostPage from "./BlogPostPage";

describe("BlogPostPage", () => {
  it("renders successfully", () => {
    expect(() => {
      render(<BlogPostPage id={42} />);
    }).not.toThrow();
  });
});
