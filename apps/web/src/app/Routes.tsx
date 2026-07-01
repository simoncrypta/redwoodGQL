import { Private, Route, Router, Set } from "@rwgql/router/routes";
import type { DefinedRoutes } from "@rwgql/router/routes";

import { routes } from "@/app/routes";
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

const routeTree = (
  <Router>
    <Route path="/double" page={DoublePage} name="double" />
    <Route path="/login" page={LoginPage} name="login" />
    <Route path="/signup" page={SignupPage} name="signup" />
    <Route path="/forgot-password" page={ForgotPasswordPage} name="forgotPassword" />
    <Route
      path="/reset-password"
      name="resetPassword"
      render={(requestInfo) => {
        const resetToken = new URL(requestInfo.request.url).searchParams.get("resetToken") ?? "";
        return <ResetPasswordPage resetToken={resetToken} />;
      }}
    />
    <Set
      wrap={ScaffoldLayout}
      title="Contacts"
      titleTo="contacts"
      buttonLabel="New Contact"
      buttonTo="newContact"
    >
      <Private unauthenticated="login">
        <Route path="/contacts/new" page={NewContactPage} name="newContact" />
        <Route path="/contacts/{id:Int}/edit" page={EditContactPage} name="editContact" />
        <Route path="/contacts/{id:Int}" page={ContactPage} name="contact" />
        <Route path="/contacts" page={ContactsPage} name="contacts" />
      </Private>
    </Set>
    <Set
      wrap={ScaffoldLayout}
      title="Posts"
      titleTo="posts"
      buttonLabel="New Post"
      buttonTo="newPost"
    >
      <Private unauthenticated="login">
        <Route path="/posts/new" page={NewPostPage} name="newPost" />
        <Route path="/posts/{id:Int}/edit" page={EditPostPage} name="editPost" />
        <Route path="/posts/{id:Int}" page={PostPage} name="post" />
        <Route path="/posts" page={PostsPage} name="posts" />
      </Private>
    </Set>
    <Set wrap={BlogLayout}>
      <Route path="/waterfall/{id:Int}" page={WaterfallPage} name="waterfall" />
      <Private unauthenticated="login">
        <Route path="/profile" page={ProfilePage} name="profile" />
      </Private>
      <Route path="/blog-post/{id:Int}" page={BlogPostPage} name="blogPost" />
      <Route path="/contact" page={ContactUsPage} name="contactUs" />
      <Route path="/about" page={AboutPage} name="about" />
      <Route path="/" page={HomePage} name="home" />
      <Route notfound page={NotFoundPage} />
    </Set>
  </Router>
);

const appRoutes = { routes, routeTree } as DefinedRoutes;

export default appRoutes;

export { routes };

export type { WebRouteName } from "@/app/routes";
