"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../configs/db"));
const adminMiddleware = async (req, res, next) => {
    try {
        // Let preflight OPTIONS requests pass through so CORS can be handled upstream
        if (req.method === "OPTIONS") {
            return next();
        }
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            return res
                .status(401)
                .json({ error: "Access denied. No token provided." });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Get user from database to check role
        const user = await db_1.default.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, role: true, email: true, name: true },
        });
        if (!user) {
            return res.status(401).json({ error: "Invalid token. User not found." });
        }
        if (user.role !== "ADMIN") {
            return res
                .status(403)
                .json({ error: "Access denied. Admin role required." });
        }
        // Attach user info to request
        req.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        };
        next();
    }
    catch (error) {
        console.error("Admin middleware error:", error);
        res.status(401).json({ error: "Invalid token." });
    }
};
exports.adminMiddleware = adminMiddleware;
