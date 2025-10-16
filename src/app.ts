require("dotenv").config();
import { CorsOptions } from "cors";
import express from "express";
const cors = require("cors");
const morgan = require("morgan");

const userRoutes = require("@/routes/user.routes");
const productRoutes = require("./routes/product.routes");
const mediaRoutes = require("./routes/media.routes");
const cartRoutes = require("@/routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const adminRoutes = require("@/routes/admin.routes");
const analyticsRoutes = require("@/routes/analytics.routes");
const offerRoutes = require("./routes/offer.routes");
const reviewRoutes = require("./routes/review.routes");

const app = express();

const allowedOrigins = [
  "https://www.sassyshringaar.com",
  "https://sassyshringaar.com",
];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: "GET,POST,PUT,DELETE,PATCH,HEAD",
  allowedHeaders: "Content-Type,Authorization",
};

// This single line handles ALL requests, including preflight OPTIONS
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/reviews", reviewRoutes);

app.use("/api/admin", adminRoutes);
app.use("/api/admin/analytics", analyticsRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Sassy Shringar Backend API!");
});

module.exports = app;
