import { dialog } from "electron";
import path from "path";
import fs from "fs/promises";

export class SecurityManager {
  private pluginPermissions: Map<string, Set<string>> = new Map();
  private permissionRequests: Map<string, Promise<boolean>> = new Map();

  constructor() {
    this.initializeDefaultPermissions();
  }

  private initializeDefaultPermissions() {
    // Define default allowed permissions for different security levels
    this.pluginPermissions.set(
      "default",
      new Set(["storage", "notifications"])
    );
  }

  async checkPermission(
    pluginId: string,
    permission: string
  ): Promise<boolean> {
    const pluginPerms = this.pluginPermissions.get(pluginId);
    if (!pluginPerms) {
      return false;
    }
    return pluginPerms.has(permission);
  }

  async requestPermission(
    pluginId: string,
    permission: string
  ): Promise<boolean> {
    // Check if permission is already granted
    if (await this.checkPermission(pluginId, permission)) {
      return true;
    }

    // Check if there's already a pending request for this permission
    const requestKey = `${pluginId}:${permission}`;
    if (this.permissionRequests.has(requestKey)) {
      return await this.permissionRequests.get(requestKey)!;
    }

    // Create new permission request
    const requestPromise = this.showPermissionDialog(pluginId, permission);
    this.permissionRequests.set(requestKey, requestPromise);

    try {
      const granted = await requestPromise;
      if (granted) {
        this.grantPermission(pluginId, permission);
      }
      return granted;
    } finally {
      this.permissionRequests.delete(requestKey);
    }
  }

  private async showPermissionDialog(
    pluginId: string,
    permission: string
  ): Promise<boolean> {
    const result = await dialog.showMessageBox({
      type: "question",
      buttons: ["Allow", "Deny"],
      defaultId: 1,
      title: "Permission Request",
      message: `Plugin "${pluginId}" is requesting permission`,
      detail: `The plugin wants to access: ${this.getPermissionDescription(
        permission
      )}\n\nDo you want to allow this?`,
      cancelId: 1,
    });

    return result.response === 0;
  }

  private getPermissionDescription(permission: string): string {
    const descriptions: Record<string, string> = {
      storage: "Local storage to save data and preferences",
      notifications: "System notifications to show alerts and updates",
      network: "Network access to fetch data from the internet",
      filesystem: "File system access to read and write files",
      geolocation: "Location services to access your geographic position",
      camera: "Camera access to capture photos and videos",
      microphone: "Microphone access to record audio",
      clipboard: "Clipboard access to read and write copied content",
    };

    return descriptions[permission] || `Unknown permission: ${permission}`;
  }

  grantPermission(pluginId: string, permission: string): void {
    if (!this.pluginPermissions.has(pluginId)) {
      this.pluginPermissions.set(pluginId, new Set());
    }
    this.pluginPermissions.get(pluginId)!.add(permission);
  }

  revokePermission(pluginId: string, permission: string): void {
    const pluginPerms = this.pluginPermissions.get(pluginId);
    if (pluginPerms) {
      pluginPerms.delete(permission);
    }
  }

  revokeAllPermissions(pluginId: string): void {
    this.pluginPermissions.delete(pluginId);
  }

  getPluginPermissions(pluginId: string): string[] {
    const pluginPerms = this.pluginPermissions.get(pluginId);
    return pluginPerms ? Array.from(pluginPerms) : [];
  }

