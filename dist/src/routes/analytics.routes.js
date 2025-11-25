"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const analytics_controller_1 = require("../controllers/analytics.controller");
const admin_middleware_1 = require("../middlewares/admin.middleware");
const router = express_1.default.Router();
// Apply admin middleware to all analytics routes
router.use(admin_middleware_1.adminMiddleware);
// Analytics endpoints
router.get("/overview", analytics_controller_1.getOverviewAnalytics);
router.get("/products", analytics_controller_1.getProductAnalytics);
router.get("/sales", analytics_controller_1.getSalesAnalytics);
router.get("/users", analytics_controller_1.getUserAnalytics);
module.exports = router;
