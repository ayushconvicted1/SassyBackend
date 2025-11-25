"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const offer_controller_1 = require("../controllers/offer.controller");
const admin_middleware_1 = require("../middlewares/admin.middleware");
const { Router } = require("express");
const router = Router();
// Public routes (no authentication required)
router.post("/validate", offer_controller_1.validateOfferCode);
router.post("/apply", offer_controller_1.applyOfferCode);
// Admin routes (admin role required)
router.get("/tags-categories", admin_middleware_1.adminMiddleware, offer_controller_1.getTagsAndCategories);
router.post("/", admin_middleware_1.adminMiddleware, offer_controller_1.createOffer);
router.get("/", admin_middleware_1.adminMiddleware, offer_controller_1.getAllOffers);
router.get("/:id", admin_middleware_1.adminMiddleware, offer_controller_1.getOfferById);
router.put("/:id", admin_middleware_1.adminMiddleware, offer_controller_1.updateOffer);
router.delete("/:id", admin_middleware_1.adminMiddleware, offer_controller_1.deleteOffer);
module.exports = router;
