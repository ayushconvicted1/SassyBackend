require("dotenv").config()
import express from "express";
const cors = require("cors");
const morgan = require("morgan");

const userRoutes = require("@/routes/user.routes");
const productRoutes = require("./routes/product.routes");
const mediaRoutes = require("./routes/media.routes");
// const cartRoutes = require("@/routes/cart.routes"); 
const orderRoutes = require("./routes/order.routes");
const adminRoutes = require("@/routes/admin.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
// app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/media", mediaRoutes);

app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Sassy Shringar Backend API!");
});

module.exports = app;
