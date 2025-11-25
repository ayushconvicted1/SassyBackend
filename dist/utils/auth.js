"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNewOtp = void 0;
const otpSender_1 = __importDefault(require("../services/otpSender"));
const crypto_1 = __importDefault(require("crypto"));
const createNewOtp = async (email) => {
    const key = process.env.OTP_SECRET;
    if (!key) {
        throw new Error("OTP_SECRET environment variable is not set");
    }
    // Generate a random 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    const otpValidity = 5 * 60 * 1000; // 5 minutes
    const expiry = Date.now() + otpValidity;
    const data = `${email}.${otp}.${expiry}`;
    const hash = crypto_1.default.createHmac("sha256", key).update(data).digest("hex");
    const fullhash = `${hash}.${expiry}`;
    console.log(`Generated OTP for ${email}: ${otp}`);
    try {
        // Send OTP via email
        await (0, otpSender_1.default)(otp, email);
        console.log(`OTP sent successfully to ${email}`);
    }
    catch (error) {
        console.error(`Failed to send OTP to ${email}:`, error);
        throw new Error("Failed to send OTP. Please try again.");
    }
    return fullhash;
};
exports.createNewOtp = createNewOtp;
