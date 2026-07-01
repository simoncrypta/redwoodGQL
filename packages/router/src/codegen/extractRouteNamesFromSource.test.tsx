import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vite-plus/test";

import {
  extractRouteNamesFromSource,
  routeNameEntriesFromTree,
} from "./extractRouteNamesFromSource.js";
import { routeNamesFromTree, Private, Route, Router, Set } from "../routeTree.js";

const HomePage = () => null;

describe("extractRouteNamesFromSource", () => {
  it("matches routeNamesFromTree for a Redwood-style route tree", () => {
    const routeTree = (
      <Router>
        <Route path="/login" page={HomePage} name="login" />
        <Set wrap={() => null} title="Contacts">
          <Private unauthenticated="login">
            <Route path="/contacts/{id:Int}" page={HomePage} name="contact" />
          </Private>
        </Set>
        <Route path="/" page={HomePage} name="home" />
        <Route notfound page={HomePage} />
      </Router>
    );

    const source = `
      const routeTree = (
        <Router>
          <Route path="/login" page={LoginPage} name="login" />
          <Set wrap={ScaffoldLayout} title="Contacts">
            <Private unauthenticated="login">
              <Route path="/contacts/{id:Int}" page={ContactPage} name="contact" />
            </Private>
          </Set>
          <Route path="/" page={HomePage} name="home" />
          <Route notfound page={NotFoundPage} />
        </Router>
      );
    `;

    expect(extractRouteNamesFromSource(source)).toEqual(
      routeNameEntriesFromTree(routeNamesFromTree(routeTree)),
    );
  });

  it("matches routeNamesFromTree for apps/web Routes.tsx", () => {
    const routesFile = path.resolve(process.cwd(), "../../apps/web/src/Routes.tsx");
    const source = readFileSync(routesFile, "utf8");

    expect(extractRouteNamesFromSource(source, routesFile).map(({ name }) => name)).toEqual([
      "double",
      "login",
      "signup",
      "forgotPassword",
      "resetPassword",
      "newContact",
      "editContact",
      "contact",
      "contacts",
      "newPost",
      "editPost",
      "post",
      "posts",
      "waterfall",
      "profile",
      "blogPost",
      "contactUs",
      "about",
      "home",
      "notFound",
    ]);
  });
});
