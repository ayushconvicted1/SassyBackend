const server = require("@/app");
const PORT = process.env.PORT || 5000;

// Initialize status update service
const initializeStatusService = async () => {
  try {
    const statusUpdateService = await import("./services/statusUpdateService");
    statusUpdateService.default.start();
    console.log("✅ Automated status update service initialized");
  } catch (error) {
    console.error("❌ Failed to initialize status update service:", error);
  }
};

server.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);

  // Start the automated status update service
  await initializeStatusService();
});
