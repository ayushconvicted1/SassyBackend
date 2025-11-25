"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToS3Compressed = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_1 = __importDefault(require("../configs/s3"));
const uuid_1 = require("uuid");
const sharp_1 = __importDefault(require("sharp"));
/**
 * Compress and upload image to S3
 * Returns the S3 URL
 */
const uploadToS3Compressed = async (file, folder = "home-images") => {
    try {
        console.log("Starting S3 upload with compression");
        console.log("Original file size:", file.buffer.length, "bytes");
        console.log("File type:", file.mimetype);
        let compressedBuffer;
        let contentType;
        let fileExtension;
        // Compress based on image type
        if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
            compressedBuffer = await (0, sharp_1.default)(file.buffer)
                .jpeg({ quality: 85, mozjpeg: true })
                .toBuffer();
            contentType = "image/jpeg";
            fileExtension = ".jpg";
        }
        else if (file.mimetype === "image/png") {
            compressedBuffer = await (0, sharp_1.default)(file.buffer)
                .png({ quality: 85, compressionLevel: 9 })
                .toBuffer();
            contentType = "image/png";
            fileExtension = ".png";
        }
        else if (file.mimetype === "image/webp") {
            compressedBuffer = await (0, sharp_1.default)(file.buffer)
                .webp({ quality: 85 })
                .toBuffer();
            contentType = "image/webp";
            fileExtension = ".webp";
        }
        else {
            // For unsupported types, use original
            compressedBuffer = file.buffer;
            contentType = file.mimetype;
            fileExtension = file.originalname.substring(file.originalname.lastIndexOf("."));
        }
        const compressionRatio = ((file.buffer.length - compressedBuffer.length) / file.buffer.length * 100).toFixed(2);
        console.log("Compressed file size:", compressedBuffer.length, "bytes");
        console.log("Compression ratio:", compressionRatio + "%");
        // Generate unique filename
        const fileName = `${(0, uuid_1.v4)()}${fileExtension}`;
        const key = `${folder}/${fileName}`;
        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key,
            Body: compressedBuffer,
            ContentType: contentType,
        };
        console.log("Uploading to S3:", key);
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
exports.uploadToS3Compressed = uploadToS3Compressed;
