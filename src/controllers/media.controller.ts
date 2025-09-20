import { Request, Response } from "express";
import prisma from "@/configs/db";
import { uploadToS3 } from "@/utils/s3upload";

// Upload image (can be used for product or user avatar)
export const uploadImage = async (req: Request, res: Response) => {
  try {
    const file = req.file as Express.Multer.File;
    const { type, userId, productId } = req.body;

    if (!file) return res.status(400).json({ error: "No file uploaded" });

    // Upload to S3
    const url = await uploadToS3(file);

    const image = await prisma.media.create({
      data: {
        url,
        mimeType: file.mimetype,
        type: type || "generic", // "product" | "avatar" | "banner"
        userId: userId ? Number(userId) : undefined,
        productId: productId ? Number(productId) : undefined,
      },
    });

    res.json({ message: "Image uploaded successfully", image });
  } catch (err: any) {
    console.log(err)
    res.status(500).json({ error: err.message });
  }
};
