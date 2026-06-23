"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { navigate as rwsdkNavigate } from "rwsdk/client";

type RouteParams = {
  readonly id: number | string;
};

const withId = (path: string, { id }: RouteParams) => path.replace(":id", String(id));

export const routes = {
  about: () => "/about",
  blogPost: (params: RouteParams) => withId("/blog-post/:id", params),
  contact: (params: RouteParams) => withId("/contacts/:id", params),
  contacts: () => "/contacts",
  contactUs: () => "/contact",
  double: () => "/double",
  editContact: (params: RouteParams) => withId("/contacts/:id/edit", params),
  editPost: (params: RouteParams) => withId("/posts/:id/edit", params),
  forgotPassword: () => "/forgot-password",
  home: () => "/",
  login: () => "/login",
  newContact: () => "/contacts/new",
  newPost: () => "/posts/new",
  post: (params: RouteParams) => withId("/posts/:id", params),
  posts: () => "/posts",
  profile: () => "/profile",
  resetPassword: () => "/reset-password",
  signup: () => "/signup",
  waterfall: (params: RouteParams) => withId("/waterfall/:id", params),
} as const;

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  readonly children: ReactNode;
  readonly to: string;
};

export const Link = ({ to, children, ...props }: LinkProps) => (
  <a href={to} {...props}>
    {children}
  </a>
);

export const NavLink = ({
  activeClassName,
  className,
  ...props
}: LinkProps & { readonly activeClassName?: string }) => {
  const isActive = typeof window !== "undefined" && window.location.pathname === props.to;

  return <Link className={isActive ? (activeClassName ?? className) : className} {...props} />;
};

export const navigate = (to: string) => {
  void rwsdkNavigate(to);
};

export const useBlocker = (_options: { readonly when: boolean }) => ({
  abort: () => undefined,
  confirm: () => undefined,
  state: "IDLE",
});
