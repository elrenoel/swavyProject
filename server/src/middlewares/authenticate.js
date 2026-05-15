import { supabase, createUserClient } from "../config/supabase.js";

/**
 * Extracts the access token from the request.
 * Checks the Authorization header first (Bearer scheme), then falls back
 * to the `access_token` cookie set during login.
 */
const extractAccessToken = (req) => {
  const authHeader = req.headers.authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length).trim();
  }

  return req.cookies?.access_token || null;
};

/**
 * Authentication middleware — protects routes that require a logged-in user.
 *
 * Flow:
 * 1. Extract token from header or cookie.
 * 2. Validate it against Supabase Auth (`getUser`).
 * 3. If valid, attach `req.user`, `req.accessToken`, and a user-scoped
 *    Supabase client (`req.supabase`) for RLS-aware queries.
 * 4. If invalid, return 401.
 *
 * Error handling notes:
 * - All three failure paths (no token, invalid token, exception) return the
 *   same generic `{ error: "Unauthorized" }` — the client cannot distinguish
 *   "no token" from "expired token".
 * - No server-side logging on failures, making it hard to debug token issues.
 *   TODO: Add console.warn with request context on each failure path.
 * - TODO: Return structured response { status, message, code } to let the
 *   frontend show "Session expired" vs "Please log in" messages.
 */
const authenticate = async (req, res, next) => {
  try {
    const accessToken = extractAccessToken(req);

    // No token found in header or cookie → user is not authenticated
    if (!accessToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Validate token with Supabase — returns user data or an error
    // if the token is expired, revoked, or malformed
    const { data, error } = await supabase.auth.getUser(accessToken);
    if (error || !data?.user) {
      // Token exists but is invalid/expired
      // TODO: Log `error?.message` here to help debug token issues
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Token is valid — attach user context to the request for downstream use
    req.user = data.user;
    req.accessToken = accessToken;
    req.supabase = createUserClient(accessToken); // RLS-scoped client

    return next();
  } catch (error) {
    // Unexpected exception (e.g. Supabase unreachable)
    // TODO: Log the error with request context for debugging
    return res.status(401).json({ error: "Unauthorized" });
  }
};

export default authenticate;
