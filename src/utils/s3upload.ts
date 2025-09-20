import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3 from "@/configs/s3";
import { v4 as uuidv4 } from "uuid";

export const uploadToS3 = async (file: Express.Multer.File): Promise<string> => {
  const key = `products/${uuidv4()}-${file.originalname}`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  };


  await s3.send(new PutObjectCommand(params));

  return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};
