import {
  getDashboardStats,
  deleteProduct,
  getAllOrders,
  updateOrderDetails,
  refreshOrderStatus,
  getStatusServiceInfo,
  upsertProduct,
  getAllProducts,
  getAllUsers,
  updateUserRole,
  getAllSizes,
  upsertSize,
  deleteSize,
  getAllCategories,
  upsertCategory,
  deleteCategory,
  getAllTags,
  upsertTag,
  deleteTag,
} from "@/controllers/admin.controller";
import {
  getAllOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  getOfferById,
  getTagsAndCategories,
} from "@/controllers/offer.controller";
import { adminMiddleware } from "@/middlewares/admin.middleware";
import express from "express";

const router = express.Router();

// Apply admin middleware to all routes
router.use(adminMiddleware);

// Dashboard
router.get("/dashboard/stats", getDashboardStats);

// Orders
router.get("/orders", getAllOrders);
router.put("/orders/:id", updateOrderDetails);
router.post("/orders/:id/refresh-status", refreshOrderStatus);
router.get("/status-service-info", getStatusServiceInfo);

// Products
router.get("/products", getAllProducts);
router.post("/product", upsertProduct);
router.delete("/product/:id", deleteProduct);

// Users
router.get("/users", getAllUsers);
router.put("/users/:id/role", updateUserRole);

// Sizes
router.get("/sizes", getAllSizes);
router.post("/size", upsertSize);
router.put("/size/:id", upsertSize);
router.delete("/size/:id", deleteSize);

// Categories
router.get("/categories", getAllCategories);
router.post("/category", upsertCategory);
router.put("/category/:id", upsertCategory);
router.delete("/category/:id", deleteCategory);

// Tags
router.get("/tags", getAllTags);
router.post("/tag", upsertTag);
router.put("/tag/:id", upsertTag);
router.delete("/tag/:id", deleteTag);

// Offers
router.get("/offers", getAllOffers);
router.post("/offer", createOffer);
router.put("/offer/:id", updateOffer);
router.delete("/offer/:id", deleteOffer);
router.get("/offer/:id", getOfferById);
router.get("/tags-categories", getTagsAndCategories);

module.exports = router;
