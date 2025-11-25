"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFromPublic = exports.uploadToPublic = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
/**
 * Upload image to public folder
 * Returns the public URL path (e.g., "/home-images/hero-123.jpg")
 */
const uploadToPublic = async (file, subfolder = "home-images") => {
    try {
        console.log("Starting uploadToPublic");
        console.log("Current working directory:", process.cwd());
        console.log("__dirname:", __dirname);
        // Get the public folder path
        // Try multiple approaches to find the project root
        let publicFolder;
        // Approach 1: If running from project root, public folder is directly accessible
        const cwd = process.cwd();
        const publicInCwd = path.join(cwd, "public");
        const publicInParent = path.join(cwd, "..", "public");
        console.log("Checking paths:");
        console.log("  - public in cwd:", publicInCwd, "exists:", fs.existsSync(publicInCwd));
        console.log("  - public in parent:", publicInParent, "exists:", fs.existsSync(publicInParent));
        if (fs.existsSync(publicInCwd)) {
            publicFolder = path.join(cwd, "public", subfolder);
            console.log("Using approach 1, publicFolder:", publicFolder);
        }
        // Approach 2: If running from SassyBackend, go up one level
        else if (fs.existsSync(publicInParent)) {
            publicFolder = path.join(cwd, "..", "public", subfolder);
            console.log("Using approach 2, publicFolder:", publicFolder);
        }
        // Approach 3: Use __dirname to resolve (for compiled code)
        else {
            const backendRoot = path.resolve(__dirname, "../..");
            const frontendRoot = path.resolve(backendRoot, "..");
            publicFolder = path.join(frontendRoot, "public", subfolder);
            console.log("Using approach 3");
            console.log("  - backendRoot:", backendRoot);
            console.log("  - frontendRoot:", frontendRoot);
            console.log("  - publicFolder:", publicFolder);
        }
        // Create subfolder if it doesn't exist
        console.log("Creating folder if needed:", publicFolder);
        if (!fs.existsSync(publicFolder)) {
            fs.mkdirSync(publicFolder, { recursive: true });
            console.log("Folder created successfully");
        }
        else {
            console.log("Folder already exists");
        }
        // Generate unique filename
        const fileExtension = path.extname(file.originalname);
        const fileName = `${(0, uuid_1.v4)()}${fileExtension}`;
        const filePath = path.join(publicFolder, fileName);
        console.log("Writing file:", filePath);
        console.log("File size:", file.buffer.length, "bytes");
        // Write file to public folder
        fs.writeFileSync(filePath, file.buffer);
        console.log("File written successfully");
        // Return the public URL path (relative to public folder)
        const publicUrl = `/${subfolder}/${fileName}`;
        console.log("Public folder upload successful, URL:", publicUrl);
        return publicUrl;
    }
    catch (error) {
        console.error("Public folder upload error:", error);
        console.error("Error details:", error instanceof Error ? error.stack : error);
        throw new Error(`Failed to upload to public folder: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
};
exports.uploadToPublic = uploadToPublic;
/**
 * Delete image from public folder
 */
const deleteFromPublic = async (publicUrl) => {
    try {
        // Remove leading slash if present
        const cleanUrl = publicUrl.startsWith("/") ? publicUrl.slice(1) : publicUrl;
        // Get the public folder path (same logic as uploadToPublic)
        let filePath;
        const cwd = process.cwd();
        if (fs.existsSync(path.join(cwd, "public"))) {
            filePath = path.join(cwd, "public", cleanUrl);
        }
        else if (fs.existsSync(path.join(cwd, "..", "public"))) {
            filePath = path.join(cwd, "..", "public", cleanUrl);
        }
        else {
            const backendRoot = path.resolve(__dirname, "../..");
            const frontendRoot = path.resolve(backendRoot, "..");
            filePath = path.join(frontendRoot, "public", cleanUrl);
        }
        // Check if file exists and delete
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log("File deleted from public folder:", filePath);
        }
        else {
            console.warn("File not found in public folder:", filePath);
        }
    }
    catch (error) {
        console.error("Error deleting file from public folder:", error);
        throw new Error(`Failed to delete from public folder: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
};
exports.deleteFromPublic = deleteFromPublic;
