import { apiFetch } from "./api";

/**
 * Review Service — create, fetch, and like reviews.
 *
 * Error handling:
 * - Errors propagate (no try/catch) — callers can display error UI. ✅
 * - Raw server messages are passed through — not user-friendly.
 *   TODO: Map common codes (409 → "You already reviewed this track").
 *
 * Auth note:
 * - `getAuthHeaders()` manually reads `localStorage` for the token.
 *   This is redundant since `apiFetch` already sends cookies via
 *   `credentials: "include"`. The cookie-based auth (set by login
 *   controller) should be sufficient.
 *   TODO: Remove manual token headers if cookie auth is the standard.
 */

/**
 * Manually attaches the access token from localStorage as a Bearer header.
 * ⚠️ Redundant with cookie-based auth in apiFetch — kept for backwards
 * compatibility but should be consolidated.
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/** Fetch recent reviews (paginated). Errors propagate to caller. */
export const getRecentReviews = async () => {
  const data = await apiFetch("/reviews/recent", {
    headers: getAuthHeaders(),
  });
  return data;
};

/**
 * Create a new review. Throws on failure.
 * Possible errors: 400 (validation), 409 (already reviewed), 500.
 */
export const createReview = async (payload) => {
  const data = await apiFetch("/reviews", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return data?.review || null;
};

/**
 * Toggle like on a review. Throws if not authenticated (401).
 * Returns { liked: boolean, likes_count: number }.
 */
export const toggleReviewLike = async (reviewId) => {
  const data = await apiFetch(`/reviews/${reviewId}/like`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  return data;
};

/** Fetch all reviews for a specific track. */
export const getTrackReviews = async (trackId) => {
  const data = await apiFetch(`/reviews/track/${trackId}`, {
    headers: getAuthHeaders(),
  });

  return data?.reviews || [];
};

/** Fetch popular reviews (most liked) within a time window. */
export const getPopularReviews = async ({ limit = 4, days = 7 } = {}) => {
  const data = await apiFetch(`/reviews/popular?limit=${limit}&days=${days}`);
  return data?.reviews || [];
};

