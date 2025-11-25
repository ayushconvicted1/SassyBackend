"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const router = (0, express_1.Router)();
// Public route to get home page images (no authentication required)
router.get("/images", admin_controller_1.getAllHomePageImages);
exports.default = router;
