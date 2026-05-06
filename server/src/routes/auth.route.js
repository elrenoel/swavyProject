import { Router } from "express";
import {
  register,
  login,
  me,
  logout,
  refresh,
  verifyOTP,
  resendOTP,
} from "../controllers/auth.controller.js";

const authRoutes = Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.get("/me", me);
authRoutes.post("/refresh", refresh);
authRoutes.post("/logout", logout);
authRoutes.post("/verify-otp", verifyOTP);
authRoutes.post("/resend-otp", resendOTP);

export default authRoutes;
