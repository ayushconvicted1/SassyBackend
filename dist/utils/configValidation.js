"use strict";
/**
 * Configuration validation utility for environment variables
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmailConfig = exports.validateEnvironmentConfig = void 0;
const validateEnvironmentConfig = () => {
    const requiredConfig = {
        // Database
        DATABASE_URL: "PostgreSQL database connection string",
        // JWT
        JWT_SECRET: "JWT secret key for token generation",
        OTP_SECRET: "Secret key for OTP hash generation",
        // Email/SMTP
        SMTP_HOST: "SMTP server host (e.g., smtp.gmail.com)",
        SMTP_PORT: "SMTP server port (e.g., 587)",
        SMTP_USER: "SMTP username/email",
        SMTP_PASS: "SMTP password/app password",
        // Razorpay (optional for basic functionality)
        RAZORPAY_KEY_ID: "Razorpay key ID",
        RAZORPAY_KEY_SECRET: "Razorpay key secret",
        // AWS S3 (optional for basic functionality)
        AWS_ACCESS_KEY_ID: "AWS access key ID",
        AWS_SECRET_ACCESS_KEY: "AWS secret access key",
        AWS_REGION: "AWS region",
        AWS_S3_BUCKET: "AWS S3 bucket name",
    };
    const missingVars = [];
    const invalidVars = [];
    // Check for missing variables
    Object.keys(requiredConfig).forEach((key) => {
        if (!process.env[key]) {
            missingVars.push(key);
        }
    });
    // Validate specific configurations
    if (process.env.SMTP_PORT && isNaN(parseInt(process.env.SMTP_PORT))) {
        invalidVars.push("SMTP_PORT must be a valid number");
    }
    if (process.env.DATABASE_URL &&
        !process.env.DATABASE_URL.startsWith("postgresql://")) {
        invalidVars.push("DATABASE_URL must be a valid PostgreSQL connection string");
    }
    // Report validation results
    if (missingVars.length > 0 || invalidVars.length > 0) {
        console.error("❌ Environment Configuration Validation Failed:");
        if (missingVars.length > 0) {
            console.error("\n📋 Missing Required Variables:");
            missingVars.forEach((varName) => {
                console.error(`  - ${varName}: ${requiredConfig[varName]}`);
            });
        }
        if (invalidVars.length > 0) {
            console.error("\n⚠️  Invalid Variable Values:");
            invalidVars.forEach((error) => {
                console.error(`  - ${error}`);
            });
        }
        console.error("\n💡 Please check your .env file and ensure all required variables are set correctly.");
        console.error("📖 Refer to DATABASE_SETUP.md for detailed configuration instructions.");
        throw new Error("Environment configuration validation failed");
    }
    console.log("✅ Environment configuration validation passed");
};
exports.validateEnvironmentConfig = validateEnvironmentConfig;
const getEmailConfig = () => {
    const requiredEmailVars = [
        "SMTP_HOST",
        "SMTP_PORT",
        "SMTP_USER",
        "SMTP_PASS",
    ];
    const missingVars = requiredEmailVars.filter((varName) => !process.env[varName]);
    if (missingVars.length > 0) {
        throw new Error(`Missing email configuration: ${missingVars.join(", ")}`);
    }
    return {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: process.env.SMTP_PORT === "465",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    };
};
exports.getEmailConfig = getEmailConfig;
