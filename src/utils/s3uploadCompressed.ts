import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3 from "@/configs/s3";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

/**
 * Compress and upload image to S3
 * Returns the S3 URL
 */
export const uploadToS3Compressed = async (
  file: Express.Multer.File,
  folder: string = "home-images"
): Promise<string> => {
  try {
    console.log("Starting S3 upload with compression");
    console.log("Original file size:", file.buffer.length, "bytes");
    console.log("File type:", file.mimetype);

    let compressedBuffer: Buffer;
    let contentType: string;
    let fileExtension: string;

    // Compress based on image type
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
      compressedBuffer = await sharp(file.buffer)
        .jpeg({ quality: 85, mozjpeg: true })
        .toBuffer();
      contentType = "image/jpeg";
      fileExtension = ".jpg";
    } else if (file.mimetype === "image/png") {
      compressedBuffer = await sharp(file.buffer)
        .png({ quality: 85, compressionLevel: 9 })
        .toBuffer();
      contentType = "image/png";
      fileExtension = ".png";
    } else if (file.mimetype === "image/webp") {
      compressedBuffer = await sharp(file.buffer)
        .webp({ quality: 85 })
        .toBuffer();
      contentType = "image/webp";
      fileExtension = ".webp";
    } else {
      // For unsupported types, use original
      compressedBuffer = file.buffer;
      contentType = file.mimetype;
      fileExtension = file.originalname.substring(file.originalname.lastIndexOf("."));
    }

    const compressionRatio = ((file.buffer.length - compressedBuffer.length) / file.buffer.length * 100).toFixed(2);
    console.log("Compressed file size:", compressedBuffer.length, "bytes");
    console.log("Compression ratio:", compressionRatio + "%");

    // Generate unique filename
    const fileName = `${uuidv4()}${fileExtension}`;
    const key = `${folder}/${fileName}`;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: compressedBuffer,
      ContentType: contentType,
    };

    console.log("Uploading to S3:", key);

    await s3.send(new PutObjectCommand(params));

    const url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    console.log("S3 Upload successful:", url);

    return url;
  } catch (error) {
    console.error("S3 Upload error:", error);
    throw new Error(
      `Failed to upload to S3: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

