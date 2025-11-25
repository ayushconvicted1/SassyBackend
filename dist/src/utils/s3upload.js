"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToS3 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_1 = __importDefault(require("../configs/s3"));
const uuid_1 = require("uuid");
const uploadToS3 = async (file) => {
    try {
        const key = `products/${(0, uuid_1.v4)()}-${file.originalname}`;
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
        await s3_1.default.send(new client_s3_1.PutObjectCommand(params));
        const url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
        console.log("S3 Upload successful:", url);
        return url;
    }
    catch (error) {
        console.error("S3 Upload error:", error);
        throw new Error(`Failed to upload to S3: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
};
exports.uploadToS3 = uploadToS3;
