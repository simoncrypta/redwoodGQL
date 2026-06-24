import { parseCookieHeader, decryptSession, DEFAULT_DB_AUTH_SECRET } from "./cookie.js";

export const createAuthDecoder =
  ({
    cookieName,
    secret = process.env.DB_AUTH_SECRET ?? DEFAULT_DB_AUTH_SECRET,
  }: {
    cookieName: string;
    secret?: string;
  }) =>
  (request: Request): { id: number } | null => {
    const cookieValue = parseCookieHeader(request.headers.get("cookie"), cookieName);

    if (!cookieValue) {
      return null;
    }

    const session = decryptSession(cookieValue, secret);

    if (!session) {
      return null;
    }

    return { id: session.id };
  };
