import { db } from "db";
import type { DbAuthHandlerOptions } from "@rwgql/dbauth/server";

import { cookieName } from "../lib/auth.js";

export const dbAuthOptions: DbAuthHandlerOptions = {
  allowedUserFields: ["email", "id", "roles"],
  authFields: {
    hashedPassword: "hashedPassword",
    id: "id",
    resetToken: "resetToken",
    resetTokenExpiresAt: "resetTokenExpiresAt",
    salt: "salt",
    username: "email",
  },
  authModelAccessor: "user",
  cookie: {
    attributes: {
      HttpOnly: true,
      Path: "/",
      SameSite: "Lax",
      Secure: process.env.NODE_ENV === "production",
    },
    name: cookieName,
  },
  db: db as unknown as DbAuthHandlerOptions["db"],
  forgotPassword: {
    errors: {
      usernameNotFound: "Username not found",
      usernameRequired: "Username is required",
    },
    expires: 60 * 60 * 24,
    handler: (user) => user,
  },
  login: {
    errors: {
      incorrectPassword: "Incorrect password for ${username}",
      usernameNotFound: "Username ${username} not found",
      usernameOrPasswordMissing: "Both username and password are required",
    },
    expires: 60 * 60 * 24 * 365 * 10,
    handler: (user) => user,
  },
  resetPassword: {
    allowReusedPassword: true,
    errors: {
      resetTokenExpired: "resetToken is expired",
      resetTokenInvalid: "resetToken is invalid",
      resetTokenRequired: "resetToken is required",
      reusedPassword: "Must choose a new password",
    },
    handler: () => true,
  },
  signup: {
    errors: {
      fieldMissing: "${field} is required",
      usernameTaken: "Username `${username}` already in use",
    },
    handler: ({ hashedPassword, salt, userAttributes, username }) =>
      db.user.create({
        data: {
          email: username,
          fullName:
            typeof userAttributes["full-name"] === "string" ? userAttributes["full-name"] : "",
          hashedPassword,
          salt,
        },
      }),
    passwordValidation: () => true,
  },
};
