/**
 * This is a API server
 */

import express, { type Request, type Response } from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { homedir } from "os";
import authRoutes from "./routes/auth.js";
import ptermRoutes from "./routes/pterm.js";
import Pinokiod from "pinokiod";

// Load environment variables first
dotenv.config();

// Environment variables with defaults
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || "development";
const PINOKIO_HOME =
  process.env.PINOKIO_HOME || path.join(homedir(), "pinokio");
const PINOKIO_DAEMON_PORT = process.env.PINOKIO_DAEMON_PORT || 42000;
const PINOKIO_DAEMON_HOST = process.env.PINOKIO_DAEMON_HOST || "localhost";
const PINOKIO_DAEMON_URL = `http://${PINOKIO_DAEMON_HOST}:${PINOKIO_DAEMON_PORT}`;
const HTTP_PROXY = process.env.HTTP_PROXY || "";
const HTTPS_PROXY = process.env.HTTPS_PROXY || "";
const NO_PROXY = process.env.NO_PROXY || "";

const config = {
  newsfeed: (gitRemote: string) => {
    return `https://pinokiocomputer.github.io/home/item?uri=${gitRemote}&display=feed`;
  },
  profile: (gitRemote: string) => {
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
  store: {
    home: PINOKIO_HOME,
    HTTP_PROXY,
    HTTPS_PROXY,
    NO_PROXY,
  },
};

const startPinokioDaemon = async () => {
  console.log("🏠 Pinokio home directory:", PINOKIO_HOME);
  console.log("🌐 Pinokio daemon URL:", PINOKIO_DAEMON_URL);

  const pinokioServer = new Pinokiod(config);

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

console.log("🚀 Initializing Express application...");
console.log("📦 Environment:", NODE_ENV);
console.log("🔌 API Port:", PORT);

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

app.use("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "ok",
    data: {
      pinokioUrl: PINOKIO_DAEMON_URL,
    },
  });
});

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
export { PORT, NODE_ENV, PINOKIO_DAEMON_URL, PINOKIO_HOME };
