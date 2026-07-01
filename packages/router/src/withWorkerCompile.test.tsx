import { describe, expect, it, vi } from "vite-plus/test";

import { defineRoutes } from "./defineRoutes.js";
import { Private, Route, Router, Set } from "./routeTree.js";
import { withWorkerCompile } from "./withWorkerCompile.js";

const HomePage = () => null;
const BlogLayout = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;

describe("withWorkerCompile", () => {
  it("adds compile to defined routes", () => {
    const appRoutes = withWorkerCompile(
      defineRoutes(
        <Router>
          <Route path="/login" page={HomePage} name="login" />
          <Set wrap={BlogLayout}>
            <Route path="/" page={HomePage} name="home" />
            <Private unauthenticated="login">
              <Route path="/posts/{id:Int}" page={HomePage} name="post" />
            </Private>
          </Set>
        </Router>,
      ),
    );

    const renderPage = vi.fn((_requestInfo, children) => new Response(String(children)));
    const { routes, workerRoutes } = appRoutes.compile({
      isAuthenticated: () => false,
      parseRouteId: () => 2,
      renderPage,
    });

    expect(routes).toBe(appRoutes.routes);
    expect(workerRoutes).toHaveLength(3);
  });
});
