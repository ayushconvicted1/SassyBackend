import prisma from "@/configs/db";
import { formatProduct, productSelect } from "@/configs/select";
import { Request, Response } from "express";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      categoryId,
      sort = "desc",
      search,
      page = "1",
      limit = "10",
      tagId,
      minPrice,
      maxPrice,
    } = req.query;

    // ✅ Pagination - Ensure valid numbers
    const pageNumber = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(limit) || 10)); // Limit max page size to 100
    const skip = (pageNumber - 1) * pageSize;

    // ✅ Filters
    const filters: any = {};
    if (categoryId) {
      const catId = Number(categoryId);
      if (!isNaN(catId)) filters.categoryId = catId;
    }
    if (search) {
      filters.name = { contains: String(search), mode: "insensitive" };
    }
    if (tagId) {
      const tId = Number(tagId);
      if (!isNaN(tId)) {
        filters.tags = { some: { tagId: tId } };
      }
    }

    // ✅ Price range filters
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) {
        const min = Number(minPrice);
        if (!isNaN(min)) filters.price.gte = min;
      }
      if (maxPrice) {
        const max = Number(maxPrice);
        if (!isNaN(max)) filters.price.lte = max;
      }
    }

    // ✅ Fetch total count for pagination meta
    const totalCount = await prisma.product.count({ where: filters });

    console.log("Filters:", filters);
    console.log("Pagination:", { pageNumber, pageSize, skip, totalCount });
    console.log("Query parameters:", {
      categoryId,
      sort,
      search,
      page,
      limit,
      tagId,
      minPrice,
      maxPrice,
    });

    // ✅ Determine sort order
    let orderBy: any = {};
    if (sort === "asc") {
      orderBy = { price: "asc" };
    } else if (sort === "desc") {
      orderBy = { price: "desc" };
    } else if (sort === "name-asc") {
      orderBy = { name: "asc" };
    } else if (sort === "name-desc") {
      orderBy = { name: "desc" };
    } else {
      // Default to newest first (by createdAt)
      orderBy = { createdAt: "desc" };
    }

    const products = await prisma.product.findMany({
      where: filters,
      orderBy,
      select: productSelect,
      skip,
      take: pageSize,
    });

    // ✅ Fetch paginated products
    // const products = await prisma.product.findMany({
    //   where: filters,
    //   orderBy: { price: sort === "asc" ? "asc" : "desc" },
    //   include: {
    //     category: true,
    //     images: true,
    //     sizes:{
    //       select:{
    //         size:{
    //           select:{
    //             name:true
    //           }
    //         },
    //         stock:true
    //       }
    //     },
    //     tags: {
    //       select: {
    //         tag: {
    //           select: {
    //             id: true,
    //             name: true,
    //           },
    //         },
    //       },
    //     },
    //   },
    //   skip,
    //   take: pageSize,
    // });

    // // ✅ Flatten tags
    // const formattedProducts = products.map((p) => ({
    //   ...p,
    //   tags: p.tags.map((t) => ({
    //     id: t.tag.id,
    //     name: t.tag.name,
    //   })),
    // }));

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

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Product ID is required" });
    }
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      select: productSelect,
    });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    const formattedProduct = formatProduct(product);
    res.json(formattedProduct);
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    res.json(categories);
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const getTags = async (req: Request, res: Response) => {
  try {
    const tags = await prisma.tag.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    res.json(tags);
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
