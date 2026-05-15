/**
 * Base URL for all API requests.
 * All service files use `apiFetch` (below) which prepends this automatically.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

/** Normalises a path to always start with "/" and prepends API_BASE_URL. */
const buildUrl = (path) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

/**
 * Centralised fetch wrapper — every API call in the app goes through here.
 *
 * What it does:
 * 1. Builds the full URL from a relative path (e.g. "/reviews/recent").
 * 2. Sets default headers (Content-Type: JSON) and credentials (cookies).
 * 3. Parses the response as JSON or text depending on content-type.
 * 4. If the HTTP status is not 2xx (`!response.ok`), throws an Error with
 *    the server's message so callers can catch and display it.
 *
 * Error handling notes:
 * - Throws a plain `Error` — callers cannot read `error.status` or
 *   `error.code` to distinguish 401 (auth) from 404 (not found) from 500.
 *   TODO: Throw a custom `ApiError(message, status, code)` instead so
 *   components can show different UI for different failure types.
 * - Network failures (server down, no internet) throw a TypeError from
 *   `fetch()` itself — these are NOT caught here and bubble up as-is.
 *   TODO: Wrap in try/catch and re-throw as a friendlier error.
 *
 * @param {string} path    - Relative API path (e.g. "/auth/me")
 * @param {object} options - Standard fetch options (method, body, headers, etc.)
 * @returns {Promise<any>}   Parsed response data on success
 * @throws {Error}           On non-2xx HTTP responses
 */
export const apiFetch = async (path, options = {}) => {
  const { headers, credentials, ...restOptions } = options;
  const response = await fetch(buildUrl(path), {
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
    credentials: credentials || "include",
    ...restOptions,
  });

  // Parse response body — handle both JSON and plain text responses
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  // If the server returned an error status (4xx/5xx), throw so callers
  // can catch it. The message is extracted from the server's JSON body,
  // falling back to a generic string with the HTTP status code.
  // NOTE: This throws a plain Error — status code is lost. Components
  // currently cannot tell "401 session expired" from "500 server crash".
  if (!response.ok) {
    const message =
      typeof data === "object" && data && (data.message || data.error)
        ? data.message || data.error
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
};
