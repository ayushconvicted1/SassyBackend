import {
  getProfile,
  otpVerification,
  updateProfile,
  register,
  login,
} from "@/controllers/user.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { Router } from "express";
const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", getProfile);
router.put("/profile",authMiddleware ,updateProfile);
router.post("/verify-otp", otpVerification);

module.exports = router;
