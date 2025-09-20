const {Router}=require("express")
import { uploadImage } from "@/controllers/media.controller";
import multer from "multer";

const router = Router();

// Configure Multer storage (in memory, since we upload directly to S3)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/media/upload
// Fields in body: type (string), userId (optional), productId (optional)
router.post("/upload", upload.single("file"), uploadImage);

module.exports= router;

