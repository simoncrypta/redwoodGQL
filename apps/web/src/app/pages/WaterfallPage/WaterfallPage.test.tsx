import { render } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";

import WaterfallPage from "./WaterfallPage";

describe("WaterfallPage", () => {
  it("renders successfully", () => {
    expect(() => {
      render(<WaterfallPage id={42} />);
    }).not.toThrow();
  });
});
