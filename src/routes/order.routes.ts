import {
  checkout,
  getOrders,
  verifyPayment,
} from "@/controllers/order.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";

const { Router } = require("express");

const router = Router();

router.get("/", authMiddleware, getOrders);
router.post("/checkout", checkout);
router.post("/verify-payment", verifyPayment);

module.exports = router;
