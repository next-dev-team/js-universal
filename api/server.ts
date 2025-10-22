/**
 * local server entry file, for local development
 */
import app, { PORT, NODE_ENV, PINOKIO_DAEMON_URL } from "./app.js";

/**
 * start server with port
 */
const server = app.listen(PORT, () => {
  console.log("=".repeat(50));
  console.log(`🎉 API Server is running!`);
  console.log(`📡 API Port: ${PORT}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 API Docs: http://localhost:${PORT}/api/pterm/version`);
  console.log(`🔗 Pinokio Daemon: ${PINOKIO_DAEMON_URL}`);
  console.log("=".repeat(50));
  console.log("");
  console.log("✅ Pinokio daemon started automatically");
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
