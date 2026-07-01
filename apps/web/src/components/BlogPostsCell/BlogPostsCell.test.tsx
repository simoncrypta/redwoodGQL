import { render } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";

import { Empty, Failure, Loading, Success } from "./BlogPostsCell";
import { standard } from "./BlogPostsCell.mock";

describe("BlogPostsCell", () => {
  it("renders Loading successfully", () => {
    expect(() => {
      render(<Loading />);
    }).not.toThrow();
  });

  it("renders Empty successfully", () => {
    expect(() => {
      render(<Empty />);
    }).not.toThrow();
  });

  it("renders Failure successfully", () => {
    expect(() => {
      render(<Failure error={new Error("Oh no")} />);
    }).not.toThrow();
  });

  it("renders Success successfully", () => {
    expect(() => {
      render(<Success blogPosts={standard().blogPosts} />);
    }).not.toThrow();
  });
});
