"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserAnalytics = exports.getSalesAnalytics = exports.getProductAnalytics = exports.getOverviewAnalytics = void 0;
const analyticsService_1 = __importDefault(require("../services/analyticsService"));
// Helper function to parse date range from query parameters
const parseDateRange = (req) => {
    const { startDate, endDate } = req.query;
    let start;
    let end;
    if (startDate && endDate) {
        start = new Date(startDate);
        end = new Date(endDate);
    }
    else {
        // Default to last 30 days
        end = new Date();
        start = new Date();
        start.setDate(start.getDate() - 30);
    }
    // Ensure end date is end of day
    end.setHours(23, 59, 59, 999);
    // Ensure start date is start of day
    start.setHours(0, 0, 0, 0);
    return { startDate: start, endDate: end };
};
// Get overview analytics
const getOverviewAnalytics = async (req, res) => {
    try {
        const dateRange = parseDateRange(req);
        const data = await analyticsService_1.default.getOverviewAnalytics(dateRange);
        res.json({
            data,
            dateRange: {
                startDate: dateRange.startDate.toISOString(),
                endDate: dateRange.endDate.toISOString(),
            },
        });
    }
    catch (err) {
        console.error("Error fetching overview analytics:", err);
        res.status(500).json({ error: err.message });
    }
};
exports.getOverviewAnalytics = getOverviewAnalytics;
// Get product analytics
const getProductAnalytics = async (req, res) => {
    try {
        const dateRange = parseDateRange(req);
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const data = await analyticsService_1.default.getProductAnalytics({
            ...dateRange,
            limit,
        });
        res.json({
            data,
            dateRange: {
                startDate: dateRange.startDate.toISOString(),
                endDate: dateRange.endDate.toISOString(),
            },
        });
    }
    catch (err) {
        console.error("Error fetching product analytics:", err);
        res.status(500).json({ error: err.message });
    }
};
exports.getProductAnalytics = getProductAnalytics;
// Get sales analytics
const getSalesAnalytics = async (req, res) => {
    try {
        const dateRange = parseDateRange(req);
        const groupBy = req.query.groupBy || 'day';
        const data = await analyticsService_1.default.getSalesAnalytics({
            ...dateRange,
            groupBy,
        });
        res.json({
            data,
            dateRange: {
                startDate: dateRange.startDate.toISOString(),
                endDate: dateRange.endDate.toISOString(),
            },
        });
    }
    catch (err) {
        console.error("Error fetching sales analytics:", err);
        res.status(500).json({ error: err.message });
    }
};
exports.getSalesAnalytics = getSalesAnalytics;
// Get user analytics
const getUserAnalytics = async (req, res) => {
    try {
        const dateRange = parseDateRange(req);
        const data = await analyticsService_1.default.getUserAnalytics(dateRange);
        res.json({
            data,
            dateRange: {
                startDate: dateRange.startDate.toISOString(),
                endDate: dateRange.endDate.toISOString(),
            },
        });
    }
    catch (err) {
        console.error("Error fetching user analytics:", err);
        res.status(500).json({ error: err.message });
    }
};
exports.getUserAnalytics = getUserAnalytics;
