import { createUserClient, supabase } from "../config/supabase.js";
import * as reviewService from "../services/review.service.js";

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parseNonNegativeInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const extractAccessToken = (req) => {
  const authHeader = req.headers.authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length).trim();
  }

  return req.cookies?.access_token || null;
};

const resolveViewer = async (req) => {
  const accessToken = extractAccessToken(req);
  if (!accessToken) return { viewerUserId: null, viewerClient: null };

  const { data } = await supabase.auth.getUser(accessToken);
  if (!data?.user) return { viewerUserId: null, viewerClient: null };

  return {
    viewerUserId: data.user.id,
    viewerClient: createUserClient(accessToken),
  };
};

export const createReview = async (req, res) => {
  try {
    const {
      track_id,
      trackId,
      title,
      artist,
      image_url,
      imageUrl,
      rating,
      content,
    } = req.body;

    const trackIdValue = track_id || trackId;
    const imageUrlValue = image_url || imageUrl || null;
    const ratingValue = Number(rating);

    if (!trackIdValue || !title) {
      return res
        .status(400)
        .json({ error: "track_id (or trackId) and title are required" });
    }

    if (!Number.isFinite(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({ error: "Rating must be 1-5" });
    }

    const payload = {
      user_id: req.user.id,
      username:
        req.user.user_metadata?.username || req.user.email || "Anonymous",
      track_id: trackIdValue,
      album_id: req.body.album_id || req.body.albumId || null,
      album_name: req.body.album_name || req.body.albumName || null,
      album_type: req.body.album_type || req.body.albumType || null,
      title,
      artist: artist || null,
      image_url: imageUrlValue,
      rating: ratingValue,
      content: content || null,
    };

    const review = await reviewService.createReview(req.supabase, payload);
    return res.status(201).json({ review });
  } catch (error) {
    if (error.message?.includes("duplicate")) {
      return res.status(409).json({ error: "Review already exists" });
    }

    return res.status(500).json({ error: error.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, content } = req.body;
    const ratingValue = Number(rating);

    if (!Number.isFinite(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({ error: "Rating must be 1-5" });
    }

    const payload = {
      rating: ratingValue,
      content: content || null,
    };

    const review = await reviewService.updateReview(req.supabase, id, req.user.id, payload);
    return res.status(200).json({ review });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getMyTrackReview = async (req, res) => {
  try {
    const { id: trackId } = req.params;
    
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const review = await reviewService.getMyTrackReview(req.supabase, trackId, req.user.id);
    return res.status(200).json({ review });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


export const getRecentReviews = async (req, res) => {
  try {
    const limit = parsePositiveInt(req.query.limit, 100);
    const offset = parseNonNegativeInt(req.query.offset, 0);

    const { viewerUserId, viewerClient } = await resolveViewer(req);

    const { reviews, total } = await reviewService.getRecentReviews(supabase, {
      limit,
      offset,
      viewerUserId,
      viewerClient,
    });

    return res.status(200).json({ reviews, total });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getTrackReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const { viewerUserId, viewerClient } = await resolveViewer(req);

    const { reviews } = await reviewService.getTrackReviews(supabase, {
      trackId: id,
      viewerUserId,
      viewerClient,
    });

    return res.status(200).json({ reviews });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getPopularReviews = async (req, res) => {
  try {
    const limit = parsePositiveInt(req.query.limit, 4);
    const days = parsePositiveInt(req.query.days, 7);
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { reviews } = await reviewService.getPopularReviews(supabase, {
      limit,
      since: since.toISOString(),
    });

    return res.status(200).json({ reviews });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const toggleReviewLike = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await reviewService.toggleReviewLike(
      req.supabase,
      id,
      req.user.id,
    );

    if (!result) {
      return res.status(404).json({ error: "Review not found" });
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
