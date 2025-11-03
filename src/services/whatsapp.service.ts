import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
// Prefer a dedicated SMS-capable Twilio phone number. If not provided, try to
// fall back to the configured WhatsApp number by stripping the "whatsapp:" prefix.
const fromNumberFallback = process.env.TWILIO_WHATSAPP_NUMBER
  ? process.env.TWILIO_WHATSAPP_NUMBER.replace(/^whatsapp:/, "")
  : undefined;
const fromNumber = process.env.TWILIO_PHONE_NUMBER || fromNumberFallback;

const client = twilio(accountSid, authToken);

function formatPhoneNumber(phoneNumber: string) {
  // Ensure phone has a leading +, Twilio requires E.164 format for most regions
  return phoneNumber.startsWith("+") ? phoneNumber : "+" + phoneNumber;
}

export const sendOrderConfirmation = async (
  phoneNumber: string,
  orderId: number,
  total: number,
  status: string
) => {
  try {
    if (!fromNumber) {
      throw new Error("TWILIO_PHONE_NUMBER or TWILIO_WHATSAPP_NUMBER (fallback) is not configured");
    }

    const formattedNumber = formatPhoneNumber(phoneNumber);

    const message = await client.messages.create({
      body: `Thank you for your order at Sassy Shringaar!\n\nOrder Details:\nOrder ID: #${orderId}\nTotal Amount: ₹${total}\nStatus: ${status}\n\nWe'll keep you updated on your order status.`,
      from: fromNumber,
      to: formattedNumber,
    });

    console.log("SMS sent:", message.sid);
    return message;
  } catch (error) {
    console.error("Error sending SMS message:", error);
    throw error;
  }
};

export const sendOrderStatusUpdate = async (
  phoneNumber: string,
  orderId: number,
  newStatus: string
) => {
  try {
    if (!fromNumber) {
      throw new Error("TWILIO_PHONE_NUMBER or TWILIO_WHATSAPP_NUMBER (fallback) is not configured");
    }

    const formattedNumber = formatPhoneNumber(phoneNumber);

    const message = await client.messages.create({
      body: `Order Status Update!\n\nYour order #${orderId} has been ${newStatus}.\n\nTrack your order on our website for more details.`,
      from: fromNumber,
      to: formattedNumber,
    });

    console.log("SMS status update sent:", message.sid);
    return message;
  } catch (error) {
    console.error("Error sending SMS status update:", error);
    throw error;
  }
};

export const sendShippingUpdate = async (
  phoneNumber: string,
  orderId: number,
  trackingNumber: string
) => {
  try {
    if (!fromNumber) {
      throw new Error("TWILIO_PHONE_NUMBER or TWILIO_WHATSAPP_NUMBER (fallback) is not configured");
    }

    const formattedNumber = formatPhoneNumber(phoneNumber);

    const message = await client.messages.create({
      body: `Shipping Update!\n\nYour order #${orderId} has been shipped!\n\nTracking Number: ${trackingNumber}\n\nTrack your order on our website for more details.`,
      from: fromNumber,
      to: formattedNumber,
    });

    console.log("SMS shipping update sent:", message.sid);
    return message;
  } catch (error) {
    console.error("Error sending SMS shipping update:", error);
    throw error;
  }
};
