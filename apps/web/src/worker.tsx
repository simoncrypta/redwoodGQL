import type { ReactNode } from "react";
import { route } from "rwsdk/router";
import { defineApp, type RequestInfo } from "rwsdk/worker";
import { createAuthDecoder } from "@rwgql/dbauth/decoder";
import {
  createApolloRwsdkTransportId,
  renderApolloRwsdkRscStream,
  renderApolloRwsdkStream,
} from "@rwgql/rwsdk-apollo-client/worker";

import { ApolloShell } from "@/app/apollo/ApolloShell";
import { Document } from "@/app/document";
import { setCommonHeaders } from "@/app/headers";
import BlogLayout from "@/app/layouts/BlogLayout/BlogLayout";
import ScaffoldLayout from "@/app/layouts/ScaffoldLayout/ScaffoldLayout";
import AboutPage from "@/app/pages/AboutPage/AboutPage";
import BlogPostPage from "@/app/pages/BlogPostPage/BlogPostPage";
import ContactPage from "@/app/pages/Contact/ContactPage/ContactPage";
import ContactsPage from "@/app/pages/Contact/ContactsPage/ContactsPage";
import EditContactPage from "@/app/pages/Contact/EditContactPage/EditContactPage";
import NewContactPage from "@/app/pages/Contact/NewContactPage/NewContactPage";
import ContactUsPage from "@/app/pages/ContactUsPage/ContactUsPage";
import DoublePage from "@/app/pages/DoublePage/DoublePage";
import ForgotPasswordPage from "@/app/pages/ForgotPasswordPage/ForgotPasswordPage";
import HomePage from "@/app/pages/HomePage/HomePage";
import LoginPage from "@/app/pages/LoginPage/LoginPage";
import NotFoundPage from "@/app/pages/NotFoundPage/NotFoundPage";
import EditPostPage from "@/app/pages/Post/EditPostPage/EditPostPage";
import NewPostPage from "@/app/pages/Post/NewPostPage/NewPostPage";
import PostPage from "@/app/pages/Post/PostPage/PostPage";
import PostsPage from "@/app/pages/Post/PostsPage/PostsPage";
import ProfilePage from "@/app/pages/ProfilePage/ProfilePage";
import ResetPasswordPage from "@/app/pages/ResetPasswordPage/ResetPasswordPage";
import SignupPage from "@/app/pages/SignupPage/SignupPage";
import WaterfallPage from "@/app/pages/WaterfallPage/WaterfallPage";

export type Session = {
  readonly id: number;
};

export type AppContext = {
  session: Session | null;
};

type IdParams = {
  readonly id: string;
};

// Must match the dbAuth cookie name configured in apps/graphql (src/lib/auth.ts).
const cookieName = "session_8911";

const authDecoder = createAuthDecoder({
  cookieName,
  secret: import.meta.env.DB_AUTH_SECRET,
});

const sessionMiddleware = ({ ctx, request }: RequestInfo) => {
  ctx.session = authDecoder(request);
};

const requireAuth = ({ ctx, request }: RequestInfo) => {
  if (!ctx.session) {
    const requestUrl = new URL(request.url);
    const loginUrl = new URL("/login", requestUrl);
    loginUrl.searchParams.set("redirectTo", `${requestUrl.pathname}${requestUrl.search}`);

    return new Response(null, {
      headers: { Location: `${loginUrl.pathname}${loginUrl.search}` },
      status: 302,
    });
  }
};

const defaultDevGraphqlUrl = "http://localhost:8911/graphql";

const resolveGraphqlUrl = () => {
  if (import.meta.env.VITE_GRAPHQL_URL) {
    return import.meta.env.VITE_GRAPHQL_URL;
  }

  if (import.meta.env.DEV) {
    return defaultDevGraphqlUrl;
  }

  throw new Error(
    "VITE_GRAPHQL_URL must point at the apps/graphql endpoint (for example https://api.example.com/graphql).",
  );
};

const routeId = ({ params }: RequestInfo<IdParams>) => Number.parseInt(params.id, 10);

const isRscNavigationRequest = (request: Request) => {
  const url = new URL(request.url);
  return url.searchParams.has("__rsc");
};

