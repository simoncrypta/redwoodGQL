import type { ReactNode } from "react";
import { route } from "rwsdk/router";
import { defineApp, type RequestInfo } from "rwsdk/worker";
import { createApolloRwsdkTransportId, renderApolloRwsdkStream } from "@rwsdk/apollo/worker";

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

export type AppContext = {};

type IdParams = {
  readonly id: string;
};

const defaultDevGraphqlUrl = "http://localhost:8911/graphql";

const resolveGraphqlUrl = (requestUrl: string) =>
  import.meta.env.VITE_GRAPHQL_URL ??
  (import.meta.env.DEV ? defaultDevGraphqlUrl : new URL("/graphql", requestUrl).toString());

const routeId = ({ params }: RequestInfo<IdParams>) => Number.parseInt(params.id, 10);

const renderPage = async (requestInfo: RequestInfo, children: ReactNode) => {
  const apolloTransportId = createApolloRwsdkTransportId();
  const graphqlUrl = resolveGraphqlUrl(requestInfo.request.url);
  const stream = await renderApolloRwsdkStream(
    <ApolloShell
      graphqlUrl={graphqlUrl}
      nonce={requestInfo.rw.nonce}
      transportId={apolloTransportId}
    >
      {children}
    </ApolloShell>,
    {
      Document,
      requestInfo,
      transportId: apolloTransportId,
    },
  );

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
  route("/double", (requestInfo) => renderPage(requestInfo, <DoublePage />)),
  route("/login", (requestInfo) => renderPage(requestInfo, <LoginPage />)),
  route("/signup", (requestInfo) => renderPage(requestInfo, <SignupPage />)),
  route("/forgot-password", (requestInfo) => renderPage(requestInfo, <ForgotPasswordPage />)),
  route("/reset-password", (requestInfo) =>
    renderPage(requestInfo, <ResetPasswordPage resetToken="poc-reset-token" />),
  ),
  route("/contacts/new", (requestInfo) => renderContactsPage(requestInfo, <NewContactPage />)),
  route("/contacts/:id/edit", (requestInfo: RequestInfo<IdParams>) =>
    renderContactsPage(requestInfo, <EditContactPage id={routeId(requestInfo)} />),
  ),
  route("/contacts/:id", (requestInfo: RequestInfo<IdParams>) =>
    renderContactsPage(requestInfo, <ContactPage id={routeId(requestInfo)} />),
  ),
  route("/contacts", (requestInfo) => renderContactsPage(requestInfo, <ContactsPage />)),
  route("/posts/new", (requestInfo) => renderPostsPage(requestInfo, <NewPostPage />)),
  route("/posts/:id/edit", (requestInfo: RequestInfo<IdParams>) =>
    renderPostsPage(requestInfo, <EditPostPage id={routeId(requestInfo)} />),
  ),
  route("/posts/:id", (requestInfo: RequestInfo<IdParams>) =>
    renderPostsPage(requestInfo, <PostPage id={routeId(requestInfo)} />),
  ),
  route("/posts", (requestInfo) => renderPostsPage(requestInfo, <PostsPage />)),
  route("/waterfall/:id", (requestInfo: RequestInfo<IdParams>) =>
    renderBlogPage(requestInfo, <WaterfallPage id={routeId(requestInfo)} />),
  ),
  route("/profile", (requestInfo) => renderBlogPage(requestInfo, <ProfilePage />)),
  route("/blog-post/:id", (requestInfo: RequestInfo<IdParams>) =>
    renderBlogPage(requestInfo, <BlogPostPage id={routeId(requestInfo)} />),
  ),
  route("/contact", (requestInfo) => renderBlogPage(requestInfo, <ContactUsPage />)),
  route("/about", (requestInfo) => renderBlogPage(requestInfo, <AboutPage />)),
  route("/", (requestInfo) => renderBlogPage(requestInfo, <HomePage />)),
  route("/*", (requestInfo) => renderBlogPage(requestInfo, <NotFoundPage />)),
]);
