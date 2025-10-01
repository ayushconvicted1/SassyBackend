import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3 from "@/configs/s3";
import { v4 as uuidv4 } from "uuid";

export const uploadToS3 = async (
  file: Express.Multer.File
): Promise<string> => {
  try {
    const key = `products/${uuidv4()}-${file.originalname}`;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    console.log("S3 Upload params:", {
      bucket: process.env.AWS_S3_BUCKET_NAME,
      key,
      contentType: file.mimetype,
      fileSize: file.buffer.length,
    });

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