const renderPage = async (requestInfo: RequestInfo, children: ReactNode) => {
  const apolloTransportId = createApolloRwsdkTransportId();
  const graphqlUrl = resolveGraphqlUrl();
  const page = (
    <ApolloShell
      graphqlUrl={graphqlUrl}
      nonce={requestInfo.rw.nonce}
      transportId={apolloTransportId}
    >
      {children}
    </ApolloShell>
  );

  if (isRscNavigationRequest(requestInfo.request)) {
    const stream = await renderApolloRwsdkRscStream(page, { requestInfo });

    return new Response(stream, {
      headers: {
        "content-type": "text/x-component; charset=utf-8",
      },
    });
  }

  const stream = await renderApolloRwsdkStream(page, {
    Document,
    requestInfo,
    transportId: apolloTransportId,
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
};

const renderBlogPage = (requestInfo: RequestInfo, children: ReactNode) =>
  renderPage(requestInfo, <BlogLayout>{children}</BlogLayout>);

const renderContactsPage = (requestInfo: RequestInfo, children: ReactNode) =>
  renderPage(
    requestInfo,
    <ScaffoldLayout
      buttonLabel="New Contact"
      buttonTo="newContact"
      title="Contacts"
      titleTo="contacts"
    >
      {children}
    </ScaffoldLayout>,
  );

const renderPostsPage = (requestInfo: RequestInfo, children: ReactNode) =>
  renderPage(
    requestInfo,
    <ScaffoldLayout buttonLabel="New Post" buttonTo="newPost" title="Posts" titleTo="posts">
      {children}
    </ScaffoldLayout>,
  );

export default defineApp([
  setCommonHeaders(),
  sessionMiddleware,
  route("/double", (requestInfo) => renderPage(requestInfo, <DoublePage />)),
  route("/login", (requestInfo) => renderPage(requestInfo, <LoginPage />)),
  route("/signup", (requestInfo) => renderPage(requestInfo, <SignupPage />)),
  route("/forgot-password", (requestInfo) => renderPage(requestInfo, <ForgotPasswordPage />)),
  route("/reset-password", (requestInfo) =>
    renderPage(requestInfo, <ResetPasswordPage resetToken="poc-reset-token" />),
  ),
  route("/contacts/new", [
    requireAuth,
    (requestInfo) => renderContactsPage(requestInfo, <NewContactPage />),
  ]),
  route("/contacts/:id/edit", [
    requireAuth,
    (requestInfo: RequestInfo<IdParams>) =>
      renderContactsPage(requestInfo, <EditContactPage id={routeId(requestInfo)} />),
  ]),
  route("/contacts/:id", [
    requireAuth,
    (requestInfo: RequestInfo<IdParams>) =>
      renderContactsPage(requestInfo, <ContactPage id={routeId(requestInfo)} />),
  ]),
  route("/contacts", [
    requireAuth,
    (requestInfo) => renderContactsPage(requestInfo, <ContactsPage />),
  ]),
  route("/posts/new", [
    requireAuth,
    (requestInfo) => renderPostsPage(requestInfo, <NewPostPage />),
  ]),
  route("/posts/:id/edit", [
    requireAuth,
    (requestInfo: RequestInfo<IdParams>) =>
      renderPostsPage(requestInfo, <EditPostPage id={routeId(requestInfo)} />),
  ]),
  route("/posts/:id", [
    requireAuth,
    (requestInfo: RequestInfo<IdParams>) =>
      renderPostsPage(requestInfo, <PostPage id={routeId(requestInfo)} />),
  ]),
  route("/posts", [requireAuth, (requestInfo) => renderPostsPage(requestInfo, <PostsPage />)]),
  route("/waterfall/:id", (requestInfo: RequestInfo<IdParams>) =>
    renderBlogPage(requestInfo, <WaterfallPage id={routeId(requestInfo)} />),
  ),
  route("/profile", [requireAuth, (requestInfo) => renderBlogPage(requestInfo, <ProfilePage />)]),
  route("/blog-post/:id", (requestInfo: RequestInfo<IdParams>) =>
    renderBlogPage(requestInfo, <BlogPostPage id={routeId(requestInfo)} />),
  ),
  route("/contact", (requestInfo) => renderBlogPage(requestInfo, <ContactUsPage />)),
  route("/about", (requestInfo) => renderBlogPage(requestInfo, <AboutPage />)),
  route("/", (requestInfo) => renderBlogPage(requestInfo, <HomePage />)),
  route("/*", (requestInfo) => renderBlogPage(requestInfo, <NotFoundPage />)),
]);
