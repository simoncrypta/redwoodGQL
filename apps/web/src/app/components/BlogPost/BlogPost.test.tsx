import { render } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";

import BlogPost from "./BlogPost";

describe("BlogPost", () => {
  it("renders successfully", () => {
    expect(() => {
      render(<BlogPost blogPost={undefined} />);
    }).not.toThrow();
  });
});
