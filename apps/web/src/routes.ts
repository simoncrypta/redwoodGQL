import { createNamedRoutes } from "@rwgql/router/routes";

import { routeDefinitions } from "@/routeDefinitions";

export { routeDefinitions };
export const routes = createNamedRoutes(routeDefinitions);
export type WebRouteName = keyof typeof routes;
