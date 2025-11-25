"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const admin_controller_1 = require("../controllers/admin.controller");
const offer_controller_1 = require("../controllers/offer.controller");
const admin_middleware_1 = require("../middlewares/admin.middleware");
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
// Configure Multer for home page image uploads (in memory storage)
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
});
// Apply admin middleware to all routes
router.use(admin_middleware_1.adminMiddleware);
// Dashboard
router.get("/dashboard/stats", admin_controller_1.getDashboardStats);
// Orders
router.get("/orders", admin_controller_1.getAllOrders);
router.put("/orders/:id", admin_controller_1.updateOrderDetails);
router.post("/orders/:id/refresh-status", admin_controller_1.refreshOrderStatus);
router.get("/status-service-info", admin_controller_1.getStatusServiceInfo);
// Products
router.get("/products", admin_controller_1.getAllProducts);
router.post("/product", admin_controller_1.upsertProduct);
router.delete("/product/:id", admin_controller_1.deleteProduct);
// Users
router.get("/users", admin_controller_1.getAllUsers);
router.put("/users/:id/role", admin_controller_1.updateUserRole);
// Sizes
router.get("/sizes", admin_controller_1.getAllSizes);
router.post("/size", admin_controller_1.upsertSize);
router.put("/size/:id", admin_controller_1.upsertSize);
router.delete("/size/:id", admin_controller_1.deleteSize);
// Categories
router.get("/categories", admin_controller_1.getAllCategories);
router.post("/category", admin_controller_1.upsertCategory);
router.put("/category/:id", admin_controller_1.upsertCategory);
router.delete("/category/:id", admin_controller_1.deleteCategory);
// Tags
router.get("/tags", admin_controller_1.getAllTags);
router.post("/tag", admin_controller_1.upsertTag);
router.put("/tag/:id", admin_controller_1.upsertTag);
router.delete("/tag/:id", admin_controller_1.deleteTag);
// Offers
router.get("/offers", offer_controller_1.getAllOffers);
router.post("/offer", offer_controller_1.createOffer);
router.put("/offer/:id", offer_controller_1.updateOffer);
router.delete("/offer/:id", offer_controller_1.deleteOffer);
router.get("/offer/:id", offer_controller_1.getOfferById);
router.get("/tags-categories", offer_controller_1.getTagsAndCategories);
// Home Page Images
router.get("/home-images", admin_controller_1.getAllHomePageImages);
router.post("/home-image/upload", upload.single("file"), admin_controller_1.uploadHomePageImage);
router.post("/home-image", admin_controller_1.upsertHomePageImage);
router.put("/home-image/:id", admin_controller_1.upsertHomePageImage);
router.post("/home-images/bulk-update", admin_controller_1.bulkUpdateHomePageImages);
router.delete("/home-image/:id", admin_controller_1.deleteHomePageImage);
// Top Pick Products
router.get("/top-picks", admin_controller_1.getTopPickProducts);
router.post("/top-picks", admin_controller_1.setTopPickProducts);
router.delete("/top-pick/:id", admin_controller_1.removeTopPickProduct);
module.exports = router;
