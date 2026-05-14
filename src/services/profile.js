import { apiFetch } from "./api";

export const getProfileByUsername = async (username) => {
  const data = await apiFetch(`/profiles/${encodeURIComponent(username)}`);
  return data;
};

export const getProfileStats = async (username) => {
  const data = await apiFetch(
    `/profiles/${encodeURIComponent(username)}/stats`,
  );
  return data?.stats || null;
};

export const getProfileTopPicks = async (username, limit = 4) => {
  const data = await apiFetch(
    `/profiles/${encodeURIComponent(username)}/top-picks?limit=${limit}`,
  );
  return data?.reviews || [];
};

export const getProfileLists = async (username, { limit = 4, offset = 0 }) => {
  const data = await apiFetch(
    `/profiles/${encodeURIComponent(username)}/lists?limit=${limit}&offset=${offset}`,
  );
  return data || { lists: [], total: 0 };
};

export const updateProfile = async ({ username, full_name }) => {
  const data = await apiFetch("/profiles/me", {
    method: "PATCH",
    body: JSON.stringify({ username, full_name }),
  });
  return data?.profile || null;
};

export const uploadProfileAvatar = async (avatarDataUrl) => {
  const data = await apiFetch("/profiles/me/avatar", {
    method: "POST",
    body: JSON.stringify({ avatarDataUrl }),
  });
  return data?.profile || null;
};

export const followProfile = async (username) => {
  const data = await apiFetch(
    `/profiles/${encodeURIComponent(username)}/follow`,
    {
      method: "POST",
    },
  );
  return data;
};

export const unfollowProfile = async (username) => {
  const data = await apiFetch(
    `/profiles/${encodeURIComponent(username)}/follow`,
    {
      method: "DELETE",
    },
  );
  return data;
};
