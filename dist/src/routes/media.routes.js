"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const { Router } = require("express");
const media_controller_1 = require("../controllers/media.controller");
const multer_1 = __importDefault(require("multer"));
const admin_middleware_1 = require("../middlewares/admin.middleware");
const router = Router();
// Health check endpoint (no auth required)
router.get("/health", (req, res) => {
    res.json({ status: "OK", message: "Media service is running" });
});
// Apply admin middleware to all other media routes
router.use(admin_middleware_1.adminMiddleware);
// Configure Multer storage (in memory, since we upload directly to S3)
const storage = multer_1.default.memoryStorage();
// Limit individual file size to 5MB and total fields to reasonable size
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
});
// POST /api/media/upload - Single image upload
// Fields in body: type (string), userId (optional), productId (optional)
router.post("/upload", upload.single("file"), media_controller_1.uploadImage);
// POST /api/media/upload-multiple - Multiple images upload (max 4)
// Fields in body: type (string), productId (optional)
router.post("/upload-multiple", upload.array("files", 4), media_controller_1.uploadMultipleImages);
// DELETE /api/media/:id - Delete image
router.delete("/:id", media_controller_1.deleteImage);
// GET /api/media/product/:productId - Get all images for a product
router.get("/product/:productId", media_controller_1.getProductImages);
module.exports = router;
