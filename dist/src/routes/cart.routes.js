"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const { addToCart, verifyCartItems, getCart, } = require("../controllers/cart.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post("/add", authMiddleware, addToCart);
router.post("/verify", verifyCartItems); // No auth required for verification
router.get("/", authMiddleware, getCart);
module.exports = router;
