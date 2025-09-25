import { getProfile, otpVerification, updateProfile, register, login } from "@/controllers/user.controller";
import { Router } from "express";
const router = Router();

router.post("/register", register)

router.post("/login", login);
router.get("/profile", getProfile)
router.put("/profile", updateProfile)
//api to register-->send otp

router.post("/verify-otp", otpVerification)

// api to login  -- send otp 

// api to verify otp


module.exports = router;
