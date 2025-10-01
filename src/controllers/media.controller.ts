import { Request, Response } from "express";
import prisma from "@/configs/db";
import { uploadToS3 } from "@/utils/s3upload";

// Upload single image (can be used for product or user avatar)
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
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

// Upload multiple images for products
export const uploadMultipleImages = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    const { type, productId } = req.body;

    console.log("Upload multiple images request:", {
      filesCount: files?.length || 0,
      type,
      productId,
      user: req.user,
    });

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    // Validate file types
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const invalidFiles = files.filter(
      (file) => !allowedTypes.includes(file.mimetype)
    );

    if (invalidFiles.length > 0) {
      return res.status(400).json({
        error: `Invalid file types. Only JPEG, PNG, and WebP are allowed. Invalid files: ${invalidFiles
          .map((f) => f.originalname)
          .join(", ")}`,
      });
    }

    // Limit to 4 images per product
    const filesToProcess = files.slice(0, 4);

    const uploadPromises = filesToProcess.map(async (file, index) => {
      try {
        console.log(`Uploading file ${index + 1}:`, file.originalname);
        const url = await uploadToS3(file);
        return prisma.media.create({
          data: {
            url,
            mimeType: file.mimetype,
            type: type || "product",
            productId: productId ? Number(productId) : undefined,
          },
        });
      } catch (error) {
        console.error(`Failed to upload file ${file.originalname}:`, error);
        throw error;
      }
    });

    const images = await Promise.all(uploadPromises);

    res.json({
      message: `${images.length} images uploaded successfully`,
      images,
      uploadedCount: images.length,
      totalFiles: files.length,
    });
  } catch (err: any) {
    console.error("Upload multiple images error:", err);
    res.status(500).json({ error: err.message || "Failed to upload images" });
  }
};

// Delete image
export const deleteImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Image ID is required" });
    }

    await prisma.media.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Image deleted successfully" });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

// Get images by product ID
export const getProductImages = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    const images = await prisma.media.findMany({
      where: {
        productId: Number(productId),
        type: "product",
      },
      orderBy: { createdAt: "asc" },
    });

    res.json({ images });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
