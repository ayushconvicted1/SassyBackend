"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productSelect = void 0;
exports.formatProduct = formatProduct;
exports.productSelect = {
    id: true,
    name: true,
    description: true,
    price: true,
    crossedPrice: true,
    stock: true,
    createdAt: true,
    updatedAt: true,
    isAvailable: true,
    hasSizing: true,
    categoryId: true,
    category: {
        select: {
            id: true,
            name: true,
        },
    },
    images: {
        select: {
            url: true,
        },
    },
    sizes: {
        select: {
            size: {
                select: {
                    name: true,
                },
            },
            stock: true,
        },
    },
    tags: {
        select: {
            tag: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    },
};
function formatProduct(product) {
    return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        crossedPrice: product.crossedPrice ? Number(product.crossedPrice) : null,
        stock: product.stock,
        isAvailable: product.isAvailable,
        hasSizing: product.hasSizing ?? false,
        category: product.category?.name ?? null,
        categoryId: product.categoryId,
        images: product.images?.map((img) => img.url) ?? [],
        tags: product.tags?.map((t) => t.tag.name) ?? [],
        sizes: product.sizes ?? [], // Include sizes data
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
    };
}
