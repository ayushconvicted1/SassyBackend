"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAddressComplete = exports.updateProfile = exports.getProfile = exports.otpVerification = exports.login = exports.register = void 0;
const db_1 = __importDefault(require("../configs/db"));
const auth_1 = require("../utils/auth");
const verifyOtp_1 = require("../services/verifyOtp");
const tokenGenerator_1 = __importDefault(require("../services/tokenGenerator"));
const register = async (req, res) => {
    try {
        const { email, name } = req.body;
        if (!email || !name) {
            return res.status(400).json({ message: "Email and name are required" });
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res
                .status(400)
                .json({ message: "Please enter a valid email address" });
        }
        const existingUser = await db_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hash = await (0, auth_1.createNewOtp)(email);
        return res
            .status(200)
            .json({
            message: "OTP sent successfully to your email",
            hash,
            newUser: true,
        });
    }
    catch (err) {
        console.error("Register Error:", err);
        // Handle specific email sending errors
        if (err.message.includes("Failed to send OTP") ||
            err.message.includes("Missing required environment variables")) {
            return res
                .status(500)
                .json({
                error: "Email service temporarily unavailable. Please try again later.",
            });
        }
        res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res
                .status(400)
                .json({ message: "Please enter a valid email address" });
        }
        const existingUser = await db_1.default.user.findUnique({ where: { email } });
        if (!existingUser) {
            return res.status(400).json({ message: "User doesn't exist" });
        }
        const hash = await (0, auth_1.createNewOtp)(email);
        return res
            .status(200)
            .json({
            message: "OTP sent successfully to your email",
            hash,
            newUser: false,
        });
    }
    catch (err) {
        console.error("Login Error:", err);
        // Handle specific email sending errors
        if (err.message.includes("Failed to send OTP") ||
            err.message.includes("Missing required environment variables")) {
            return res
                .status(500)
                .json({
                error: "Email service temporarily unavailable. Please try again later.",
            });
        }
        res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.login = login;
const otpVerification = async (req, res) => {
    try {
        const { email, hash, newUser, name, otp } = req.body;
        if (!email || !hash || !otp) {
            return res.status(400).json({ message: "Missing OTP verification data" });
        }
        const isOtpValid = await (0, verifyOtp_1.verifyOtp)({ email, hash, otp });
        if (!isOtpValid) {
            return res.status(400).json({ message: "OTP doesn't match" });
        }
        if (newUser == true) {
            if (!name) {
                return res
                    .status(400)
                    .json({ message: "Name is required for new users" });
            }
            const createdUser = await db_1.default.user.create({
                data: {
                    email,
                    name,
                    role: "USER",
                },
            });
            const token = (0, tokenGenerator_1.default)(email, createdUser.id);
            return res.status(201).json({
                message: "User created successfully",
                user: createdUser,
                token,
            });
        }
        else {
            // For existing users, fetch user data and return it
            const existingUser = await db_1.default.user.findUnique({
                where: { email },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    zipCode: true,
                    addressLine1: true,
                    addressLine2: true,
                    city: true,
                    state: true,
                    country: true,
                    phoneNumber: true,
                    countryCode: true,
                    updatedAt: true,
                },
            });
            if (!existingUser) {
                return res.status(404).json({ message: "User not found" });
            }
            const token = (0, tokenGenerator_1.default)(email, existingUser.id);
            return res.status(200).json({
                message: "Login successful",
                user: existingUser,
                token,
            });
        }
    }
    catch (err) {
        console.error("OTP Verification Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.otpVerification = otpVerification;
const getProfile = async (req, res) => {
    try {
        // get id from auth middleware
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }
        const user = await db_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                zipCode: true,
                addressLine1: true,
                addressLine2: true,
                city: true,
                state: true,
                country: true,
                phoneNumber: true,
                countryCode: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        res.json({ user });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }
        // Extract only allowed fields
        const { name, zipCode, addressLine1, addressLine2, city, state, country, phoneNumber, countryCode, } = req.body;
        // Validate required fields
        const validationErrors = [];
        if (!name || name.trim().length === 0) {
            validationErrors.push("Name is required");
        }
        if (!addressLine1 || addressLine1.trim().length === 0) {
            validationErrors.push("Address Line 1 is required");
        }
        if (!city || city.trim().length === 0) {
            validationErrors.push("City is required");
        }
        if (!state || state.trim().length === 0) {
            validationErrors.push("State is required");
        }
        if (!zipCode || zipCode.trim().length === 0) {
            validationErrors.push("ZIP code is required");
        }
        else if (!/^\d{6}$/.test(zipCode)) {
            validationErrors.push("ZIP code must be exactly 6 digits");
        }
        if (!country || country.trim().length === 0) {
            validationErrors.push("Country is required");
        }
        if (!phoneNumber || phoneNumber.trim().length === 0) {
            validationErrors.push("Phone number is required");
        }
        else if (phoneNumber.length < 10) {
            validationErrors.push("Please enter a valid phone number");
        }
        if (validationErrors.length > 0) {
            return res.status(400).json({
                error: "Validation failed",
                details: validationErrors,
            });
        }
        const updatedUser = await db_1.default.user.update({
            where: { id: userId },
            data: {
                name: name.trim(),
                zipCode: zipCode.trim(),
                addressLine1: addressLine1.trim(),
                addressLine2: addressLine2?.trim() || null,
                city: city.trim(),
                state: state.trim(),
                country: country.trim(),
                phoneNumber: phoneNumber.trim(),
                countryCode: countryCode?.trim() || null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                zipCode: true,
                addressLine1: true,
                addressLine2: true,
                city: true,
                state: true,
                country: true,
                phoneNumber: true,
                countryCode: true,
                updatedAt: true,
            },
        });
        return res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser,
        });
    }
    catch (err) {
        console.error("Error updating profile:", err);
        return res.status(500).json({ error: "Something went wrong" });
    }
};
exports.updateProfile = updateProfile;
const checkAddressComplete = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }
        const user = await db_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                addressLine1: true,
                city: true,
                state: true,
                zipCode: true,
                country: true,
                phoneNumber: true,
                countryCode: true,
            },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Check if all required address fields are present
        const hasCompleteAddress = !!(user.addressLine1 &&
            user.city &&
            user.state &&
            user.zipCode &&
            user.country &&
            user.phoneNumber);
        return res.status(200).json({
            hasCompleteAddress,
            address: hasCompleteAddress
                ? {
                    addressLine1: user.addressLine1,
                    city: user.city,
                    state: user.state,
                    zipCode: user.zipCode,
                    country: user.country,
                    phoneNumber: user.phoneNumber,
                    countryCode: user.countryCode,
                }
                : null,
        });
    }
    catch (err) {
        console.error("Error checking address completeness:", err);
        return res.status(500).json({ error: "Something went wrong" });
    }
};
exports.checkAddressComplete = checkAddressComplete;
