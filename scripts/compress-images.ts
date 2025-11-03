import { PrismaClient } from "@prisma/client";
import sharp from "sharp";
import AWS from "aws-sdk";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

// Configure AWS
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

async function downloadImage(url: string): Promise<Buffer> {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(response.data);
}

interface CompressedImage {
  buffer: Buffer;
  contentType: string;
}

async function compressImage(inputBuffer: Buffer): Promise<CompressedImage> {
  const { format } = await sharp(inputBuffer).metadata();

  if (format === "jpeg" || format === "jpg") {
    const buffer = await sharp(inputBuffer)
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer();
    return { buffer, contentType: "image/jpeg" };
  } else if (format === "png") {
    const buffer = await sharp(inputBuffer)
      .png({ quality: 80, compressionLevel: 9 })
      .toBuffer();
    return { buffer, contentType: "image/png" };
  } else {
    throw new Error(`Unsupported image format: ${format}`);
  }
}

async function uploadToS3(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME as string,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    // Removed ACL parameter since bucket has Object Ownership set to "Bucket owner enforced"
  };

  const result = await s3.upload(params).promise();
  return result.Location;
}

async function compressAllProductImages(): Promise<void> {
  let totalSaved = 0;
  let totalProcessed = 0;
  let failures = 0;

  try {
    // Get all product images from Media table
    const productImages = await prisma.media.findMany({
      where: {
        productId: { not: null }, // Only get product images
        type: "product", // Assuming you use this type for product images
      },
      include: {
        product: {
          select: {
            name: true,
          },
        },
      },
    });

    console.log(`Found ${productImages.length} product images to process`);

    for (const image of productImages) {
      try {
        console.log(
          `\nProcessing image for product: ${image.product?.name || "Unknown"}`
        );
        console.log(`Image URL: ${image.url}`);

        // Get original file size
        const originalImage = await downloadImage(image.url);
        const originalSize = originalImage.length;

        // Compress image
        const compressedResult = await compressImage(originalImage);
        const compressedSize = compressedResult.buffer.length;

        // Calculate size reduction
        const savedSize = originalSize - compressedSize;
        const savingPercentage = ((savedSize / originalSize) * 100).toFixed(2);

        // Only upload if we achieved significant compression (>10%)
        if (savedSize > originalSize * 0.1) {
          // Extract key from URL
          const urlParts = image.url.split("/");
          const key = urlParts[urlParts.length - 1];

          // Upload compressed image
          const newUrl = await uploadToS3(
            compressedResult.buffer,
            key,
            compressedResult.contentType
          );

          // Update database with new URL if different
          if (newUrl !== image.url) {
            await prisma.media.update({
              where: { id: image.id },
              data: { url: newUrl },
            });
          }

          totalSaved += savedSize;
          console.log(
            `✅ Success! Saved ${(savedSize / 1024 / 1024).toFixed(
              2
            )}MB (${savingPercentage}%)`
          );
        } else {
          console.log(
            `⏭️ Skipping - compression saving not significant (${savingPercentage}%)`
          );
        }

        totalProcessed++;
      } catch (error) {
        console.error(`❌ Error processing image: ${image.url}`, error);
        failures++;
      }
    }

    console.log("\n=== Compression Summary ===");
    console.log(`Total images processed: ${totalProcessed}`);
    console.log(
      `Total space saved: ${(totalSaved / 1024 / 1024).toFixed(2)}MB`
    );
    console.log(`Failed operations: ${failures}`);
  } catch (error) {
    console.error("Fatal error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
compressAllProductImages()
  .then(() => console.log("Compression complete!"))
  .catch(console.error);