  async validatePluginManifest(manifestPath: string): Promise<{
    isValid: boolean;
    errors: string[];
    manifest?: any;
  }> {
    try {
      const manifestContent = await fs.readFile(manifestPath, "utf-8");
      const manifest = JSON.parse(manifestContent);

      const errors: string[] = [];

      // Required fields validation
      const requiredFields = [
        "name",
        "version",
        "description",
        "author",
        "main",
      ];
      for (const field of requiredFields) {
        if (!manifest[field]) {
          errors.push(`Missing required field: ${field}`);
        }
      }

      // Version format validation
      if (manifest.version && !this.isValidVersion(manifest.version)) {
        errors.push(
          "Invalid version format. Use semantic versioning (e.g., 1.0.0)"
        );
      }

      // Permissions validation
      if (manifest.permissions && Array.isArray(manifest.permissions)) {
        const validPermissions = [
          "storage",
          "notifications",
          "network",
          "filesystem",
          "geolocation",
          "camera",
          "microphone",
          "clipboard",
        ];

        for (const permission of manifest.permissions) {
          if (!validPermissions.includes(permission)) {
            errors.push(`Invalid permission: ${permission}`);
          }
        }
      }

      // Entry point validation
      if (manifest.main) {
        const entryPath = path.resolve(
          path.dirname(manifestPath),
          manifest.main
        );
        try {
          await fs.access(entryPath);
        } catch {
          errors.push(`Entry point file not found: ${manifest.main}`);
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        manifest: errors.length === 0 ? manifest : undefined,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [
          `Failed to parse manifest: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        ],
      };
    }
  }

  private isValidVersion(version: string): boolean {
    const semverRegex =
      /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
    return semverRegex.test(version);
  }

  async sanitizePluginPath(pluginPath: string): Promise<{
    isValid: boolean;
    sanitizedPath?: string;
    error?: string;
  }> {
    try {
      const resolvedPath = path.resolve(pluginPath);

      // Check if path exists
      await fs.access(resolvedPath);

      // Check if it's a directory
      const stats = await fs.stat(resolvedPath);
      if (!stats.isDirectory()) {
        return {
          isValid: false,
          error: "Plugin path must be a directory",
        };
      }

      // Check for manifest file
      const manifestPath = path.join(resolvedPath, "manifest.json");
      try {
        await fs.access(manifestPath);
      } catch {
        return {
          isValid: false,
          error: "manifest.json not found in plugin directory",
        };
      }

      return {
        isValid: true,
        sanitizedPath: resolvedPath,
      };
    } catch (error) {
      return {
        isValid: false,
        error: `Invalid plugin path: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  createSandboxedContext(pluginId: string): Record<string, any> {
    const permissions = this.getPluginPermissions(pluginId);

    const context: Record<string, any> = {
      pluginId,
      permissions,
      // Restricted global objects
      console: {
        log: (...args: any[]) => console.log(`[Plugin ${pluginId}]:`, ...args),
        warn: (...args: any[]) =>
          console.warn(`[Plugin ${pluginId}]:`, ...args),
        error: (...args: any[]) =>
          console.error(`[Plugin ${pluginId}]:`, ...args),
      },
    };

    // Add APIs based on permissions
    if (permissions.includes("storage")) {
      context.storage = this.createStorageAPI(pluginId);
    }

    if (permissions.includes("notifications")) {
      context.notifications = this.createNotificationsAPI(pluginId);
    }

    if (permissions.includes("network")) {
      context.fetch = this.createNetworkAPI(pluginId);
    }

    return context;
  }

  private createStorageAPI(pluginId: string) {
    const storagePrefix = `plugin_${pluginId}_`;

    return {
      get: async (key: string) => {
        // Implementation would use a secure storage mechanism
        return localStorage.getItem(storagePrefix + key);
      },
      set: async (key: string, value: any) => {
        localStorage.setItem(storagePrefix + key, JSON.stringify(value));
      },
      remove: async (key: string) => {
        localStorage.removeItem(storagePrefix + key);
      },
      clear: async () => {
        // Clear only this plugin's data
        const keys = Object.keys(localStorage).filter((k) =>
          k.startsWith(storagePrefix)
        );
        keys.forEach((key) => localStorage.removeItem(key));
      },
    };
  }

  private createNotificationsAPI(pluginId: string) {
    return {
      show: async (
        title: string,
        body: string,
        options?: any
      ) => {
        // Implementation would show system notifications
        console.log(`[Plugin ${pluginId}] Notification:`, {
          title,
          body,
          options,
        });
      },
    };
  }

  private createNetworkAPI(pluginId: string) {
    return async (url: string, options?: RequestInit) => {
      // Implementation would include network request filtering and monitoring
      console.log(`[Plugin ${pluginId}] Network request:`, url);
      return fetch(url, options);
    };
  }
}
