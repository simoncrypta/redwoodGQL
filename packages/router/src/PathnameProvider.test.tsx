import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vite-plus/test";

import { PathnameProvider, usePathname } from "./PathnameProvider.js";

const PathnameProbe = () => <span data-testid="pathname">{usePathname()}</span>;

describe("usePathname", () => {
  const originalPathname = window.location.pathname;

  afterEach(() => {
    window.history.pushState({}, "", originalPathname);
  });

  it("uses window.location.pathname on the client", () => {
    window.history.pushState({}, "", "/contact");

    render(
      <PathnameProvider pathname="/about">
        <PathnameProbe />
      </PathnameProvider>,
    );

    expect(screen.getByTestId("pathname")).toHaveTextContent("/contact");
  });
});
