import { Router } from "express";
import {
  register,
  login,
  verifyOTP,
  resendOTP,
} from "../controllers/auth.controller.js";

const authRoutes = Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.post("/verify-otp", verifyOTP);
authRoutes.post("/resend-otp", resendOTP);

export default authRoutes;
