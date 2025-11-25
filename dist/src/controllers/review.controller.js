"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBestReviews = exports.adminDeleteReview = exports.getAllReviews = exports.getUserReviews = exports.deleteReview = exports.updateReview = exports.createReview = exports.getProductReviews = void 0;
const db_1 = __importDefault(require("../configs/db"));
// Get reviews for a product
const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const { page = "1", limit = "10", rating } = req.query;
        const pageNumber = Math.max(1, Number(page) || 1);
        const pageSize = Math.min(50, Math.max(1, Number(limit) || 10));
        const skip = (pageNumber - 1) * pageSize;
        const filters = {
            productId: Number(productId),
        };
        if (rating) {
            filters.rating = Number(rating);
        }
        const reviews = await db_1.default.review.findMany({
            where: filters,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            skip,
            take: pageSize,
        });
        const totalCount = await db_1.default.review.count({ where: filters });
        // Get total reviews for this product (not filtered)
        const totalProductReviews = await db_1.default.review.count({
            where: { productId: Number(productId) }
        });
        // Get average rating and rating distribution
        const ratingStats = await db_1.default.review.groupBy({
            by: ["rating"],
            where: { productId: Number(productId) },
            _count: {
                rating: true,
            },
        });
        const averageRating = await db_1.default.review.aggregate({
            where: { productId: Number(productId) },
            _avg: {
                rating: true,
            },
        });
        const ratingDistribution = {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0,
        };
        ratingStats.forEach((stat) => {
            ratingDistribution[stat.rating] =
                stat._count.rating;
        });
        // Debug logging
        console.log("📊 Review Stats Debug:");
        console.log("Product ID:", productId);
        console.log("Total product reviews:", totalProductReviews);
        console.log("Average rating:", averageRating._avg.rating);
        console.log("Rating distribution:", ratingDistribution);
        console.log("Rating stats raw:", ratingStats);
        res.json({
            reviews,
            pagination: {
                totalItems: totalCount,
                totalPages: Math.ceil(totalCount / pageSize),
                currentPage: pageNumber,
                pageSize,
                hasNextPage: pageNumber < Math.ceil(totalCount / pageSize),
                hasPrevPage: pageNumber > 1,
            },
            stats: {
                averageRating: averageRating._avg.rating || 0,
                totalReviews: totalProductReviews,
                ratingDistribution,
            },
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.getProductReviews = getProductReviews;
// Create a new review
const createReview = async (req, res) => {
    try {
        const { productId } = req.params;
        const { rating, comment, orderId } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Authentication required" });
        }
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: "Rating must be between 1 and 5" });
        }
        // Check if user already reviewed this product
        const existingReview = await db_1.default.review.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId: Number(productId),
                },
            },
        });
        if (existingReview) {
            return res
                .status(400)
                .json({ error: "You have already reviewed this product" });
        }
        // Verify the order if orderId is provided
        let isVerified = false;
        if (orderId) {
            const order = await db_1.default.order.findFirst({
                where: {
                    id: Number(orderId),
                    userId,
                    status: "delivered",
                },
                include: {
                    items: {
                        where: {
                            productId: Number(productId),
                        },
                    },
                },
            });
            if (order && order.items.length > 0) {
                isVerified = true;
            }
        }
        const review = await db_1.default.review.create({
            data: {
                rating: Number(rating),
                comment: comment || null,
                userId,
                productId: Number(productId),
                orderId: orderId ? Number(orderId) : null,
                isVerified,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });
        res.status(201).json(review);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.createReview = createReview;
// Update a review
const updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Authentication required" });
        }
        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({ error: "Rating must be between 1 and 5" });
        }
        const review = await db_1.default.review.findFirst({
            where: {
                id: Number(reviewId),
                userId,
            },
        });
        if (!review) {
            return res.status(404).json({ error: "Review not found" });
        }
        const updatedReview = await db_1.default.review.update({
            where: {
                id: Number(reviewId),
            },
            data: {
                ...(rating && { rating: Number(rating) }),
                ...(comment !== undefined && { comment }),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });
        res.json(updatedReview);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.updateReview = updateReview;
// Delete a review
const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Authentication required" });
        }
        const review = await db_1.default.review.findFirst({
            where: {
                id: Number(reviewId),
                userId,
            },
        });
        if (!review) {
            return res.status(404).json({ error: "Review not found" });
        }
        await db_1.default.review.delete({
            where: {
                id: Number(reviewId),
            },
        });
        res.json({ message: "Review deleted successfully" });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.deleteReview = deleteReview;
