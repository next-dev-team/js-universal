/**
 * Pinokio Terminal API Routes
 * Provides direct access to Pinokio daemon functionality
 *
 * Note: This makes direct HTTP requests to the Pinokio daemon
 * which is started automatically by the API server.
 *
 * Script management endpoints use the local pterm executable directly
 * from node_modules for WebSocket-based operations.
 */
import { Router, type Request, type Response } from "express";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);
const router = Router();

// Pinokio daemon base URL from environment variables
const PINOKIO_DAEMON_HOST = process.env.PINOKIO_DAEMON_HOST || "localhost";
const PINOKIO_DAEMON_PORT = process.env.PINOKIO_DAEMON_PORT || "42000";
const PINOKIO_DAEMON_URL = `http://${PINOKIO_DAEMON_HOST}:${PINOKIO_DAEMON_PORT}`;

// Path to local pterm executable (faster than npx)
const PTERM_PATH = path.join(process.cwd(), "node_modules", ".bin", "pterm");

/**
 * Get all version information
 * GET /api/pterm/version
 */
router.get("/version", async (req: Request, res: Response): Promise<void> => {
  try {
    const versions: Record<string, string> = {};

    // Get pterm version from package.json
    try {
      const ptermPackage = await import("pterm/package.json", {
        assert: { type: "json" },
      });
      versions.pterm = `pterm@${ptermPackage.default.version}`;
    } catch {
      versions.pterm = "Not available";
    }

    // Get versions from Pinokio daemon
    try {
      const response = await fetch(`${PINOKIO_DAEMON_URL}/pinokio/version`);
      const data = await response.json();

      versions.pinokiod = data.pinokiod
        ? `pinokiod@${data.pinokiod}`
        : "Not available";
      versions.pinokio = data.pinokio
        ? `pinokiod@${data.pinokio}`
        : "Not available";
      versions.script = data.script || "Not available";
    } catch {
      versions.pinokiod = "Daemon not running";
      versions.pinokio = "Daemon not running";
      versions.script = "Daemon not running";
    }

    res.status(200).json({
      success: true,
      data: versions,
    });
  } catch (error) {
    console.error("Error getting pterm versions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get version information",
    });
  }
});

/**
 * Get specific version information
 * GET /api/pterm/version/:component
 * @param component - terminal, pinokiod, pinokio, or script
 */
router.get(
  "/version/:component",
  async (req: Request, res: Response): Promise<void> => {
    const { component } = req.params;
    const validComponents = ["terminal", "pinokiod", "pinokio", "script"];

    if (!validComponents.includes(component)) {
      res.status(400).json({
        success: false,
        error: `Invalid component. Must be one of: ${validComponents.join(
          ", "
        )}`,
      });
      return;
    }

    try {
      let version: string;

      if (component === "terminal") {
        // Get pterm version from package.json
        const ptermPackage = await import("pterm/package.json", {
          assert: { type: "json" },
        });
        version = `pterm@${ptermPackage.default.version}`;
      } else {
        // Get other versions from Pinokio daemon
        const response = await fetch(`${PINOKIO_DAEMON_URL}/pinokio/version`);
        const data = await response.json();

        if (component === "pinokiod") {
          version = data.pinokiod
            ? `pinokiod@${data.pinokiod}`
            : "Not available";
        } else if (component === "pinokio") {
          version = data.pinokio ? `pinokiod@${data.pinokio}` : "Not available";
        } else if (component === "script") {
          version = data.script || "Not available";
        } else {
          version = "Not available";
        }
      }

      res.status(200).json({
        success: true,
        data: {
          component,
          version,
        },
      });
    } catch (error) {
      console.error(`Error getting ${component} version:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to get ${component} version`,
      });
    }
  }
);

/**
 * Clipboard - Copy text
 * POST /api/pterm/clipboard/copy
 * @body text - Text to copy to clipboard
 */
