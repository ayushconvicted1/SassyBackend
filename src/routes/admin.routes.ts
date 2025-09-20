import { deleteProduct, getAllOrders, updateOrderDetails, upsertProduct } from "@/controllers/admin.controller";
import express from "express";
const multer = require("multer");

// const { getProducts, addProduct, updateProduct, deleteProduct } = require("../controllers/productController");
// const { getOrders } = require("../controllers/orderController");
// const { createCoupon, deleteCoupon, deactivateCoupon } = require("../controllers/couponController");

const router = express.Router();
// const upload = multer({ dest: "uploads/" });

// // Product routes
// router.get("/products", getProducts);
// router.post("/products", upload.array("images"), addProduct);
// router.put("/products/:id", updateProduct);
// router.delete("/products/:id", deleteProduct);

// // Orders
// router.get("/orders", getOrders);

// // Coupons
// router.post("/coupons", createCoupon);
// router.delete("/coupons/:id", deleteCoupon);
// router.put("/coupons/:id/deactivate", deactivateCoupon);


//Orders
router.get("/orders", getAllOrders);
router.put("/orders/:id",updateOrderDetails )


// Products
router.post("/product",upsertProduct);
// router.delete("/product/:id", deleteProduct);



module.exports = router;
