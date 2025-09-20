import { checkout, verifyPayment } from "@/controllers/order.controller";

const {Router}=require("express")

const router = Router();


router.post("/checkout", checkout);
router.post("/verify-payment", verifyPayment);

module.exports= router;

