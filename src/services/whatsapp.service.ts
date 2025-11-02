import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

const client = twilio(accountSid, authToken);

export const sendOrderConfirmation = async (
  phoneNumber: string,
  orderId: number,
  total: number,
  status: string
) => {
  try {
    // Format the phone number to WhatsApp format
    const formattedNumber = `whatsapp:${
      phoneNumber.startsWith("+") ? phoneNumber : "+" + phoneNumber
    }`;

    const message = await client.messages.create({
      body: `Thank you for your order at Sassy Shringaar!\n\nOrder Details:\nOrder ID: #${orderId}\nTotal Amount: ₹${total}\nStatus: ${status}\n\nWe'll keep you updated on your order status.`,
      from: `whatsapp:${fromNumber}`,
      to: formattedNumber,
    });

    console.log("WhatsApp message sent:", message.sid);
    return message;
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    throw error;
  }
};

export const sendOrderStatusUpdate = async (
  phoneNumber: string,
  orderId: number,
  newStatus: string
) => {
  try {
    const formattedNumber = `whatsapp:${
      phoneNumber.startsWith("+") ? phoneNumber : "+" + phoneNumber
    }`;

    const message = await client.messages.create({
      body: `Order Status Update!\n\nYour order #${orderId} has been ${newStatus}.\n\nTrack your order on our website for more details.`,
      from: `whatsapp:${fromNumber}`,
      to: formattedNumber,
    });

    console.log("WhatsApp status update sent:", message.sid);
    return message;
  } catch (error) {
    console.error("Error sending WhatsApp status update:", error);
    throw error;
  }
};

export const sendShippingUpdate = async (
  phoneNumber: string,
  orderId: number,
  trackingNumber: string
) => {
  try {
    const formattedNumber = `whatsapp:${
      phoneNumber.startsWith("+") ? phoneNumber : "+" + phoneNumber
    }`;

    const message = await client.messages.create({
      body: `Shipping Update!\n\nYour order #${orderId} has been shipped!\n\nTracking Number: ${trackingNumber}\n\nTrack your order on our website for more details.`,
      from: `whatsapp:${fromNumber}`,
      to: formattedNumber,
    });

    console.log("WhatsApp shipping update sent:", message.sid);
    return message;
  } catch (error) {
    console.error("Error sending WhatsApp shipping update:", error);
    throw error;
  }
};
