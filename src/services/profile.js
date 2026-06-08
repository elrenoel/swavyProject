import { apiFetch } from "./api";

/**
 * Profile Service — get, update, follow/unfollow user profiles.
 *
 * Error handling:
 * - All functions let errors propagate (no try/catch). ✅
 * - Callers (ProfileSection, ProfileEditModal) are responsible for
 *   catching errors and updating UI state.
 * - ⚠️ ProfileSection.handleSaveProfile currently has NO try/catch —
 *   if uploadProfileAvatar or updateProfile fails, the error is unhandled.
 *   TODO: Wrap handleSaveProfile in try/catch in ProfileSection.jsx.
 * - Possible error codes from backend:
 *   • 400 — validation (empty username/full_name, invalid avatar data)
 *   • 404 — profile not found
 *   • 500 — server error (Supabase storage, DB)
 */

/** Fetch a profile by username. Returns { profile, isFollowing, isMe }. */
export const getProfileByUsername = async (username) => {
  const data = await apiFetch(`/profiles/${encodeURIComponent(username)}`);
  return data;
};

/** Fetch the logged-in user's current profile record. */
export const getMyProfile = async () => {
  const data = await apiFetch("/profiles/me");
  return data?.profile || null;
};

/** Fetch profile statistics (reviews count, followers, following, lists). */
export const getProfileStats = async (username) => {
  const data = await apiFetch(
    `/profiles/${encodeURIComponent(username)}/stats`,
  );
  return data?.stats || null;
};

/** Fetch the user's highest-rated reviews (top picks). */
export const getProfileTopPicks = async (username, limit = 4) => {
  const data = await apiFetch(
    `/profiles/${encodeURIComponent(username)}/top-picks?limit=${limit}`,
  );
  return data?.reviews || [];
};

/** Fetch lists created by the user (paginated). */
export const getProfileLists = async (username, { limit = 4, offset = 0 }) => {
  const data = await apiFetch(
    `/profiles/${encodeURIComponent(username)}/lists?limit=${limit}&offset=${offset}`,
  );
  return data || { lists: [], total: 0 };
};

/**
 * Update profile fields (username, full_name).
 * ⚠️ Caller must try/catch — currently unhandled in ProfileSection.
 */
export const updateProfile = async ({ username, full_name }) => {
  const data = await apiFetch("/profiles/me", {
    method: "PATCH",
    body: JSON.stringify({ username, full_name }),
  });
  return data?.profile || null;
};

/**
 * Upload a new avatar (base64 data URL).
 * ⚠️ Caller must try/catch — currently unhandled in ProfileSection.
 */
export const uploadProfileAvatar = async (avatarDataUrl) => {
  const data = await apiFetch("/profiles/me/avatar", {
    method: "POST",
    body: JSON.stringify({ avatarDataUrl }),
  });
  return data?.profile || null;
};

/** Follow a user. Throws on failure. */
export const followProfile = async (username) => {
  const data = await apiFetch(
    `/profiles/${encodeURIComponent(username)}/follow`,
    {
      method: "POST",
    },
  );
  return data;
};

/** Unfollow a user. Throws on failure. */
export const unfollowProfile = async (username) => {
  const data = await apiFetch(
    `/profiles/${encodeURIComponent(username)}/follow`,
    {
      method: "DELETE",
    },
  );
  return data;
};
