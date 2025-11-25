"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendShippingUpdate = exports.sendOrderStatusUpdate = exports.sendOrderConfirmation = void 0;
const twilio_1 = __importDefault(require("twilio"));
// --- Configuration & Validation ---
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
// 1. Validate Core Credentials - This is the most likely source of your error.
if (!accountSid) {
    throw new Error("TWILIO_ACCOUNT_SID is not set in environment variables.");
}
if (!authToken) {
    throw new Error("TWILIO_AUTH_TOKEN is not set in environment variables.");
}
const client = (0, twilio_1.default)(accountSid, authToken);
// 2. Validate 'From' Number Configuration
// Your original logic tries to send an SMS. Ensure you have an SMS-capable number.
const smsFromNumber = process.env.TWILIO_PHONE_NUMBER;
const whatsappFallback = process.env.TWILIO_WHATSAPP_NUMBER
    ? process.env.TWILIO_WHATSAPP_NUMBER.replace(/^whatsapp:/, "")
    : undefined;
// Use the SMS number first, then the fallback.
let fromNumber = smsFromNumber || whatsappFallback;
if (!fromNumber) {
    throw new Error("TWILIO_PHONE_NUMBER (or TWILIO_WHATSAPP_NUMBER as fallback) is not configured.");
}
// 3. Ensure the 'from' number is in E.164 format (e.g., +1234567890)
// This cleans and validates the number format once.
const validatedFromNumber = `+${fromNumber.replace(/\D/g, "")}`;
/**
 * Formats a recipient phone number to E.164 format.
 */
function formatPhoneNumber(phoneNumber) {
    // Removes all non-digit characters and ensures a leading +
    const digits = phoneNumber.replace(/\D/g, "");
    return `+${digits}`;
}
// --- Service Functions ---
const sendOrderConfirmation = async (phoneNumber, orderId, total, status) => {
    try {
        const formattedNumber = formatPhoneNumber(phoneNumber);
        const message = await client.messages.create({
            body: `Thank you for your order at Sassy Shringaar!\n\nOrder Details:\nOrder ID: #${orderId}\nTotal Amount: ₹${total}\nStatus: ${status}\n\nWe'll keep you updated on your order status.`,
            from: validatedFromNumber,
            to: formattedNumber,
        });
        console.log("SMS sent:", message.sid);
        return message;
    }
    catch (error) {
        console.error("Error sending SMS message:", error);
        throw error;
    }
};
exports.sendOrderConfirmation = sendOrderConfirmation;
const sendOrderStatusUpdate = async (phoneNumber, orderId, newStatus) => {
    try {
        const formattedNumber = formatPhoneNumber(phoneNumber);
        const message = await client.messages.create({
            body: `Order Status Update!\n\nYour order #${orderId} has been ${newStatus}.\n\nTrack your order on our website for more details.`,
            from: validatedFromNumber,
            to: formattedNumber,
        });
        console.log("SMS status update sent:", message.sid);
        return message;
    }
    catch (error) {
        console.error("Error sending SMS status update:", error);
        throw error;
    }
};
exports.sendOrderStatusUpdate = sendOrderStatusUpdate;
const sendShippingUpdate = async (phoneNumber, orderId, trackingNumber) => {
    try {
        const formattedNumber = formatPhoneNumber(phoneNumber);
        const message = await client.messages.create({
            body: `Shipping Update!\n\nYour order #${orderId} has been shipped!\n\nTracking Number: ${trackingNumber}\n\nTrack your order on our website for more details.`,
            from: validatedFromNumber,
            to: formattedNumber,
        });
        console.log("SMS shipping update sent:", message.sid);
        return message;
    }
    catch (error) {
        console.error("Error sending SMS shipping update:", error);
        throw error;
    }
};
exports.sendShippingUpdate = sendShippingUpdate;
