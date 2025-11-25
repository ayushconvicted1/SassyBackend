"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductImages = exports.deleteImage = exports.uploadMultipleImages = exports.uploadImage = void 0;
const db_1 = __importDefault(require("../configs/db"));
const s3upload_1 = require("../utils/s3upload");
const s3delete_1 = require("../utils/s3delete");
// Upload single image (can be used for product or user avatar)
const uploadImage = async (req, res) => {
    try {
        const file = req.file;
        const { type, userId, productId } = req.body;
        if (!file)
            return res.status(400).json({ error: "No file uploaded" });
        // Upload to S3
        const url = await (0, s3upload_1.uploadToS3)(file);
        const image = await db_1.default.media.create({
            data: {
                url,
                mimeType: file.mimetype,
                type: type || "generic", // "product" | "avatar" | "banner"
                userId: userId ? Number(userId) : undefined,
                productId: productId ? Number(productId) : undefined,
            },
        });
        res.json({ message: "Image uploaded successfully", image });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.uploadImage = uploadImage;
// Upload multiple images for products
const uploadMultipleImages = async (req, res) => {
    try {
        const files = req.files;
        const { type, productId } = req.body;
        console.log("Upload multiple images request:", {
            filesCount: files?.length || 0,
            type,
            productId,
            user: req.user,
        });
        if (!files || files.length === 0) {
            return res.status(400).json({ error: "No files uploaded" });
        }
        // Validate file types
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        const invalidFiles = files.filter((file) => !allowedTypes.includes(file.mimetype));
        if (invalidFiles.length > 0) {
            return res.status(400).json({
                error: `Invalid file types. Only JPEG, PNG, and WebP are allowed. Invalid files: ${invalidFiles
                    .map((f) => f.originalname)
                    .join(", ")}`,
            });
        }
        // Limit to 4 images per product
        const filesToProcess = files.slice(0, 4);
        const uploadPromises = filesToProcess.map(async (file, index) => {
            try {
                console.log(`Uploading file ${index + 1}:`, file.originalname);
                const url = await (0, s3upload_1.uploadToS3)(file);
                return db_1.default.media.create({
                    data: {
                        url,
                        mimeType: file.mimetype,
                        type: type || "product",
                        productId: productId ? Number(productId) : undefined,
                    },
                });
            }
            catch (error) {
                console.error(`Failed to upload file ${file.originalname}:`, error);
                throw error;
            }
        });
        const images = await Promise.all(uploadPromises);
        res.json({
            message: `${images.length} images uploaded successfully`,
            images,
            uploadedCount: images.length,
            totalFiles: files.length,
        });
    }
    catch (err) {
        console.error("Upload multiple images error:", err);
        res.status(500).json({ error: err.message || "Failed to upload images" });
    }
};
exports.uploadMultipleImages = uploadMultipleImages;
// Delete image
const deleteImage = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "Image ID is required" });
        }
        // Fetch the image first to get S3 URL
        const image = await db_1.default.media.findUnique({
            where: { id: Number(id) },
        });
        if (!image) {
            return res.status(404).json({ error: "Image not found" });
        }
        // Delete from S3 (don't fail if S3 deletion fails)
        if (image.url) {
            console.log("Deleting image from S3:", image.url);
            await (0, s3delete_1.deleteFromS3)(image.url);
        }
        // Delete from database
        await db_1.default.media.delete({
            where: { id: Number(id) },
        });
        res.json({ message: "Image deleted successfully" });
    }
    catch (err) {
        console.error("Error deleting image:", err);
        res.status(500).json({ error: err.message });
    }
};
exports.deleteImage = deleteImage;
// Get images by product ID
const getProductImages = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!productId) {
            return res.status(400).json({ error: "Product ID is required" });
        }
        const images = await db_1.default.media.findMany({
            where: {
                productId: Number(productId),
                type: "product",
            },
            orderBy: { createdAt: "asc" },
        });
        res.json({ images });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.getProductImages = getProductImages;
