import { Request, Response } from "express";
import prisma from "@/configs/db";

export const upsertProduct = async (req: Request, res: Response) => {
  console.log("hit");
  console.log(JSON.stringify(req.body, null, 2)); // Debug payload
  try {
    const {
      id,
      name,
      description,
      price,
      stock,
      categoryId,
      imageIds,
      sizes,
      tags,
    } = req.body;

    // Validate required fields
    if (!name || !price || !stock || !categoryId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // If no id is provided (create operation), check for duplicate product name
    if (!id) {
      const existingProduct = await prisma.product.findFirst({
        where: { name },
      });
      if (existingProduct) {
        return res.status(400).json({ error: "Product with this name already exists" });
      }
    }

    const product = await prisma.product.upsert({
      where: { id: id ? Number(id) : 0 },
      update: {
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        categoryId: Number(categoryId),
        images: imageIds
          ? {
              set: [],
              connect: (Array.isArray(imageIds) ? imageIds : [imageIds]).map(
                (imgId: number) => ({
                  id: Number(imgId),
                })
              ),
            }
          : undefined,
        sizes: sizes
          ? {
              deleteMany: {},
              create: (Array.isArray(sizes) ? sizes : [sizes]).map((s: any) => ({
                size: { connect: { id: Number(s.sizeId) } },
                stock: Number(s.stock) || 0,
              })),
            }
          : undefined,
        tags: tags
          ? {
              deleteMany: {},
              create: (Array.isArray(tags) ? tags : [tags]).map(
                (tagId: number) => ({
                  tag: { connect: { id: Number(tagId) } },
                })
              ),
            }
          : undefined,
      },
      create: {
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        categoryId: Number(categoryId),
        images: imageIds
          ? {
              connect: (Array.isArray(imageIds) ? imageIds : [imageIds]).map(
                (imgId: number) => ({
                  id: Number(imgId),
                })
              ),
            }
          : undefined,
        sizes: sizes
          ? {
              create: (Array.isArray(sizes) ? sizes : [sizes]).map((s: any) => ({
                size: { connect: { id: Number(s.sizeId) } },
                stock: Number(s.stock) || 0,
              })),
            }
          : undefined,
        tags: tags
          ? {
              create: (Array.isArray(tags) ? tags : [tags]).map(
                (tagId: number) => ({
                  tag: { connect: { id: Number(tagId) } },
                })
              ),
            }
          : undefined,
      },
      include: {
        images: true,
        sizes: true,
        tags: { include: { tag: true } },
      },
    });

    res.json({ message: "✅ Product upserted successfully", product });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Product ID is required" });
    }
    await prisma.product.delete({ where: { id: Number(id) } });
    return res.json({ message: "✅ Product deleted successfully" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: { include: { product: true } },
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateOrderDetails = async (req: Request, res: Response) => {
  // this api will update order details like status, waybill number etc.
  try {
    const { id } = req.params;
    const { status, waybillNumber } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Order ID is required" });
    }
    const order = await prisma.order.update({
      where: { id: Number(id) },
      data: {
        status,
        waybillNumber,
      },
    });
    res.json({ message: "✅ Order updated successfully", order });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
