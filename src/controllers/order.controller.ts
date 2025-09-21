import { Request, Response } from "express";
import prisma from "@/configs/db";
import razorpay from "@/configs/razorpay";
import crypto from "crypto";
import fetch from "node-fetch";

export const getOrders = async (req: Request, res: Response) => {
  try {
    let id = 1;
    const userId = req?.user?.userId || 1;

    // if(!userId) return res.status(401).json({ error: "Unauthorized" });

    const orders = await prisma.order.findMany({
      where: { id: userId },
      select: {
        id: true,
        status: true,
        createdAt: true,
        waybillNumber: true,
        zipCode: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        country: true,
        phoneNumber: true,
        email: true,
        items: {
          select: {
            price: true,
            quantity: true,
            product: {
              select: {
                name: true,
                images: {
                  select: { url: true },
                },
              },
            },
          },
        },
      },
    });
    return res.json(orders);
  } catch (err: any) {
    console.log(err);
    return res.status(500).json({ error: err.message });
  }
};

export const checkout = async (req: Request, res: Response) => {
  try {
    // retrieve userId from token
    const { userDetails, items } = req.body;
    const userId= userDetails.userId;

    // retrieve address from user profile

    const address = {
      userId:userDetails.userId,
      email: userDetails.email,
      phoneNumber: userDetails.phoneNumber,
      addressLine1: userDetails.addressLine1,
      addressLine2: userDetails.addressLine2,
      city: userDetails.city,
      state: userDetails.state,
      country: userDetails.country,
      zipCode: userDetails.zipCode,
    };

    // get user
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    let total = 0;
    const orderItems: any[] = [];

    // calculate total + prepare order items with correct product price
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) continue;

      const price = Number(product.price);
      total += price * item.quantity;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price,
        size: item.size,
      });
    }

    if (orderItems.length === 0) {
      return res.status(400).json({ error: "No valid products in order" });
    }

    // Create Razorpay order
    const options = {
      amount: total * 100, // INR -> paise
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Save order in DB (status: pending)
    //userId is already there in address
    const order = await prisma.order.create({
      data: {
        total,
        razorpayOrderId: razorpayOrder.id,
        status: "pending",
        items: { create: orderItems },
        ...address,
        waybillNumber: "",
      },

    });

    res.json({
      id: razorpayOrder.id,
      currency: razorpayOrder.currency,
      amount: razorpayOrder.amount,
      orderId: order.id,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId, // DB orderId
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Fetch order items
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId: Number(orderId) },
      });

      for (const item of orderItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }, // ✅ reduce stock
        });
      }

      // ✅ Update order as paid
      const order = await prisma.order.update({
        where: { id: Number(orderId) },
        data: {
          status: "paid",
          paymentId: razorpay_payment_id,
        },
        include: { items: true }, // optional: return items also
      });

      // await createShipment();

      res.json({ success: true, message: "Payment verified", order });
    } else {
      res.status(400).json({ success: false, error: "Invalid signature" });
    }
  } catch (err: any) {
    console.error(err);

    res.status(500).json({ error: err.message });
  }
};

const API_KEY = "2f2997f3c071874c01512e3203f782b3da830341";

// const API_URL = "https://ucp.delhivery.com/api/p/create"; // ✅ Use the correct endpoint for your environment

// // Shipment JSON payload with proper structure
// const rawShipment = {
//   shipments: [
//     {
//       name: "Consignee Name",
//       phone: "9999999999", // ✅ Correct phone number format (string)
//       order: "TestOrder001",
//       add: "Huda Market, Haryana",
//       pin: "110042", // ✅ Pin code should be a string to avoid precision issues
//       city: "Gurugram",
//       state: "Haryana",
//       country: "India",
//       payment_mode: "Pre-paid", // ✅ Correct value
//       return_add: "Return Address", // ✅ Recommended to include a return address
//       return_pin: "122001",
//       products: [ // ✅ Include the required products array
//         {
//           name: "T-shirt",
//           sku: "TSHIRT123",
//           quantity: 1,
//           unit_price: 500
//         },
//         {
//           name: "Shoes",
//           sku: "SHOES456",
//           quantity: 1,
//           unit_price: 500
//         }
//       ],
//       weight: 0.5, // ✅ Use a numerical value for weight
//       shipment_width: 10,
//       shipment_height: 10,
//       shipment_length: 10,
//     }
//   ],
//   pickup_location: {
//     name: "Max Height" // ✅ Must exactly match your registered pickup location name
//   }
// };

// // Function to create shipment
// export const createShipment = async () => {

//   try {
//     const response = await fetch(API_URL, {
//       method: "POST",
//       headers: {
//         "Authorization": `Token ${API_KEY}`,
//         "Content-Type": "application/json", // ✅ Use correct content type
//       },
//       body: JSON.stringify(rawShipment) // ✅ Send JSON directly in the body
//     });

//     const data:any = await response.json();

//     if (response.ok && data.success) {
//       console.log("✅ Shipment created successfully:", data);
//     } else {
//       console.error("❌ API responded with error:", data);
//       // Log the full response body for detailed error debugging
//       console.error("❌ Full error response:", JSON.stringify(data, null, 2));
//     }
//   } catch (error) {
//     console.error("❌ Network/API Error:", error);
//   }
// };

