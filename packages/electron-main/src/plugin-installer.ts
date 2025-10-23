import { promises as fs } from "fs";
import path from "path";
import { app } from "electron";
import { DatabaseService } from "./database-service";
import { Plugin, PluginManifest } from "./types";

export class PluginInstaller {
  private databaseService: DatabaseService;
  private pluginsDir: string;

  constructor(databaseService: DatabaseService) {
    this.databaseService = databaseService;
    this.pluginsDir = path.join(app.getPath("userData"), "plugins");
  }

  async initialize(): Promise<void> {
    // Ensure plugins directory exists
    await fs.mkdir(this.pluginsDir, { recursive: true });
  }

  async installPlugin(sourcePath: string): Promise<Plugin> {
    try {
      // Read manifest from package.json
      const manifestPath = path.join(sourcePath, "package.json");
      const manifestContent = await fs.readFile(manifestPath, "utf-8");
      const manifest: PluginManifest = JSON.parse(manifestContent);

      // Validate manifest
      this.validateManifest(manifest);

      // Basic validation (security scan would go here)

      // Generate plugin ID from name if not provided
      const pluginId = manifest.name.toLowerCase().replace(/[^a-z0-9-]/g, "-");

      // Check if plugin already exists
      const existingPlugin = await this.databaseService.getPluginById(pluginId);
      if (existingPlugin) {
        throw new Error(`Plugin ${manifest.name} is already installed`);
      }

      // Create plugin directory
      const pluginDir = path.join(this.pluginsDir, pluginId);
      await fs.mkdir(pluginDir, { recursive: true });

      // Copy plugin files
      await this.copyDirectory(sourcePath, pluginDir);

      // Calculate plugin size
      const size = await this.calculateDirectorySize(pluginDir);

      // Create plugin record
      const plugin: Plugin = {
        id: pluginId,
        name: manifest.name,
        description: manifest.description,
        author: manifest.author,
        category: manifest.category || "Utility",
        iconUrl: manifest.icon
          ? path.join(pluginDir, manifest.icon)
          : undefined,
        downloadCount: 0,
        averageRating: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        isVerified: false,
        version: manifest.version,
        size: size,
        tags: [],
        requiredPermissions: manifest.permissions || [],
      };

      // Save to database
      const savedPlugin = await this.databaseService.createPlugin(plugin);

      console.log(`Plugin ${manifest.name} installed successfully`);
      return savedPlugin;
    } catch (error) {
      console.error("Failed to install plugin:", error);
      throw error;
    }
  }

  async uninstallPlugin(pluginId: string): Promise<void> {
    try {
      // Get plugin info
      const plugin = await this.databaseService.getPluginById(pluginId);
      if (!plugin) {
        throw new Error("Plugin not found");
      }

      // Remove plugin directory
      const pluginDir = path.join(this.pluginsDir, pluginId);
      try {
        await fs.rm(pluginDir, { recursive: true, force: true });
      } catch (error) {
        console.warn("Failed to remove plugin directory:", error);
      }

      // Remove from database
      await this.databaseService.deletePlugin(pluginId);

      console.log(`Plugin ${plugin.name} uninstalled successfully`);
    } catch (error) {
      console.error("Failed to uninstall plugin:", error);
      throw error;
    }
  }

  async updatePlugin(pluginId: string, sourcePath: string): Promise<Plugin> {
    try {
      // Read new manifest
      const manifestPath = path.join(sourcePath, "package.json");
      const manifestContent = await fs.readFile(manifestPath, "utf-8");
      const manifest: PluginManifest = JSON.parse(manifestContent);

      // Validate manifest
      this.validateManifest(manifest);

      // Get existing plugin
      const existingPlugin = await this.databaseService.getPluginById(pluginId);
      if (!existingPlugin) {
        throw new Error("Plugin not found");
      }

      // Basic validation (security scan would go here)

      // Backup current plugin
      const pluginDir = path.join(this.pluginsDir, pluginId);
      const backupDir = path.join(this.pluginsDir, `${pluginId}.backup`);

      try {
        await fs.rm(backupDir, { recursive: true, force: true });
      } catch {}

      await fs.rename(pluginDir, backupDir);

      try {
        // Create new plugin directory
        await fs.mkdir(pluginDir, { recursive: true });

        // Copy new plugin files
        await this.copyDirectory(sourcePath, pluginDir);

        // Calculate new size
        const size = await this.calculateDirectorySize(pluginDir);

        // Update plugin record
        const updatedPlugin = await this.databaseService.updatePlugin(
          pluginId,
          {
            version: manifest.version,
            description: manifest.description,
            size: size,
            requiredPermissions: manifest.permissions || [],
            updatedAt: new Date(),
          }
        );

        // Remove backup
        await fs.rm(backupDir, { recursive: true, force: true });

        console.log(`Plugin ${manifest.name} updated successfully`);
        return updatedPlugin;
      } catch (error) {
        // Restore backup on failure
        try {
          await fs.rm(pluginDir, { recursive: true, force: true });
          await fs.rename(backupDir, pluginDir);
        } catch (restoreError) {
          console.error("Failed to restore plugin backup:", restoreError);
        }
        throw error;
      }
    } catch (error) {
      console.error("Failed to update plugin:", error);
      throw error;
    }
  }

  async getInstalledPlugins(): Promise<Plugin[]> {
    return this.databaseService.getAllPlugins();
  }

  private validateManifest(manifest: PluginManifest): void {
    const required = ["name", "version", "author", "main"];

    for (const field of required) {
      if (!manifest[field as keyof PluginManifest]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate version format
    if (!/^\d+\.\d+\.\d+/.test(manifest.version)) {
      throw new Error(
        "Invalid version format. Use semantic versioning (x.y.z)"
      );
    }

    // Validate main file
    if (!manifest.main.endsWith(".js") && !manifest.main.endsWith(".html")) {
      throw new Error("Main file must be a .js or .html file");
    }
  }

  private async copyDirectory(src: string, dest: string): Promise<void> {
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await fs.mkdir(destPath, { recursive: true });
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  private async calculateDirectorySize(dirPath: string): Promise<number> {
    let totalSize = 0;

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          totalSize += await this.calculateDirectorySize(fullPath);
        } else {
          const stats = await fs.stat(fullPath);
          totalSize += stats.size;
        }
      }
    } catch (error) {
      console.warn("Failed to calculate directory size:", error);
    }

    return totalSize;
  }
}
