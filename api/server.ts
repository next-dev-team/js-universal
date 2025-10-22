/**
 * local server entry file, for local development
 */
import app from "./app.js";

/**
 * start server with port
 */
const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log("=".repeat(50));
  console.log(`🎉 API Server is running!`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 API Docs: http://localhost:${PORT}/api/pterm/version`);
  console.log("=".repeat(50));
  console.log("");
  console.log("💡 Don't forget to start Pinokio daemon separately:");
  console.log("   npm run pinokiod:start");
  console.log("");
});

/**
 * close server
 */
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

export default app;
