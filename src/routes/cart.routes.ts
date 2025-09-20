import { Router } from "express";
const { addToCart } = require("@/controllers/cart.controller.ts");
const { authMiddleware } = require("@/middlewares/auth.middleware.ts");

const router = Router();

router.post("/add", authMiddleware, addToCart);

module.exports= router;
