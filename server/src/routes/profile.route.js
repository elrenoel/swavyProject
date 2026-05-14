import { Router } from "express";
import authenticate from "../middlewares/authenticate.js";
import {
  getProfileByUsername,
  getProfileStats,
  getProfileTopPicks,
  getProfileLists,
  updateProfile,
  uploadAvatar,
  followProfile,
  unfollowProfile,
} from "../controllers/profile.controller.js";

const profileRoutes = Router();

profileRoutes.get("/:username", getProfileByUsername);
profileRoutes.get("/:username/stats", getProfileStats);
profileRoutes.get("/:username/top-picks", getProfileTopPicks);
profileRoutes.get("/:username/lists", getProfileLists);
profileRoutes.patch("/me", authenticate, updateProfile);
profileRoutes.post("/me/avatar", authenticate, uploadAvatar);
profileRoutes.post("/:username/follow", authenticate, followProfile);
profileRoutes.delete("/:username/follow", authenticate, unfollowProfile);

export default profileRoutes;
