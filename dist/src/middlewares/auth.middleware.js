"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    console.log("Auth middleware - Token:", token);
    console.log("Auth middleware - JWT_SECRET:", process.env.JWT_SECRET);
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "secretkey");
        console.log("Auth middleware - Decoded:", decoded);
        req.user = decoded;
        next();
    }
    catch (err) {
        console.error("Auth middleware - Error:", err);
        return res.status(403).json({ message: "Invalid Token" });
    }
};
exports.authMiddleware = authMiddleware;
