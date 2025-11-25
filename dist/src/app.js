"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const express_1 = __importDefault(require("express"));
const morgan = require("morgan");
const userRoutes = require("./routes/user.routes");
const productRoutes = require("./routes/product.routes");
const mediaRoutes = require("./routes/media.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const adminRoutes = require("./routes/admin.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const offerRoutes = require("./routes/offer.routes");
const reviewRoutes = require("./routes/review.routes");
const home_routes_1 = __importDefault(require("./routes/home.routes"));
const app = (0, express_1.default)();
// Increase body parser limits so large uploads or large form payloads don't trigger 413
// Note: multipart/form-data uploads are handled by multer on specific routes, but
// increasing these limits helps for any JSON/urlencoded endpoints and edge cases.
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("dev"));
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/home", home_routes_1.default);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/analytics", analyticsRoutes);
app.get("/", (req, res) => {
    res.send("Welcome to the Sassy Shringar Backend API!");
});
module.exports = app;
