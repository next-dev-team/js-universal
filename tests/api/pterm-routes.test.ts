/**
 * Vitest tests for Pinokio Terminal API Routes
 * Tests all pterm API endpoints
 */
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import type { Server } from "http";
import app from "../../api/app.js";

const API_BASE = "http://localhost:3002";
const TEST_PORT = 3002;

describe("Pinokio Terminal API Routes", () => {
  let server: Server;

  beforeAll(async () => {
    // Start the server on a test port
    return new Promise<void>((resolve) => {
      server = app.listen(TEST_PORT, () => {
        console.log(`Test server started on port ${TEST_PORT}`);
        resolve();
      });
    });
  });

  afterAll(async () => {
    // Close the server after all tests
    return new Promise<void>((resolve) => {
      if (server) {
        server.close(() => {
          console.log("Test server closed");
          resolve();
        });
      } else {
        resolve();
      }
    });
  });

  describe("Version Endpoints", () => {
    it("should get all version information", async () => {
      const response = await fetch(`${API_BASE}/api/pterm/version`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("success");
      expect(data.success).toBe(true);
      expect(data).toHaveProperty("data");
      expect(data.data).toHaveProperty("pterm");
      expect(data.data).toHaveProperty("pinokiod");
      expect(data.data).toHaveProperty("pinokio");
      expect(data.data).toHaveProperty("script");

      console.log("✅ Version response:", data);
    });

    it("should get specific terminal version", async () => {
      const response = await fetch(`${API_BASE}/api/pterm/version/terminal`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("success");
      expect(data.data).toHaveProperty("component");
      expect(data.data.component).toBe("terminal");
      expect(data.data).toHaveProperty("version");

      console.log("✅ Terminal version:", data.data.version);
    });

    it("should get specific script version", async () => {
      const response = await fetch(`${API_BASE}/api/pterm/version/script`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("success");
      expect(data.data).toHaveProperty("component");
      expect(data.data.component).toBe("script");

      console.log("✅ Script version:", data.data.version);
    });

    it("should return 400 for invalid component", async () => {
      const response = await fetch(`${API_BASE}/api/pterm/version/invalid`);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Invalid component");
    });
  });

  describe("Clipboard Endpoints", () => {
    it("should copy text to clipboard", async () => {
      const testText = "Hello from Vitest!";
      const response = await fetch(`${API_BASE}/api/pterm/clipboard/copy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: testText }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe("Text copied to clipboard");

      console.log("✅ Clipboard copy successful");
    });

    it("should return 400 when copying without text", async () => {
      const response = await fetch(`${API_BASE}/api/pterm/clipboard/copy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Text is required");
    });

    it("should paste text from clipboard", async () => {
      // First copy something
      await fetch(`${API_BASE}/api/pterm/clipboard/copy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "Test clipboard content" }),
      });

      // Then paste it
      const response = await fetch(`${API_BASE}/api/pterm/clipboard/paste`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("success");
      expect(data).toHaveProperty("data");

      console.log("✅ Clipboard paste:", data.data);
    });
  });

  describe("Notification Endpoint", () => {
    it("should send desktop notification with minimal data", async () => {
      const response = await fetch(`${API_BASE}/api/pterm/push`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Test notification from Vitest",
        }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe("Notification sent");

      console.log("✅ Notification sent successfully");
    });

    it("should send desktop notification with all options", async () => {
      const response = await fetch(`${API_BASE}/api/pterm/push`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Full featured notification",
          title: "Vitest",
          subtitle: "API Testing",
          sound: false, // Disable sound during tests
        }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      console.log("✅ Full notification sent successfully");
    });

    it("should return 400 when sending notification without message", async () => {
      const response = await fetch(`${API_BASE}/api/pterm/push`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Message is required");
    });
  });

  describe("Script Management Endpoints", () => {
    // Note: These tests may fail if actual scripts don't exist
    // In a real scenario, you'd mock the exec calls or have test scripts

    it("should return 400 when starting script without path", async () => {
      const response = await fetch(`${API_BASE}/api/pterm/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Script path is required");
    });

    it("should return 400 when stopping script without path", async () => {
      const response = await fetch(`${API_BASE}/api/pterm/stop`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Script path is required");
    });

    it("should return 400 when running launcher without path", async () => {
      const response = await fetch(`${API_BASE}/api/pterm/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Launcher path is required");
    });

    it("should handle script start with arguments format correctly", async () => {
      // This test validates the request format is correct
      // Actual execution may fail if script doesn't exist, but we test the API contract
      const response = await fetch(`${API_BASE}/api/pterm/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script: "nonexistent.js",
          args: {
            port: 3000,
            model: "test-model",
          },
        }),
      });

      // We expect either success or error, but response should be valid JSON
      const data = await response.json();
      expect(data).toHaveProperty("success");

      if (!data.success) {
        expect(data).toHaveProperty("error");
        console.log("⚠️ Script start failed (expected if script doesn't exist):", data.error);
      } else {
        expect(data).toHaveProperty("data");
        console.log("✅ Script started successfully");
      }
    });
  });

  describe("API Error Handling", () => {
    it("should return 404 for non-existent endpoint", async () => {
      const response = await fetch(`${API_BASE}/api/pterm/nonexistent`);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe("API not found");
    });

    it("should handle malformed JSON in POST requests", async () => {
      const response = await fetch(`${API_BASE}/api/pterm/clipboard/copy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "invalid json{",
      });

      // Should get a 400 or 500 error for malformed JSON
      expect([400, 500]).toContain(response.status);
    });
  });

  describe("Health Check", () => {
    it("should respond to health check endpoint", async () => {
      const response = await fetch(`${API_BASE}/api/health`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe("ok");

      console.log("✅ Health check passed");
    });
  });
});

