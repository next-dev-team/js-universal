/**
 * This is a API server
 */

import express, { type Request, type Response } from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import ptermRoutes from "./routes/pterm.js";

const config = {
  newsfeed: (gitRemote) => {
    return `https://pinokiocomputer.github.io/home/item?uri=${gitRemote}&display=feed`;
  },
  profile: (gitRemote) => {
    return `https://pinokiocomputer.github.io/home/item?uri=${gitRemote}&display=profile`;
  },
  site: "https://pinokiocomputer.github.io/home",
  discover_dark: "https://pinokiocomputer.github.io/home/app?theme=dark",
  discover_light: "https://pinokiocomputer.github.io/home/app",
  portal: "https://pinokiocomputer.github.io/home/portal",
  docs: "https://pinokiocomputer.github.io/program.pinokio.computer",
  install:
    "https://pinokiocomputer.github.io/program.pinokio.computer/#/?id=install",
  agent: "electron",
};

const startPinokioDaemon = async () => {
  const { createRequire } = await import("module");
  const require = createRequire(import.meta.url);
  const PinokioServer = require("../pinokiod/server/index.js");
  const pinokioServer = new PinokioServer(config);

  await pinokioServer.start({
    onquit: () => {},
    onrestart: () => {},
    browser: {
      clearCache: async () => {
        console.log("clear cache from all sessions");
        console.log("cleared all sessions");
      },
    },
  });
};

// for esm mode
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // eslint-disable-line @typescript-eslint/no-unused-vars

// load env
dotenv.config();

console.log("🚀 Initializing Express application...");

const app: express.Application = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

console.log("🚀 Starting pinokio daemon...");

// Start Pinokio Daemon
await startPinokioDaemon();

/**
 * API Routes
 */
console.log("📍 Registering API routes...");
app.use("/api/auth", authRoutes);
app.use("/api/pterm", ptermRoutes);

/**
 * health
 */
app.use("/api/health", (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: "ok",
  });
});

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response) => {
  console.error("Server error:", error);
  res.status(500).json({
    success: false,
    error: "Server internal error",
  });
});

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "API not found",
  });
});

console.log("✅ Express application configured successfully");

export default app;
