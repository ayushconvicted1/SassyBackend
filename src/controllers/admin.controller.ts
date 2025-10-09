import { Request, Response } from "express";
import prisma from "@/configs/db";

// Get dashboard statistics
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const [
      totalProducts,
      totalUsers,
      totalOrders,
      totalCategories,
      totalTags,
      totalOffers,
      totalSizes,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.user.count(),
      prisma.order.count(),
      prisma.category.count(),
      prisma.tag.count(),
      prisma.offer.count(),
      prisma.size.count(),
    ]);

    res.json({
      totalProducts,
      totalUsers,
      totalOrders,
      totalCategories,
      totalTags,
      totalOffers,
      totalSizes,
    });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const upsertProduct = async (req: Request, res: Response) => {
  console.log("hit");
  console.log(JSON.stringify(req.body, null, 2)); // Debug payload
  try {
    const {
      id,
      sku,
      name,
      description,
      price,
      stock,
      categoryId,
      imageIds,
      sizes,
      tags,
      hasSizing,
    } = req.body;

    // Validate required fields
    if (!name || !price || !stock || !categoryId || !sku) {
      return res.status(400).json({ error: "Missing required fields (including SKU)" });
    }

    // Validate SKU format - flexible to accommodate existing and new formats
    if (sku.length < 3 || sku.length > 10) {
      return res.status(400).json({
        error: "SKU must be between 3-10 characters"
      });
    }

    // Check if it contains only valid characters (letters, numbers, hyphens)
    const validSkuRegex = /^[A-Z0-9-]+$/;
    if (!validSkuRegex.test(sku.toUpperCase())) {
      return res.status(400).json({
        error: "SKU can only contain letters, numbers, and hyphens"
      });
    }

    // Check for duplicate SKU (for both create and update operations)
    const existingSkuProduct = await prisma.product.findFirst({
      where: {
        sku: sku.toUpperCase(),
        ...(id && { id: { not: Number(id) } }) // Exclude current product if updating
      },
    });
    if (existingSkuProduct) {
      return res
        .status(400)
        .json({ error: "Product with this SKU already exists" });
    }

    // If no id is provided (create operation), check for duplicate product name
    if (!id) {
      const existingProduct = await prisma.product.findFirst({
        where: { name },
      });
      if (existingProduct) {
        return res
          .status(400)
          .json({ error: "Product with this name already exists" });
      }
    }

    const product = await prisma.product.upsert({
      where: { id: id ? Number(id) : 0 },
      update: {
        sku: sku.toUpperCase(),
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        categoryId: Number(categoryId),
        hasSizing: Boolean(hasSizing),
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
            create: (Array.isArray(sizes) ? sizes : [sizes]).map(
              (s: any) => ({
                size: { connect: { id: Number(s.sizeId) } },
                stock: Number(s.stock) || 0,
              })
            ),
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
        sku: sku.toUpperCase(),
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        categoryId: Number(categoryId),
        hasSizing: Boolean(hasSizing),
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
            create: (Array.isArray(sizes) ? sizes : [sizes]).map(
              (s: any) => ({
                size: { connect: { id: Number(s.sizeId) } },
                stock: Number(s.stock) || 0,
              })
            ),
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
        sizes: { include: { size: true } },
        tags: { include: { tag: true } },
        category: true,
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
    const {
      status,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filters: any = {};

    // Status filter
    if (status) {
      filters.status = String(status);
    }

    // Search filter (by user name, email, order ID, or product SKU)
    if (search) {
      const searchTerm = String(search);
      filters.OR = [
        { id: { equals: isNaN(Number(searchTerm)) ? -1 : Number(searchTerm) } },
        { user: { name: { contains: searchTerm, mode: "insensitive" } } },
        { user: { email: { contains: searchTerm, mode: "insensitive" } } },
        { items: { some: { product: { sku: { contains: searchTerm, mode: "insensitive" } } } } },
      ];
    }

    // Determine sort order
    let orderBy: any = {};
    const sortField = String(sortBy);
    const order = String(sortOrder).toLowerCase() === "asc" ? "asc" : "desc";

    switch (sortField) {
      case "createdAt":
        orderBy = { createdAt: order };
        break;
      case "total":
        orderBy = { total: order };
        break;
      case "status":
        orderBy = { status: order };
        break;
      case "userName":
        // Note: Prisma doesn't support sorting by nested relations directly
        // Fall back to createdAt sorting
        orderBy = { createdAt: order };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    const orders = await prisma.order.findMany({
      where: filters,
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
        user: true,
      },
      orderBy,
    });
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateOrderDetails = async (req: Request, res: Response) => {
  // this api will update order details - waybill number and status can be updated manually
  try {
    const { id } = req.params;
    const { waybillNumber, status } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    // Validate status if provided
    const validStatuses = [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (status && !validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Validate waybill number format if provided
    if (waybillNumber && waybillNumber.length < 5) {
      return res.status(400).json({ error: "Invalid waybill number format" });
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (waybillNumber) {
      updateData.waybillNumber = waybillNumber.trim();
    }

    if (status) {
      updateData.status = status.toLowerCase();
    }

    // Update order
    const order = await prisma.order.update({
      where: { id: Number(id) },
      data: updateData,
    });

    // If waybill number was updated, trigger immediate status check
    if (waybillNumber) {
      try {
        const statusUpdateService = await import(
          "../services/statusUpdateService"
        );
        const result = await statusUpdateService.default.updateSingleOrder(
          Number(id)
        );

        if (result.success && result.newStatus !== result.oldStatus) {
          console.log(
            `Order ${id} status automatically updated: ${result.oldStatus} → ${result.newStatus}`
          );
        }
      } catch (statusError) {
        console.error(`Failed to update status for order ${id}:`, statusError);
        // Don't fail the update if status update fails
      }
    }

    let message = "✅ Order updated successfully";
    if (waybillNumber && status) {
      message = "✅ Waybill number and status updated successfully";
    } else if (waybillNumber) {
      message =
        "✅ Waybill number updated successfully. Status will be automatically updated from Delhivery.";
    } else if (status) {
      message = "✅ Order status updated successfully";
    }

    res.json({
      message,
      order,
    });
  } catch (err: any) {
    console.error("Error updating order details:", err);
    res.status(500).json({ error: err.message });
  }
};

// Manual status refresh for a specific order
export const refreshOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    const statusUpdateService = await import("../services/statusUpdateService");
    const result = await statusUpdateService.default.updateSingleOrder(
      Number(id)
    );

    if (result.success) {
      res.json({
        message: "✅ Order status refreshed successfully",
        oldStatus: result.oldStatus,
        newStatus: result.newStatus,
        changed: result.oldStatus !== result.newStatus,
      });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (err: any) {
    console.error("Error refreshing order status:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get status update service information
export const getStatusServiceInfo = async (req: Request, res: Response) => {
  try {
    const statusUpdateService = await import("../services/statusUpdateService");
    const serviceStatus = statusUpdateService.default.getStatus();

    // Test Delhivery credentials
    const delhiveryService = await import("../services/delhiveryService");
    const credentialsValid =
      await delhiveryService.default.validateCredentials();

    res.json({
      serviceStatus,
      delhiveryCredentialsValid: credentialsValid,
      message: "Status update service information retrieved",
    });
  } catch (err: any) {
    console.error("Error getting service info:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get all products for admin management
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      limit = "20",
      search,
      categoryId,
      tagId,
      status,
    } = req.query;

    const pageNumber = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (pageNumber - 1) * pageSize;

    const filters: any = {};
    if (search) {
      const searchTerm = String(search);

      // Frontend to backend tag name mapping
      const frontendToBackendTags: Record<string, string> = {
        "Power Play": "Gold",
        "Weekend Vibes": "Diamond",
        "Glow Up": "Wedding",
        "Date Night": "Silver",
        "Dazzle Hour": "Pearl",
        "Fearless Spark": "Sapphire",
        "Casual Glam": "Ruby",
        "Boss Gloss": "Emerald",
      };

      // Create search conditions for both frontend and backend tag names
      const tagSearchConditions = [];

      // Search by backend tag names (direct)
      tagSearchConditions.push({ tags: { some: { tag: { name: { contains: searchTerm, mode: "insensitive" } } } } });

      // Search by frontend display names (mapped to backend names)
      Object.entries(frontendToBackendTags).forEach(([frontendName, backendName]) => {
        if (frontendName.toLowerCase().includes(searchTerm.toLowerCase())) {
          tagSearchConditions.push({ tags: { some: { tag: { name: { equals: backendName, mode: "insensitive" } } } } });
        }
      });

      filters.OR = [
        // Search in product name
        { name: { contains: searchTerm, mode: "insensitive" } },
        // Search in product SKU
        { sku: { contains: searchTerm, mode: "insensitive" } },
        // Search in product description
        { description: { contains: searchTerm, mode: "insensitive" } },
        // Search in category name
        { category: { name: { contains: searchTerm, mode: "insensitive" } } },
        // Search in tag names (both backend and frontend names)
        ...tagSearchConditions,
      ];
    }
    if (categoryId) {
      const catId = Number(categoryId);
      if (!isNaN(catId)) filters.categoryId = catId;
    }
    if (tagId) {
      const tId = Number(tagId);
      if (!isNaN(tId)) {
        filters.tags = { some: { tagId: tId } };
      }
    }
    if (status) {
      if (status === "available") {
        filters.isAvailable = true;
      } else if (status === "unavailable") {
        filters.isAvailable = false;
      }
    }

    const totalCount = await prisma.product.count({ where: filters });

    const products = await prisma.product.findMany({
      where: filters,
      orderBy: { createdAt: "desc" },
      include: {
        images: true,
        category: true,
        sizes: { include: { size: true } },
        tags: { include: { tag: true } },
      },
      skip,
      take: pageSize,
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    res.json({
      data: products,
      pagination: {
        totalItems: totalCount,
        totalPages,
        currentPage: pageNumber,
        pageSize,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1,
      },
    });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

// Get all users for admin management
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { page = "1", limit = "20", search, role } = req.query;

    const pageNumber = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (pageNumber - 1) * pageSize;

    const filters: any = {};
    if (search) {
      filters.OR = [
        { name: { contains: String(search), mode: "insensitive" } },
        { email: { contains: String(search), mode: "insensitive" } },
      ];
    }
    if (role) {
      filters.role = String(role);
    }

    const totalCount = await prisma.user.count({ where: filters });

    const users = await prisma.user.findMany({
      where: filters,
      orderBy: { createdAt: "desc" },
      include: {
        avatar: true,
        orders: {
          select: {
            id: true,
            total: true,
            status: true,
            createdAt: true,
          },
        },
      },
      skip,
      take: pageSize,
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    res.json({
      data: users,
      pagination: {
        totalItems: totalCount,
        totalPages,
        currentPage: pageNumber,
        pageSize,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1,
      },
    });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

// Update user role
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!id || !role) {
      return res.status(400).json({ error: "User ID and role are required" });
    }

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { role },
      include: {
        avatar: true,
        orders: {
          select: {
            id: true,
            total: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    res.json({ message: "✅ User role updated successfully", user });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

// Get all sizes
export const getAllSizes = async (req: Request, res: Response) => {
  try {
    const sizes = await prisma.size.findMany({
      include: {
        products: {
          select: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
            stock: true,
          },
        },
      },
    });
    res.json(sizes);
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

// Create or update size
export const upsertSize = async (req: Request, res: Response) => {
  try {
    const { id, name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Size name is required" });
    }

    const size = await prisma.size.upsert({
      where: { id: id ? Number(id) : 0 },
      update: { name },
      create: { name },
    });

    res.json({ message: "✅ Size upserted successfully", size });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

// Delete size
export const deleteSize = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Size ID is required" });
    }

    await prisma.size.delete({ where: { id: Number(id) } });
    res.json({ message: "✅ Size deleted successfully" });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

// Get all categories
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
            isAvailable: true,
          },
        },
      },
    });
    res.json(categories);
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

// Create or update category
export const upsertCategory = async (req: Request, res: Response) => {
  try {
    const { id, name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const category = await prisma.category.upsert({
      where: { id: id ? Number(id) : 0 },
      update: { name },
      create: { name },
    });

    res.json({ message: "✅ Category upserted successfully", category });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

// Delete category
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Category ID is required" });
    }

    await prisma.category.delete({ where: { id: Number(id) } });
    res.json({ message: "✅ Category deleted successfully" });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

// Get all tags
export const getAllTags = async (req: Request, res: Response) => {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        products: {
          select: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                stock: true,
                isAvailable: true,
              },
            },
          },
        },
      },
    });
    res.json(tags);
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

// Create or update tag
export const upsertTag = async (req: Request, res: Response) => {
  try {
    const { id, name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Tag name is required" });
    }

    const tag = await prisma.tag.upsert({
      where: { id: id ? Number(id) : 0 },
      update: { name },
      create: { name },
    });

    res.json({ message: "✅ Tag upserted successfully", tag });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

// Delete tag
export const deleteTag = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Tag ID is required" });
    }

    await prisma.tag.delete({ where: { id: Number(id) } });
    res.json({ message: "✅ Tag deleted successfully" });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
