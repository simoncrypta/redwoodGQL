import { describe, expect, it } from "vite-plus/test";

import { defineRoutes } from "./defineRoutes.js";
import { Route, Router } from "./routeTree.js";

const HomePage = () => null;

describe("defineRoutes", () => {
  it("derives named routes from the route tree", () => {
    const appRoutes = defineRoutes(
      <Router>
        <Route path="/login" page={HomePage} name="login" />
        <Route path="/" page={HomePage} name="home" />
      </Router>,
    );

    expect(appRoutes.routes.login()).toBe("/login");
    expect(appRoutes.routes.home()).toBe("/");
  });
});
