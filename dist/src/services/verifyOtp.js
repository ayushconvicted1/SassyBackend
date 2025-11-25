"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtp = void 0;
const crypto_1 = __importDefault(require("crypto"));
const verifyOtp = (user) => {
    const key = process.env.OTP_SECRET;
    const [hashvalue, expiry] = user.hash.split(".");
    const data = `${user.email}.${user.otp}.${expiry}`;
    if (Date.now() > parseInt(expiry))
        return false;
    const newHash = crypto_1.default
        .createHmac("sha256", key || "")
        .update(data)
        .digest("hex");
    console.log(newHash);
    if (hashvalue === newHash) {
        console.log("hash matched");
        return true;
    }
    console.log("hash not matched");
    return false;
};
exports.verifyOtp = verifyOtp;
