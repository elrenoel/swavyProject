import { apiFetch } from "./api";

export const getNewReleases = async () => {
  try {
    const data = await apiFetch("/new-releases");
    return data;
  } catch (error) {
    console.error("Error pada Front-End:", error);
    return [];
  }
};

export const getDiscover = async (query = "top hit 2025") => {
  try {
    const data = await apiFetch(`/discover?q=${encodeURIComponent(query)}`);
    return data.tracks || [];
  } catch (error) {
    console.error("Error pada Front-End:", error);
    return [];
  }
};
