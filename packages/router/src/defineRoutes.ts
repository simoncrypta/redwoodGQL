import type { ReactNode } from "react";

import { createNamedRoutes } from "./namedRoutes.js";
import { routeNamesFromTree } from "./routeTree.js";

export const defineRoutes = (routeTree: ReactNode) => {
  const routes = createNamedRoutes(routeNamesFromTree(routeTree));

  return { routes, routeTree };
};

export type DefinedRoutes = ReturnType<typeof defineRoutes>;
