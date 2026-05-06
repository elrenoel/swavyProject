import { apiFetch } from "./api";

export const getAllLists = async () => {
  const data = await apiFetch("/lists");
  return data?.lists || [];
};

export const getListById = async (listId) => {
  const data = await apiFetch(`/lists/${listId}`);
  return data?.list || null;
};

export const createList = async ({ title, desc }) => {
  const data = await apiFetch("/lists", {
    method: "POST",
    body: JSON.stringify({ title, desc }),
  });

  return data?.list || null;
};

export const addSongToList = async (listId, song) => {
  const data = await apiFetch(`/lists/${listId}/songs`, {
    method: "POST",
    body: JSON.stringify(song),
  });

  return data?.song || null;
};

export const removeSongFromList = async (listId, songId) => {
  const data = await apiFetch(`/lists/${listId}/songs/${songId}`, {
    method: "DELETE",
  });

  return data || null;
};