// Get user's reviews
const getUserReviews = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { page = "1", limit = "10" } = req.query;
        if (!userId) {
            return res.status(401).json({ error: "Authentication required" });
        }
        const pageNumber = Math.max(1, Number(page) || 1);
        const pageSize = Math.min(50, Math.max(1, Number(limit) || 10));
        const skip = (pageNumber - 1) * pageSize;
        const reviews = await db_1.default.review.findMany({
            where: { userId },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        images: {
                            select: {
                                url: true,
                            },
                            take: 1,
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            skip,
            take: pageSize,
        });
        const totalCount = await db_1.default.review.count({ where: { userId } });
        res.json({
            reviews,
            pagination: {
                totalItems: totalCount,
                totalPages: Math.ceil(totalCount / pageSize),
                currentPage: pageNumber,
                pageSize,
                hasNextPage: pageNumber < Math.ceil(totalCount / pageSize),
                hasPrevPage: pageNumber > 1,
            },
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.getUserReviews = getUserReviews;
// Admin: Get all reviews with filtering
const getAllReviews = async (req, res) => {
    try {
        const { page = "1", limit = "20", productId, userId, rating, verified, } = req.query;
        const pageNumber = Math.max(1, Number(page) || 1);
        const pageSize = Math.min(100, Math.max(1, Number(limit) || 20));
        const skip = (pageNumber - 1) * pageSize;
        const filters = {};
        if (productId)
            filters.productId = Number(productId);
        if (userId)
            filters.userId = Number(userId);
        if (rating)
            filters.rating = Number(rating);
        if (verified !== undefined)
            filters.isVerified = verified === "true";
        const reviews = await db_1.default.review.findMany({
            where: filters,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
                product: {
                    select: {
                        id: true,
                        name: true,
                        sku: true,
                        images: {
                            select: {
                                url: true,
                            },
                            take: 1,
                        },
                    },
                },
                order: {
                    select: {
                        id: true,
                        status: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            skip,
            take: pageSize,
        });
        const totalCount = await db_1.default.review.count({ where: filters });
        res.json({
            reviews,
            pagination: {
                totalItems: totalCount,
                totalPages: Math.ceil(totalCount / pageSize),
                currentPage: pageNumber,
                pageSize,
                hasNextPage: pageNumber < Math.ceil(totalCount / pageSize),
                hasPrevPage: pageNumber > 1,
            },
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.getAllReviews = getAllReviews;
// Admin: Delete any review
const adminDeleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const review = await db_1.default.review.findUnique({
            where: {
                id: Number(reviewId),
            },
        });
        if (!review) {
            return res.status(404).json({ error: "Review not found" });
        }
        await db_1.default.review.delete({
            where: {
                id: Number(reviewId),
            },
        });
        res.json({ message: "Review deleted successfully" });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.adminDeleteReview = adminDeleteReview;
// Get best reviews for homepage testimonials
const getBestReviews = async (req, res) => {
    console.log("🎯 getBestReviews endpoint called!");
    try {
        const { limit = "5", minRating = "4" } = req.query;
        console.log("📊 Query params:", { limit, minRating });
        const pageSize = Math.min(10, Math.max(1, Number(limit) || 5));
        const minimumRating = Math.max(1, Math.min(5, Number(minRating) || 4));
        console.log("📊 Processed params:", { pageSize, minimumRating });
        // First check total reviews
        const totalReviews = await db_1.default.review.count();
        console.log("📈 Total reviews in database:", totalReviews);
        const reviews = await db_1.default.review.findMany({
            where: {
                rating: {
                    gte: minimumRating,
                },
                comment: {
                    not: null,
                },
                AND: {
                    comment: {
                        not: "",
                    },
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
                product: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: [
                {
                    rating: "desc",
                },
                {
                    createdAt: "desc",
                },
            ],
            take: pageSize,
        });
        console.log("✅ Found reviews:", reviews.length);
        if (reviews.length > 0) {
            console.log("👤 First review user:", reviews[0].user?.name);
        }
        res.json({
            reviews,
            count: reviews.length,
        });
    }
    catch (err) {
        console.error("💥 Error in getBestReviews:", err);
        res.status(500).json({ error: err.message });
    }
};
exports.getBestReviews = getBestReviews;
