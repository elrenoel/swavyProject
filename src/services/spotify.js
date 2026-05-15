import { apiFetch } from "./api";

/**
 * Fetch new album releases from the backend's Spotify proxy.
 *
 * Error handling:
 * - Catches ALL errors and returns an empty array `[]`.
 * - ⚠️ This means the calling component (NewReleasesSection) has NO WAY to
 *   distinguish "no new releases" from "API is down / network error".
 *   The UI always shows an empty state, never an error message.
 *   TODO: Remove try/catch here and let the error propagate so the
 *   component can set an `error` state and display an error UI.
 */
export const getNewReleases = async () => {
  try {
    const data = await apiFetch("/new-releases");
    return data;
  } catch (error) {
    console.error("Error pada Front-End:", error);
    return []; // ⚠️ Silently swallows error — UI cannot tell "empty" from "failed"
  }
};

/**
 * Search/discover tracks by keyword via the backend's Spotify proxy.
 *
 * Error handling:
 * - Same issue as getNewReleases — catches error and returns `[]`.
 * - ⚠️ DiscoverSection has no way to show an error message to the user.
 *   TODO: Let errors propagate to the caller.
 */
export const getDiscover = async (query = "top hit 2025") => {
  try {
    const data = await apiFetch(`/discover?q=${encodeURIComponent(query)}`);
    return data.tracks || [];
  } catch (error) {
    console.error("Error pada Front-End:", error);
    return []; // ⚠️ Silently swallows error
  }
};

