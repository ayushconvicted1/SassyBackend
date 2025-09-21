import prisma from "@/configs/db";
import { AuthRequest } from "@/middlewares/auth.middleware";
import { Response } from "express";

export const addToCart = async (req: AuthRequest, res: Response) => {
  // try {
  //   const userId = req.user?.userId;
  //   const { productId, quantity } = req.body;

  //   let cart = await prisma.cart.findUnique({ where: { userId } });

  //   if (!cart) {
  //     cart = await prisma.cart.create({ data: {id: userId } });
  //   }

  //   const existingItem = await prisma.cartItem.findFirst({
  //     where: { cartId: cart.id, productId },
  //   });

  //   if (existingItem) {
  //     await prisma.cartItem.update({
  //       where: { id: existingItem.id },
  //       data: { quantity: existingItem.quantity + quantity },
  //     });
  //   } else {
  //     await prisma.cartItem.create({
  //       data: { cartId: cart.id, productId, quantity },
  //     });
  //   }

  //   return res.status(201).json({ message: "Item added to cart" });
  // } catch (err: any) {
  //   res.status(500).json({ error: err.message });
  // }
};
