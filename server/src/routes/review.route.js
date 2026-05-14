import { Router } from "express";
import authenticate from "../middlewares/authenticate.js";
import {
  createReview,
  getRecentReviews,
  getTrackReviews,
  getPopularReviews,
  toggleReviewLike,
} from "../controllers/review.controller.js";

const reviewRoutes = Router();

reviewRoutes.get("/recent", getRecentReviews);
reviewRoutes.get("/popular", getPopularReviews);
reviewRoutes.get("/track/:id", getTrackReviews);
reviewRoutes.post("/", authenticate, createReview);
reviewRoutes.post("/:id/like", authenticate, toggleReviewLike);

export default reviewRoutes;
