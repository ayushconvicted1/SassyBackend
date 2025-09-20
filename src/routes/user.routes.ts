import { getProfile, updateProfile } from "@/controllers/user.controller";
import { Router } from "express";
const { register, login } = require("@/controllers/user.controller.ts");
const router = Router();

router.post("/register", register);

router.post("/login", login);
router.get("/profile", getProfile)
router.put("/profile",updateProfile)

module.exports = router;
