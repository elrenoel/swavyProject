import { apiFetch } from "./api";

/**
 * List Service — CRUD operations for user-created song lists.
 *
 * Error handling:
 * - Unlike spotify.js, these functions do NOT catch errors — they let
 *   the ApiError propagate to the calling component/context. This is the
 *   correct pattern because it allows the UI to show error feedback.
 * - However, the raw error messages from the server (e.g. "duplicate key
 *   value violates unique constraint") are not user-friendly.
 *   TODO: Add a mapping layer or let the backend return clean messages.
 * - Possible error codes from backend:
 *   • 400 — validation (missing title, missing song_id)
 *   • 404 — list or song not found
 *   • 409 — duplicate song in list
 *   • 500 — unexpected server error
 */

export const getAllLists = async () => {
  const data = await apiFetch("/lists");
  return data?.lists || [];
};

export const getListById = async (listId) => {
  const data = await apiFetch(`/lists/${listId}`);
  return data?.list || null;
};

/** Create a new list. Throws on failure (caller must try/catch). */
export const createList = async ({ title, desc }) => {
  const data = await apiFetch("/lists", {
    method: "POST",
    body: JSON.stringify({ title, desc }),
  });

  return data?.list || null;
};

/** Add a song to a list. May throw 409 if the song is already in the list. */
export const addSongToList = async (listId, song) => {
  const data = await apiFetch(`/lists/${listId}/songs`, {
    method: "POST",
    body: JSON.stringify(song),
  });

  return data?.song || null;
};

/** Remove a song from a list. Throws 404 if song/list not found. */
export const removeSongFromList = async (listId, songId) => {
  const data = await apiFetch(`/lists/${listId}/songs/${songId}`, {
    method: "DELETE",
  });

  return data || null;
};

