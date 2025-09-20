import prisma from "@/configs/db";
import { productSelect } from "@/configs/select";
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
    } = req.query;

    // ✅ Pagination
    const pageNumber = Number(page) || 1;
    const pageSize = Number(limit) || 10;
    const skip = (pageNumber - 1) * pageSize;

    // ✅ Filters
    const filters: any = {};
    if (categoryId) filters.categoryId = Number(categoryId);
    if (search)
      filters.name = { contains: String(search) };

    // ✅ Tag filter (only one tagId expected)
    if (tagId) {
      filters.tags = { some: { tagId: Number(tagId) } };
    }

    // ✅ Fetch total count for pagination meta
    const totalCount = await prisma.product.count({ where: filters });

    console.log("Filters:", filters);


     const products = await prisma.product.findMany({
      where: filters,
      orderBy: { price: sort === "asc" ? "asc" : "desc" },
      select:productSelect,
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

    res.json({
      data: products,
      pagination: {
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: pageNumber,
        pageSize,
      },
    });
  } catch (err: any) {
    console.log(err)
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getProducts };
