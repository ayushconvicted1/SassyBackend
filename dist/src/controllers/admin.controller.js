"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeTopPickProduct = exports.setTopPickProducts = exports.getTopPickProducts = exports.uploadHomePageImage = exports.deleteHomePageImage = exports.bulkUpdateHomePageImages = exports.upsertHomePageImage = exports.getAllHomePageImages = exports.deleteTag = exports.upsertTag = exports.getAllTags = exports.deleteCategory = exports.upsertCategory = exports.getAllCategories = exports.deleteSize = exports.upsertSize = exports.getAllSizes = exports.updateUserRole = exports.getAllUsers = exports.getAllProducts = exports.getStatusServiceInfo = exports.refreshOrderStatus = exports.updateOrderDetails = exports.getAllOrders = exports.deleteProduct = exports.upsertProduct = exports.getDashboardStats = void 0;
const db_1 = __importDefault(require("../configs/db"));
const s3uploadCompressed_1 = require("../utils/s3uploadCompressed");
const s3delete_1 = require("../utils/s3delete");
// Get dashboard statistics
const getDashboardStats = async (req, res) => {
    try {
        const [totalProducts, totalUsers, totalOrders, totalCategories, totalTags, totalOffers, totalSizes,] = await Promise.all([
            db_1.default.product.count(),
            db_1.default.user.count(),
            db_1.default.order.count(),
            db_1.default.category.count(),
            db_1.default.tag.count(),
            db_1.default.offer.count(),
            db_1.default.size.count(),
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
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.getDashboardStats = getDashboardStats;
const upsertProduct = async (req, res) => {
    console.log("hit");
    console.log(JSON.stringify(req.body, null, 2)); // Debug payload
    try {
        const { id, sku, name, description, price, crossedPrice, stock, categoryId, imageIds, sizes, tags, hasSizing, } = req.body;
        // Validate required fields
        if (!name || !price || !stock || !categoryId || !sku) {
            return res
                .status(400)
                .json({ error: "Missing required fields (including SKU)" });
        }
        // Validate SKU format - flexible to accommodate existing and new formats
        if (sku.length < 3 || sku.length > 10) {
            return res.status(400).json({
                error: "SKU must be between 3-10 characters",
            });
        }
        // Check if it contains only valid characters (letters, numbers, hyphens)
        const validSkuRegex = /^[A-Z0-9-]+$/;
        if (!validSkuRegex.test(sku.toUpperCase())) {
            return res.status(400).json({
                error: "SKU can only contain letters, numbers, and hyphens",
            });
        }
        // Check for duplicate SKU (for both create and update operations)
        const existingSkuProduct = await db_1.default.product.findFirst({
            where: {
                sku: sku.toUpperCase(),
                ...(id && { id: { not: Number(id) } }), // Exclude current product if updating
            },
        });
        if (existingSkuProduct) {
            return res
                .status(400)
                .json({ error: "Product with this SKU already exists" });
        }
        // If no id is provided (create operation), check for duplicate product name
        if (!id) {
            const existingProduct = await db_1.default.product.findFirst({
                where: { name },
            });
            if (existingProduct) {
                return res
                    .status(400)
                    .json({ error: "Product with this name already exists" });
            }
        }
        const product = await db_1.default.product.upsert({
            where: { id: id ? Number(id) : 0 },
            update: {
                sku: sku.toUpperCase(),
                name,
                description,
                price: Number(price),
                crossedPrice: crossedPrice ? Number(crossedPrice) : null,
                stock: Number(stock),
                categoryId: Number(categoryId),
                hasSizing: Boolean(hasSizing),
                images: imageIds
                    ? {
                        set: [],
                        connect: (Array.isArray(imageIds) ? imageIds : [imageIds]).map((imgId) => ({
                            id: Number(imgId),
                        })),
                    }
                    : undefined,
                sizes: sizes
                    ? {
                        deleteMany: {},
                        create: (Array.isArray(sizes) ? sizes : [sizes]).map((s) => ({
                            size: { connect: { id: Number(s.sizeId) } },
                            stock: Number(s.stock) || 0,
                        })),
                    }
                    : undefined,
                tags: tags
                    ? {
                        deleteMany: {},
                        create: (Array.isArray(tags) ? tags : [tags]).map((tagId) => ({
                            tag: { connect: { id: Number(tagId) } },
                        })),
                    }
                    : undefined,
            },
            create: {
                sku: sku.toUpperCase(),
                name,
                description,
                price: Number(price),
                crossedPrice: crossedPrice ? Number(crossedPrice) : null,
                stock: Number(stock),
                categoryId: Number(categoryId),
                hasSizing: Boolean(hasSizing),
                images: imageIds
                    ? {
                        connect: (Array.isArray(imageIds) ? imageIds : [imageIds]).map((imgId) => ({
                            id: Number(imgId),
                        })),
                    }
                    : undefined,
                sizes: sizes
                    ? {
                        create: (Array.isArray(sizes) ? sizes : [sizes]).map((s) => ({
                            size: { connect: { id: Number(s.sizeId) } },
                            stock: Number(s.stock) || 0,
                        })),
                    }
                    : undefined,
                tags: tags
                    ? {
                        create: (Array.isArray(tags) ? tags : [tags]).map((tagId) => ({
                            tag: { connect: { id: Number(tagId) } },
                        })),
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
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.upsertProduct = upsertProduct;
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "Product ID is required" });
        }
        // Fetch product with images first
        const product = await db_1.default.product.findUnique({
            where: { id: Number(id) },
            include: {
                images: true, // Assuming there's a relation to Media
            },
        });
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        // Get all media associated with this product
        const productImages = await db_1.default.media.findMany({
            where: { productId: Number(id) },
        });
        // Delete all images from S3
        if (productImages.length > 0) {
            console.log(`Deleting ${productImages.length} images from S3 for product ${id}`);
            const s3Urls = productImages.map((img) => img.url);
            await Promise.all(s3Urls.map((url) => (0, s3delete_1.deleteFromS3)(url)));
        }
        // Delete from database (cascade should handle related records)
        await db_1.default.product.delete({ where: { id: Number(id) } });
        return res.json({ message: "✅ Product deleted successfully" });
    }
    catch (err) {
        console.error("Error deleting product:", err);
        return res.status(500).json({ error: err.message });
    }
};
exports.deleteProduct = deleteProduct;
const getAllOrders = async (req, res) => {
    try {
        const { status, search, sortBy = "createdAt", sortOrder = "desc", } = req.query;
        const filters = {};
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
                {
                    items: {
                        some: {
                            product: { sku: { contains: searchTerm, mode: "insensitive" } },
                        },
                    },
                },
            ];
        }
        // Determine sort order
        let orderBy = {};
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
        const orders = await db_1.default.order.findMany({
            where: filters,
            select: {
                id: true,
                status: true,
                total: true,
                subtotal: true,
                shipping: true,
                tax: true,
                offerDiscount: true,
                prepaidDiscount: true,
                appliedDiscount: true,
                paymentMethod: true,
                razorpayOrderId: true,
                paymentId: true,
                waybillNumber: true,
                zipCode: true,
                addressLine1: true,
                addressLine2: true,
                city: true,
                state: true,
                country: true,
                phoneNumber: true,
                email: true,
                createdAt: true,
                updatedAt: true,
                items: {
                    select: {
                        id: true,
                        productId: true,
                        quantity: true,
                        price: true,
                        size: true,
                        product: {
                            select: {
                                name: true,
                                images: {
                                    select: {
                                        url: true,
                                    },
                                },
                            },
                        },
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy,
        });
        res.json(orders);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getAllOrders = getAllOrders;
const updateOrderDetails = async (req, res) => {
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
        const updateData = {
            updatedAt: new Date(),
        };
        if (waybillNumber) {
            updateData.waybillNumber = waybillNumber.trim();
        }
        if (status) {
            updateData.status = status.toLowerCase();
        }
        // Update order
        const order = await db_1.default.order.update({
            where: { id: Number(id) },
            data: updateData,
        });
        // If waybill number was updated, trigger immediate status check
        if (waybillNumber) {
            try {
                const statusUpdateService = await Promise.resolve().then(() => __importStar(require("../services/statusUpdateService")));
                const result = await statusUpdateService.default.updateSingleOrder(Number(id));
                if (result.success && result.newStatus !== result.oldStatus) {
                    console.log(`Order ${id} status automatically updated: ${result.oldStatus} → ${result.newStatus}`);
                }
            }
            catch (statusError) {
                console.error(`Failed to update status for order ${id}:`, statusError);
                // Don't fail the update if status update fails
            }
        }
        let message = "✅ Order updated successfully";
        if (waybillNumber && status) {
            message = "✅ Waybill number and status updated successfully";
        }
        else if (waybillNumber) {
            message =
                "✅ Waybill number updated successfully. Status will be automatically updated from Delhivery.";
        }
        else if (status) {
            message = "✅ Order status updated successfully";
        }
        res.json({
            message,
            order,
        });
    }
    catch (err) {
        console.error("Error updating order details:", err);
        res.status(500).json({ error: err.message });
    }
};
exports.updateOrderDetails = updateOrderDetails;
// Manual status refresh for a specific order
const refreshOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "Order ID is required" });
        }
        const statusUpdateService = await Promise.resolve().then(() => __importStar(require("../services/statusUpdateService")));
        const result = await statusUpdateService.default.updateSingleOrder(Number(id));
        if (result.success) {
            res.json({
                message: "✅ Order status refreshed successfully",
                oldStatus: result.oldStatus,
                newStatus: result.newStatus,
                changed: result.oldStatus !== result.newStatus,
            });
        }
        else {
            res.status(400).json({ error: result.error });
        }
    }
    catch (err) {
        console.error("Error refreshing order status:", err);
        res.status(500).json({ error: err.message });
    }
};
exports.refreshOrderStatus = refreshOrderStatus;
// Get status update service information
const getStatusServiceInfo = async (req, res) => {
    try {
        const statusUpdateService = await Promise.resolve().then(() => __importStar(require("../services/statusUpdateService")));
        const serviceStatus = statusUpdateService.default.getStatus();
        // Test Delhivery credentials
        const delhiveryService = await Promise.resolve().then(() => __importStar(require("../services/delhiveryService")));
        const credentialsValid = await delhiveryService.default.validateCredentials();
        res.json({
            serviceStatus,
            delhiveryCredentialsValid: credentialsValid,
            message: "Status update service information retrieved",
        });
    }
    catch (err) {
        console.error("Error getting service info:", err);
        res.status(500).json({ error: err.message });
    }
};
exports.getStatusServiceInfo = getStatusServiceInfo;
// Get all products for admin management
const getAllProducts = async (req, res) => {
    try {
        const { page = "1", limit = "20", search, categoryId, tagId, status, } = req.query;
        const pageNumber = Math.max(1, Number(page) || 1);
        const pageSize = Math.min(100, Math.max(1, Number(limit) || 20));
        const skip = (pageNumber - 1) * pageSize;
        const filters = {};
        if (search) {
            const searchTerm = String(search);
            // Frontend to backend tag name mapping
            const frontendToBackendTags = {
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
            tagSearchConditions.push({
                tags: {
                    some: {
                        tag: { name: { contains: searchTerm, mode: "insensitive" } },
                    },
                },
            });
            // Search by frontend display names (mapped to backend names)
            Object.entries(frontendToBackendTags).forEach(([frontendName, backendName]) => {
                if (frontendName.toLowerCase().includes(searchTerm.toLowerCase())) {
                    tagSearchConditions.push({
                        tags: {
                            some: {
                                tag: { name: { equals: backendName, mode: "insensitive" } },
                            },
                        },
                    });
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
            if (!isNaN(catId))
                filters.categoryId = catId;
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
            }
            else if (status === "unavailable") {
                filters.isAvailable = false;
            }
        }
        const totalCount = await db_1.default.product.count({ where: filters });
        const products = await db_1.default.product.findMany({
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
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.getAllProducts = getAllProducts;
// Get all users for admin management
const getAllUsers = async (req, res) => {
    try {
        const { page = "1", limit = "20", search, role } = req.query;
        const pageNumber = Math.max(1, Number(page) || 1);
        const pageSize = Math.min(100, Math.max(1, Number(limit) || 20));
        const skip = (pageNumber - 1) * pageSize;
        const filters = {};
        if (search) {
            filters.OR = [
                { name: { contains: String(search), mode: "insensitive" } },
                { email: { contains: String(search), mode: "insensitive" } },
            ];
        }
        if (role) {
            filters.role = String(role);
        }
        const totalCount = await db_1.default.user.count({ where: filters });
        const users = await db_1.default.user.findMany({
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
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.getAllUsers = getAllUsers;
// Update user role
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        if (!id || !role) {
            return res.status(400).json({ error: "User ID and role are required" });
        }
        const user = await db_1.default.user.update({
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
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.updateUserRole = updateUserRole;
// Get all sizes
const getAllSizes = async (req, res) => {
    try {
        const sizes = await db_1.default.size.findMany({
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
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.getAllSizes = getAllSizes;
// Create or update size
const upsertSize = async (req, res) => {
    try {
        const { id, name } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Size name is required" });
        }
        const size = await db_1.default.size.upsert({
            where: { id: id ? Number(id) : 0 },
            update: { name },
            create: { name },
        });
        res.json({ message: "✅ Size upserted successfully", size });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.upsertSize = upsertSize;
// Delete size
const deleteSize = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "Size ID is required" });
        }
        await db_1.default.size.delete({ where: { id: Number(id) } });
        res.json({ message: "✅ Size deleted successfully" });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.deleteSize = deleteSize;
// Get all categories
const getAllCategories = async (req, res) => {
    try {
        const categories = await db_1.default.category.findMany({
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
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.getAllCategories = getAllCategories;
// Create or update category
const upsertCategory = async (req, res) => {
    try {
        const { id, name } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Category name is required" });
        }
        const category = await db_1.default.category.upsert({
            where: { id: id ? Number(id) : 0 },
            update: { name },
            create: { name },
        });
        res.json({ message: "✅ Category upserted successfully", category });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.upsertCategory = upsertCategory;
// Delete category
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "Category ID is required" });
        }
        await db_1.default.category.delete({ where: { id: Number(id) } });
        res.json({ message: "✅ Category deleted successfully" });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.deleteCategory = deleteCategory;
// Get all tags
const getAllTags = async (req, res) => {
    try {
        const tags = await db_1.default.tag.findMany({
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
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.getAllTags = getAllTags;
// Create or update tag
const upsertTag = async (req, res) => {
    try {
        const { id, name } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Tag name is required" });
        }
        const tag = await db_1.default.tag.upsert({
            where: { id: id ? Number(id) : 0 },
            update: { name },
            create: { name },
        });
        res.json({ message: "✅ Tag upserted successfully", tag });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.upsertTag = upsertTag;
// Delete tag
const deleteTag = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "Tag ID is required" });
        }
        await db_1.default.tag.delete({ where: { id: Number(id) } });
        res.json({ message: "✅ Tag deleted successfully" });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.deleteTag = deleteTag;
// Get all home page images (optionally filtered by type)
const getAllHomePageImages = async (req, res) => {
    try {
        const { type } = req.query;
        const where = {};
        if (type) {
            where.type = type;
        }
        const images = await db_1.default.homePageImage.findMany({
            where,
            orderBy: [{ type: "asc" }, { order: "asc" }],
        });
        res.json(images);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.getAllHomePageImages = getAllHomePageImages;
// Create or update home page image
const upsertHomePageImage = async (req, res) => {
    try {
        const { id, type, imageUrl, mobileImageUrl, altText, title, subtitle, color, href, order, isActive, } = req.body;
        if (!type || !imageUrl) {
            return res.status(400).json({ error: "Type and imageUrl are required" });
        }
        // Validate type enum
        const validTypes = [
            "HERO_CAROUSEL",
            "POWER_FEATURES",
            "POWERPLAY_CAROUSEL",
            "CATEGORY",
        ];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ error: "Invalid image type" });
        }
        const data = {
            type,
            imageUrl,
            mobileImageUrl: mobileImageUrl || null,
            altText: altText || null,
            title: title || null,
            subtitle: subtitle || null,
            color: color || null,
            href: href || null,
            order: order !== undefined ? Number(order) : 0,
            isActive: isActive !== undefined ? Boolean(isActive) : true,
        };
        let image;
        if (id && Number(id) > 0) {
            // Check if image exists before updating
            const existing = await db_1.default.homePageImage.findUnique({
                where: { id: Number(id) },
            });
            if (existing) {
                // Check if image URLs have changed - delete old ones from S3
                const urlsToDelete = [];
                if (existing.imageUrl && existing.imageUrl !== imageUrl) {
                    urlsToDelete.push(existing.imageUrl);
                }
                if (existing.mobileImageUrl &&
                    existing.mobileImageUrl !== mobileImageUrl) {
                    urlsToDelete.push(existing.mobileImageUrl);
                }
                // Delete old images from S3 if URLs changed
                if (urlsToDelete.length > 0) {
                    console.log(`Deleting old images from S3 for image ${id}:`, urlsToDelete);
                    await Promise.all(urlsToDelete.map((url) => (0, s3delete_1.deleteFromS3)(url)));
                }
                // Update existing image
                image = await db_1.default.homePageImage.update({
                    where: { id: Number(id) },
                    data: data,
                });
            }
            else {
                // Image doesn't exist, create new one
                image = await db_1.default.homePageImage.create({
                    data: data,
                });
            }
        }
        else {
            // Create new image
            image = await db_1.default.homePageImage.create({
                data: data,
            });
        }
        res.json({ message: "✅ Home page image upserted successfully", image });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.upsertHomePageImage = upsertHomePageImage;
// Bulk update home page images (for carousel editing)
const bulkUpdateHomePageImages = async (req, res) => {
    try {
        const { images } = req.body; // Array of image objects
        if (!Array.isArray(images)) {
            return res.status(400).json({ error: "Images must be an array" });
        }
        const results = await Promise.all(images.map(async (img) => {
            const { id, type, imageUrl, mobileImageUrl, altText, title, subtitle, color, href, order, isActive, } = img;
            if (!type || !imageUrl) {
                throw new Error(`Image missing required fields: type and imageUrl`);
            }
            const data = {
                type,
                imageUrl,
                mobileImageUrl: mobileImageUrl || null,
                altText: altText || null,
                title: title || null,
                subtitle: subtitle || null,
                color: color || null,
                href: href || null,
                order: order !== undefined ? Number(order) : 0,
                isActive: isActive !== undefined ? Boolean(isActive) : true,
            };
            if (id && Number(id) > 0) {
                // Check if image exists before updating
                const existing = await db_1.default.homePageImage.findUnique({
                    where: { id: Number(id) },
                });
                if (existing) {
                    // Check if image URLs have changed - delete old ones from S3
                    const urlsToDelete = [];
                    if (existing.imageUrl && existing.imageUrl !== imageUrl) {
                        urlsToDelete.push(existing.imageUrl);
                    }
                    if (existing.mobileImageUrl &&
                        existing.mobileImageUrl !== mobileImageUrl) {
                        urlsToDelete.push(existing.mobileImageUrl);
                    }
                    // Delete old images from S3 if URLs changed
                    if (urlsToDelete.length > 0) {
                        console.log(`Deleting old images from S3 for image ${id}:`, urlsToDelete);
                        await Promise.all(urlsToDelete.map((url) => (0, s3delete_1.deleteFromS3)(url)));
                    }
                    // Update existing image
                    return await db_1.default.homePageImage.update({
                        where: { id: Number(id) },
                        data: data,
                    });
                }
                else {
                    // Image doesn't exist, create new one
                    return await db_1.default.homePageImage.create({
                        data: data,
                    });
                }
            }
            else {
                // Create new image
                return await db_1.default.homePageImage.create({
                    data: data,
                });
            }
        }));
        res.json({
            message: `✅ ${results.length} images updated successfully`,
            images: results,
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.bulkUpdateHomePageImages = bulkUpdateHomePageImages;
// Delete home page image
const deleteHomePageImage = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "Image ID is required" });
        }
        // Fetch the image first to get S3 URLs
        const image = await db_1.default.homePageImage.findUnique({
            where: { id: Number(id) },
        });
        if (!image) {
            return res.status(404).json({ error: "Image not found" });
        }
        // Delete from S3
        const s3UrlsToDelete = [];
        if (image.imageUrl) {
            s3UrlsToDelete.push(image.imageUrl);
        }
        if (image.mobileImageUrl) {
            s3UrlsToDelete.push(image.mobileImageUrl);
        }
        // Delete from S3 (don't fail if S3 deletion fails)
        if (s3UrlsToDelete.length > 0) {
            console.log("Deleting images from S3:", s3UrlsToDelete);
            await Promise.all(s3UrlsToDelete.map((url) => (0, s3delete_1.deleteFromS3)(url)));
        }
        // Delete from database
        await db_1.default.homePageImage.delete({ where: { id: Number(id) } });
        res.json({ message: "✅ Home page image deleted successfully" });
    }
    catch (err) {
        console.error("Error deleting home page image:", err);
        res.status(500).json({ error: err.message });
    }
};
exports.deleteHomePageImage = deleteHomePageImage;
// Upload home page image to S3 with compression
const uploadHomePageImage = async (req, res) => {
    try {
        const file = req.file;
        const { type } = req.body; // "desktop" or "mobile"
        if (!file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        // Validate file type
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.mimetype)) {
            return res.status(400).json({
                error: "Invalid file type. Only JPEG, PNG, and WebP are allowed.",
            });
        }
        // Upload to S3 with compression
        const s3Url = await (0, s3uploadCompressed_1.uploadToS3Compressed)(file, "home-images");
        res.json({
            message: "Image uploaded successfully",
            url: s3Url,
        });
    }
    catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({
            error: err.message || "Failed to upload image",
        });
    }
};
exports.uploadHomePageImage = uploadHomePageImage;
// ==================== TOP PICK PRODUCTS MANAGEMENT ====================
// Get all top pick products
const getTopPickProducts = async (req, res) => {
    try {
        const topPicks = await db_1.default.topPickProduct.findMany({
            orderBy: { order: "asc" },
            include: {
                product: {
                    include: {
                        images: {
                            select: { url: true },
                        },
                        category: {
                            select: { name: true },
                        },
                    },
                },
            },
        });
        res.json(topPicks);
    }
    catch (err) {
        console.error("Error fetching top pick products:", err);
        res.status(500).json({ error: err.message });
    }
};
exports.getTopPickProducts = getTopPickProducts;
// Set top pick products (replaces all existing top picks)
const setTopPickProducts = async (req, res) => {
    try {
        const { productIds } = req.body; // Array of product IDs
        if (!Array.isArray(productIds)) {
            return res.status(400).json({ error: "productIds must be an array" });
        }
        if (productIds.length === 0) {
            return res
                .status(400)
                .json({ error: "At least one product must be selected" });
        }
        // Validate that all products exist and are available
        const products = await db_1.default.product.findMany({
            where: {
                id: { in: productIds },
                isAvailable: true,
            },
        });
        if (products.length !== productIds.length) {
            return res
                .status(400)
                .json({ error: "Some products not found or not available" });
        }
        // Delete all existing top picks
        await db_1.default.topPickProduct.deleteMany({});
        // Create new top picks with order
        const topPicks = await Promise.all(productIds.map((productId, index) => db_1.default.topPickProduct.create({
            data: {
                productId: Number(productId),
                order: index,
            },
            include: {
                product: {
                    include: {
                        images: {
                            select: { url: true },
                        },
                        category: {
                            select: { name: true },
                        },
                    },
                },
            },
        })));
        res.json({
            message: "✅ Top pick products updated successfully",
            topPicks,
        });
    }
    catch (err) {
        console.error("Error setting top pick products:", err);
        res.status(500).json({ error: err.message });
    }
};
exports.setTopPickProducts = setTopPickProducts;
// Remove a product from top picks
const removeTopPickProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await db_1.default.topPickProduct.delete({
            where: { id: Number(id) },
        });
        res.json({ message: "✅ Product removed from top picks successfully" });
    }
    catch (err) {
        console.error("Error removing top pick product:", err);
        res.status(500).json({ error: err.message });
    }
};
exports.removeTopPickProduct = removeTopPickProduct;
