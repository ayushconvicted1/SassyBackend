import { Router } from "express";
const { getProducts } = require("../controllers/product.controller");

const router = Router();

router.get("/", getProducts);


module.exports = router;
