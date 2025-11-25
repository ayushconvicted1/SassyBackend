"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const review_controller_1 = require("../controllers/review.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const admin_middleware_1 = require("../middlewares/admin.middleware");
const router = (0, express_1.Router)();
console.log("🚀 Review routes file loaded - getBestReviews function:", typeof review_controller_1.getBestReviews);
// Public routes - specific routes first
router.get("/best", review_controller_1.getBestReviews);
router.get("/test", (req, res) => {
    console.log("🧪 Test route called!");
    res.json({ message: "Review routes are working!", timestamp: new Date().toISOString() });
});
router.get("/product/:productId", review_controller_1.getProductReviews);
// User routes (require authentication)
router.post("/product/:productId", auth_middleware_1.authMiddleware, review_controller_1.createReview);
router.put("/:reviewId", auth_middleware_1.authMiddleware, review_controller_1.updateReview);
router.delete("/:reviewId", auth_middleware_1.authMiddleware, review_controller_1.deleteReview);
router.get("/user/my-reviews", auth_middleware_1.authMiddleware, review_controller_1.getUserReviews);
// Admin routes
router.get("/admin/all", auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, review_controller_1.getAllReviews);
router.delete("/admin/:reviewId", auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, review_controller_1.adminDeleteReview);
module.exports = router;
