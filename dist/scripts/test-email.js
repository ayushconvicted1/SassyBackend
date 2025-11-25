"use strict";
/**
 * Email functionality test script
 * Run this script to test the email sending functionality
 *
 * Usage: npm run test:email
 * or: npx ts-node --require tsconfig-paths/register scripts/test-email.ts
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables
dotenv_1.default.config({ path: path_1.default.join(__dirname, "../.env") });
const otpSender_1 = __importDefault(require("../src/services/otpSender"));
const testEmailSending = async () => {
    console.log("🧪 Testing Email Sending Functionality...\n");
    // Check if required environment variables are set
    const requiredVars = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"];
    const missingVars = requiredVars.filter((varName) => !process.env[varName]);
    if (missingVars.length > 0) {
        console.error("❌ Missing required environment variables:");
        missingVars.forEach((varName) => {
            console.error(`   - ${varName}`);
        });
        console.error("\n💡 Please set these variables in your .env file");
        process.exit(1);
    }
    console.log("✅ Environment variables check passed");
    console.log(`📧 SMTP Host: ${process.env.SMTP_HOST}`);
    console.log(`📧 SMTP Port: ${process.env.SMTP_PORT}`);
    console.log(`📧 SMTP User: ${process.env.SMTP_USER}`);
    console.log("");
    // Test email sending
    const testEmail = process.env.TEST_EMAIL || "test@example.com";
    const testOtp = Math.floor(1000 + Math.random() * 9000);
    try {
        console.log(`📤 Sending test email to: ${testEmail}`);
        console.log(`🔢 Test OTP: ${testOtp}`);
        console.log("");
        await (0, otpSender_1.default)(testOtp, testEmail);
        console.log("✅ Email sent successfully!");
        console.log("📬 Check your inbox for the test email");
        console.log("");
        console.log("🎉 Email functionality is working correctly!");
    }
    catch (error) {
        console.error("❌ Email sending failed:");
        console.error(error);
        console.log("");
        console.log("🔧 Troubleshooting tips:");
        console.log("   1. Check your SMTP credentials");
        console.log("   2. Ensure 2FA is enabled and app password is used");
        console.log("   3. Verify SMTP host and port settings");
        console.log("   4. Check firewall/network restrictions");
        process.exit(1);
    }
};
// Run the test
testEmailSending().catch(console.error);