router.post(
  "/clipboard/copy",
  async (req: Request, res: Response): Promise<void> => {
    const { text } = req.body;

    if (!text) {
      res.status(400).json({
        success: false,
        error: "Text is required",
      });
      return;
    }

    try {
      const response = await fetch(`${PINOKIO_DAEMON_URL}/clipboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "copy",
          text,
        }),
      });

      if (!response.ok) {
        throw new Error(`Daemon responded with ${response.status}`);
      }

      res.status(200).json({
        success: true,
        message: "Text copied to clipboard",
      });
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      res.status(500).json({
        success: false,
        error: "Failed to copy text to clipboard. Is Pinokio daemon running?",
      });
    }
  }
);

/**
 * Clipboard - Paste text
 * GET /api/pterm/clipboard/paste
 */
router.get(
  "/clipboard/paste",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const response = await fetch(`${PINOKIO_DAEMON_URL}/clipboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "paste",
        }),
      });

      if (!response.ok) {
        throw new Error(`Daemon responded with ${response.status}`);
      }

      const data = await response.json();
      res.status(200).json({
        success: true,
        data: data.text || "",
      });
    } catch (error) {
      console.error("Error pasting from clipboard:", error);
      res.status(500).json({
        success: false,
        error: "Failed to paste from clipboard. Is Pinokio daemon running?",
      });
    }
  }
);

/**
 * Send desktop notification
 * POST /api/pterm/push
 * @body message - Notification message
 * @body title - Optional notification title
 * @body subtitle - Optional notification subtitle
 * @body sound - Optional sound flag
 * @body image - Optional image path
 */
router.post("/push", async (req: Request, res: Response): Promise<void> => {
  const { message, title, subtitle, sound, image } = req.body;

  if (!message) {
    res.status(400).json({
      success: false,
      error: "Message is required",
    });
    return;
  }

  try {
    // Resolve image path if provided and relative
    let resolvedImage = image;
    if (image && !path.isAbsolute(image)) {
      resolvedImage = path.resolve(process.cwd(), image);
    }

    const response = await fetch(`${PINOKIO_DAEMON_URL}/push`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        title,
        subtitle,
        sound,
        image: resolvedImage,
      }),
    });

    if (!response.ok) {
      throw new Error(`Daemon responded with ${response.status}`);
    }

    res.status(200).json({
      success: true,
      message: "Notification sent",
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send notification. Is Pinokio daemon running?",
    });
  }
});

/**
 * Start a Pinokio script
 * POST /api/pterm/start
 * @body script - Script path to start
 * @body args - Optional arguments object
 *
 * Note: Uses local pterm executable for WebSocket operations
 */
router.post("/start", async (req: Request, res: Response): Promise<void> => {
  const { script, args } = req.body;

  if (!script) {
    res.status(400).json({
      success: false,
      error: "Script path is required",
    });
    return;
  }

  try {
    let command = `"${PTERM_PATH}" start ${script}`;

    if (args && typeof args === "object") {
      Object.entries(args).forEach(([key, value]) => {
        command += ` --${key}=${value}`;
      });
    }

    const { stdout, stderr } = await execAsync(command);
    res.status(200).json({
      success: true,
      data: {
        stdout: stdout.trim(),
        stderr: stderr.trim(),
      },
    });
  } catch (error) {
    console.error("Error starting script:", error);
    res.status(500).json({
      success: false,
      error: "Failed to start script. Is Pinokio daemon running?",
    });
  }
});

/**
 * Stop a Pinokio script
 * POST /api/pterm/stop
 * @body script - Script path to stop
 *
 * Note: Uses local pterm executable for WebSocket operations
 */
router.post("/stop", async (req: Request, res: Response): Promise<void> => {
  const { script } = req.body;

  if (!script) {
    res.status(400).json({
      success: false,
      error: "Script path is required",
    });
    return;
  }

  try {
    await execAsync(`"${PTERM_PATH}" stop ${script}`);
    res.status(200).json({
      success: true,
      message: "Script stopped",
    });
  } catch (error) {
    console.error("Error stopping script:", error);
    res.status(500).json({
      success: false,
      error: "Failed to stop script. Is Pinokio daemon running?",
    });
  }
});

/**
 * Run a Pinokio launcher
 * POST /api/pterm/run
 * @body path - Launcher path to run
 *
 * Note: Uses local pterm executable for WebSocket operations
 */
router.post("/run", async (req: Request, res: Response): Promise<void> => {
  const { path: launcherPath } = req.body;

  if (!launcherPath) {
    res.status(400).json({
      success: false,
      error: "Launcher path is required",
    });
    return;
  }

  try {
    const { stdout, stderr } = await execAsync(
      `"${PTERM_PATH}" run ${launcherPath}`
    );
    res.status(200).json({
      success: true,
      data: {
        stdout: stdout.trim(),
        stderr: stderr.trim(),
      },
    });
  } catch (error) {
    console.error("Error running launcher:", error);
    res.status(500).json({
      success: false,
      error: "Failed to run launcher. Is Pinokio daemon running?",
    });
  }
});

export default router;
