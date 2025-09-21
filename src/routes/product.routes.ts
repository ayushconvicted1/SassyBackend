import { getProductById } from "@/controllers/product.controller";
import { Router } from "express";
const { getProducts } = require("../controllers/product.controller");

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProductById);


module.exports = router;
