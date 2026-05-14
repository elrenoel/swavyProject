import { apiFetch } from "./api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getRecentReviews = async () => {
  const data = await apiFetch("/reviews/recent", {
    headers: getAuthHeaders(),
  });
  return data;
};

export const createReview = async (payload) => {
  const data = await apiFetch("/reviews", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return data?.review || null;
};

export const toggleReviewLike = async (reviewId) => {
  const data = await apiFetch(`/reviews/${reviewId}/like`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  return data;
};

export const getTrackReviews = async (trackId) => {
  const data = await apiFetch(`/reviews/track/${trackId}`, {
    headers: getAuthHeaders(),
  });

  return data?.reviews || [];
};

export const getPopularReviews = async ({ limit = 4, days = 7 } = {}) => {
  const data = await apiFetch(`/reviews/popular?limit=${limit}&days=${days}`);
  return data?.reviews || [];
};
