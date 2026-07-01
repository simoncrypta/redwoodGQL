import { createNamedRoutes } from "@rwgql/router/routes";

const routeDefinitions = [
  { name: "double", path: "/double" },
  { name: "login", path: "/login" },
  { name: "signup", path: "/signup" },
  { name: "forgotPassword", path: "/forgot-password" },
  { name: "resetPassword", path: "/reset-password" },
  { name: "newContact", path: "/contacts/new" },
  { name: "editContact", path: "/contacts/:id/edit" },
  { name: "contact", path: "/contacts/:id" },
  { name: "contacts", path: "/contacts" },
  { name: "newPost", path: "/posts/new" },
  { name: "editPost", path: "/posts/:id/edit" },
  { name: "post", path: "/posts/:id" },
  { name: "posts", path: "/posts" },
  { name: "waterfall", path: "/waterfall/:id" },
  { name: "profile", path: "/profile" },
  { name: "blogPost", path: "/blog-post/:id" },
  { name: "contactUs", path: "/contact" },
  { name: "about", path: "/about" },
  { name: "home", path: "/" },
  { name: "notFound", path: "/*" },
] as const;

export const routes = createNamedRoutes(routeDefinitions);

export type WebRouteName = keyof typeof routes;
