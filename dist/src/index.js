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
Object.defineProperty(exports, "__esModule", { value: true });
const configValidation_1 = require("./utils/configValidation");
const server = require("./app");
const PORT = process.env.PORT || 5000;
// Validate environment configuration on startup
try {
    (0, configValidation_1.validateEnvironmentConfig)();
}
catch (error) {
    console.error("❌ Server startup failed due to configuration issues");
    process.exit(1);
}
// Initialize status update service
const initializeStatusService = async () => {
    try {
        const statusUpdateService = await Promise.resolve().then(() => __importStar(require("./services/statusUpdateService")));
        statusUpdateService.default.start();
        console.log("✅ Automated status update service initialized");
    }
    catch (error) {
        console.error("❌ Failed to initialize status update service:", error);
    }
};
server.listen(PORT, async () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log("📧 Email verification system is active");
    // Start the automated status update service
    await initializeStatusService();
});
