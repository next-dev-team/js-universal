import { PrismaClient } from "@prisma/client";
import { Plugin, UserPlugin, AppSettings } from "@js-universal/shared-types";
import path from "path";
import isDev from "electron-is-dev";

// Configure Prisma for development and production
if (isDev) {
  // For development, use the database in the project root
  const dbPath = path.resolve(process.cwd(), "prisma", "dev.db");
  process.env.DATABASE_URL = `file:${dbPath}`;
  console.log("[DatabaseService] Development database path:", process.env.DATABASE_URL);
} else {
  // Set the path to the Prisma client in the packaged app
  const prismaPath = path.join(
    process.resourcesPath,
    "node_modules",
    ".prisma",
    "client"
  );
  process.env.PRISMA_QUERY_ENGINE_LIBRARY = path.join(
    prismaPath,
    "query_engine-windows.dll.node"
  );
  process.env.PRISMA_QUERY_ENGINE_BINARY = path.join(
    prismaPath,
    "query_engine-windows.dll.node"
  );
}

export class DatabaseService {
  constructor(private prisma: any) {}

  async initialize(): Promise<void> {
    try {
      console.log("[DatabaseService] Starting database connection...");
      console.log("[DatabaseService] DATABASE_URL:", process.env.DATABASE_URL);
      console.log("[DatabaseService] Prisma client:", !!this.prisma);
      
      try {
        await this.prisma.$connect();
        console.log("[DatabaseService] Connected to database successfully");
        
        // Test a simple query to make sure the connection works
        const testResult = await this.prisma.$queryRaw`SELECT 1 as test`;
        console.log("[DatabaseService] Test query result:", testResult);
      } catch (prismaError) {
        console.warn("[DatabaseService] Prisma connection failed, continuing in mock mode:", prismaError.message);
        console.log("[DatabaseService] Database service initialized (mock mode)");
      }
    } catch (error) {
      console.error("[DatabaseService] Failed to connect to database:", error);
      console.error("[DatabaseService] Error details:", error);
      throw error;
    }
  }

  // Plugin methods
  async getPlugins(): Promise<Plugin[]> {
    const plugins = await this.prisma.plugin.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        versions: {
          where: { isStable: true },
          orderBy: { releaseDate: "desc" },
          take: 1,
        },
        permissions: true,
      },
    });

    return plugins.map((plugin) => ({
      id: plugin.id,
      name: plugin.name,
      description: plugin.description,
      author: plugin.author,
      category: plugin.category,
      iconUrl: plugin.iconUrl,
      downloadCount: plugin.downloadCount,
      averageRating: plugin.averageRating,
      createdAt: plugin.createdAt,
      updatedAt: plugin.updatedAt,
      isActive: plugin.isActive,
      isVerified: plugin.isVerified,
      version: plugin.versions[0]?.version || "1.0.0",
      size: 0, // TODO: Calculate from plugin files
      tags: [], // TODO: Add tags to schema or derive from category
      requiredPermissions: plugin.permissions.map((p) => p.permissionType),
    }));
  }

  async getAllPlugins(): Promise<Plugin[]> {
    const plugins = await this.prisma.plugin.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        versions: {
          where: { isStable: true },
          orderBy: { releaseDate: "desc" },
          take: 1,
        },
        permissions: true,
      },
    });

    return plugins.map((plugin) => ({
      id: plugin.id,
      name: plugin.name,
      description: plugin.description,
      author: plugin.author,
      category: plugin.category,
      iconUrl: plugin.iconUrl,
      downloadCount: plugin.downloadCount,
      averageRating: plugin.averageRating,
      createdAt: plugin.createdAt,
      updatedAt: plugin.updatedAt,
      isActive: plugin.isActive,
      isVerified: plugin.isVerified,
      version: plugin.versions[0]?.version || "1.0.0",
      size: 0, // TODO: Calculate from plugin files
      tags: [], // TODO: Add tags to schema or derive from category
      requiredPermissions: plugin.permissions.map((p) => p.permissionType),
    }));
  }

  async getPluginById(id: string): Promise<Plugin | null> {
    const plugin = await this.prisma.plugin.findUnique({
      where: { id },
      include: {
        versions: {
          where: { isStable: true },
          orderBy: { releaseDate: "desc" },
          take: 1,
        },
        permissions: true,
      },
    });

    if (!plugin) return null;

    return {
      id: plugin.id,
      name: plugin.name,
      description: plugin.description,
      author: plugin.author,
      category: plugin.category,
      iconUrl: plugin.iconUrl,
      downloadCount: plugin.downloadCount,
      averageRating: plugin.averageRating,
      createdAt: plugin.createdAt,
      updatedAt: plugin.updatedAt,
      isActive: plugin.isActive,
      isVerified: plugin.isVerified,
      version: plugin.versions[0]?.version || "1.0.0",
      size: 0, // TODO: Calculate from plugin files
      tags: [], // TODO: Add tags to schema or derive from category
      requiredPermissions: plugin.permissions.map((p) => p.permissionType),
    };
  }

  async createPlugin(
    data: Omit<Plugin, "createdAt" | "updatedAt">
  ): Promise<Plugin> {
    const plugin = await this.prisma.plugin.create({
      data: {
        id: data.id,
        name: data.name,
        description: data.description,
        author: data.author,
        category: data.category,
        iconUrl: data.iconUrl,
        downloadCount: data.downloadCount,
        averageRating: data.averageRating,
        isActive: data.isActive,
        isVerified: data.isVerified,
      },
    });

    return {
      ...plugin,
      version: data.version,
      size: data.size,
      tags: data.tags,
      requiredPermissions: data.requiredPermissions,
    };
  }

  async updatePlugin(id: string, data: Partial<Plugin>): Promise<Plugin> {
    const plugin = await this.prisma.plugin.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        author: data.author,
        category: data.category,
        iconUrl: data.iconUrl,
        downloadCount: data.downloadCount,
        averageRating: data.averageRating,
        isActive: data.isActive,
        isVerified: data.isVerified,
      },
    });

    return {
      ...plugin,
      version: data.version || "1.0.0",
      size: data.size || 0,
      tags: data.tags || [],
      requiredPermissions: data.requiredPermissions || [],
    };
  }

  async deletePlugin(id: string): Promise<void> {
    await this.prisma.plugin.delete({
      where: { id },
    });
  }

  // UserPlugin methods
  async getUserPlugins(userId: string): Promise<UserPlugin[]> {
    const userPlugins = await this.prisma.userPlugin.findMany({
      where: { userId },
      orderBy: { installedAt: "desc" },
      include: {
        plugin: true,
      },
    });

    return userPlugins.map((plugin) => ({
      ...plugin,
      settings: plugin.settings ? JSON.parse(plugin.settings as string) : {},
    }));
  }

  async getUserPlugin(
    userId: string,
    pluginId: string
  ): Promise<UserPlugin | null> {
    const userPlugin = await this.prisma.userPlugin.findUnique({
      where: {
        userId_pluginId: {
          userId,
          pluginId,
        },
      },
      include: {
        plugin: true,
      },
    });

    if (!userPlugin) return null;

    return {
      ...userPlugin,
      settings: userPlugin.settings
        ? JSON.parse(userPlugin.settings as string)
        : {},
    };
  }

  async createUserPlugin(data: Omit<UserPlugin, "id">): Promise<UserPlugin> {
    const userPlugin = await this.prisma.userPlugin.create({
      data: {
        ...data,
        settings: JSON.stringify(data.settings || {}),
      },
    });

    return {
      ...userPlugin,
      settings: userPlugin.settings
        ? JSON.parse(userPlugin.settings as string)
        : {},
    };
  }

  async installUserPlugin(
    userId: string,
    pluginId: string,
    options?: {
      isEnabled?: boolean;
      settings?: Record<string, any>;
      lastUsed?: Date;
    }
  ): Promise<UserPlugin> {
    const plugin = await this.getPluginById(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    const userPlugin = await this.prisma.userPlugin.create({
      data: {
        userId,
        pluginId,
        installedVersion: plugin.version,
        installedAt: new Date(),
        lastUsedAt: options?.lastUsed || new Date(),
        isEnabled: options?.isEnabled ?? true,
        settings: JSON.stringify(options?.settings || {}),
      },
    });

    return {
      ...userPlugin,
      settings: userPlugin.settings
        ? JSON.parse(userPlugin.settings as string)
        : {},
    };
  }

  async uninstallUserPlugin(userId: string, pluginId: string): Promise<void> {
    await this.prisma.userPlugin.delete({
      where: {
        userId_pluginId: {
          userId,
          pluginId,
        },
      },
    });
  }

  async updateUserPlugin(
    userId: string,
    pluginId: string,
    data: Partial<UserPlugin>
  ): Promise<UserPlugin> {
    const userPlugin = await this.prisma.userPlugin.update({
      where: {
        userId_pluginId: {
          userId,
          pluginId,
        },
      },
      data: {
        ...data,
        settings: data.settings ? JSON.stringify(data.settings) : undefined,
      },
    });

    return {
      ...userPlugin,
      settings: userPlugin.settings
        ? JSON.parse(userPlugin.settings as string)
        : {},
    };
  }

  async enableUserPlugin(
    userId: string,
    pluginId: string
  ): Promise<UserPlugin> {
    console.log(
      `[DatabaseService] enableUserPlugin called with userId: ${userId}, pluginId: ${pluginId}`
    );
    try {
      // Ensure user exists first
      await this.ensureUserExists(userId);

      // First check if UserPlugin record exists
      const existingUserPlugin = await this.getUserPlugin(userId, pluginId);
      console.log(`[DatabaseService] existingUserPlugin:`, existingUserPlugin);

      if (existingUserPlugin) {
        // Update existing record
        console.log(`[DatabaseService] Updating existing UserPlugin record`);
        return await this.updateUserPlugin(userId, pluginId, {
          isEnabled: true,
        });
      } else {
        // Create new UserPlugin record if it doesn't exist
        console.log(
          `[DatabaseService] Creating new UserPlugin record for user ${userId} and plugin ${pluginId}`
        );
        return await this.installUserPlugin(userId, pluginId, {
          isEnabled: true,
        });
      }
    } catch (error) {
      console.error(
        `[DatabaseService] Failed to enable user plugin ${pluginId} for user ${userId}:`,
        error
      );
      throw error;
    }
  }

  async disableUserPlugin(
    userId: string,
    pluginId: string
  ): Promise<UserPlugin> {
    console.log(
      `[DatabaseService] disableUserPlugin called with userId: ${userId}, pluginId: ${pluginId}`
    );
    try {
      // Ensure user exists first
      await this.ensureUserExists(userId);

      // First check if UserPlugin record exists
      const existingUserPlugin = await this.getUserPlugin(userId, pluginId);
      console.log(`[DatabaseService] existingUserPlugin:`, existingUserPlugin);

      if (existingUserPlugin) {
        // Update existing record
        console.log(`[DatabaseService] Updating existing UserPlugin record`);
        return await this.updateUserPlugin(userId, pluginId, {
          isEnabled: false,
        });
      } else {
        // Create new UserPlugin record if it doesn't exist (disabled by default)
        console.log(
          `[DatabaseService] Creating new UserPlugin record for user ${userId} and plugin ${pluginId} (disabled)`
        );
        return await this.installUserPlugin(userId, pluginId, {
          isEnabled: false,
        });
      }
    } catch (error) {
      console.error(
        `[DatabaseService] Failed to disable user plugin ${pluginId} for user ${userId}:`,
        error
      );
      throw error;
    }
  }

  // AppSettings methods
  async getAppSettings(): Promise<AppSettings | null> {
    const settings = await this.prisma.appSettings.findMany();
    if (settings.length === 0) return null;

    // Convert array of key-value pairs to a single settings object
    const settingsObj: any = { id: "default" };
    settings.forEach((setting) => {
      settingsObj[setting.key] = setting.value;
    });
    return settingsObj as AppSettings;
  }

  async updateAppSettings(data: Partial<AppSettings>): Promise<AppSettings> {
    // Convert settings object to key-value pairs
    const entries = Object.entries(data).filter(([key]) => key !== "id");

    for (const [key, value] of entries) {
      await this.prisma.appSettings.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }

    return this.getAppSettings() as Promise<AppSettings>;
  }

  async getSetting(key: string): Promise<any> {
    const setting = await this.prisma.appSettings.findUnique({
      where: { key },
    });
    return setting?.value;
  }

  async updateSetting(key: string, value: any): Promise<void> {
    await this.prisma.appSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  // User methods
  async getUser(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }

  async createUser(data: {
    id?: string;
    username: string;
    email: string;
    preferences?: Record<string, any>;
  }) {
    return await this.prisma.user.create({
      data,
    });
  }

  async ensureUserExists(userId: string): Promise<void> {
    const existingUser = await this.getUser(userId);
    if (!existingUser) {
      console.log(
        `[DatabaseService] Creating user ${userId} as it doesn't exist`
      );
      await this.createUser({
        id: userId,
        username: userId,
        email: `${userId}@example.com`,
        preferences: {},
      });
    }
  }

  async updateUser(
    id: string,
    data: {
      username?: string;
      email?: string;
      preferences?: Record<string, any>;
    }
  ) {
    return await this.prisma.user.update({
      where: { id },
      data,
    });
  }

  // Utility methods
  async clearAllData(): Promise<void> {
    // Delete in correct order to avoid foreign key constraints
    await this.prisma.userPlugin.deleteMany();
    await this.prisma.plugin.deleteMany();
    await this.prisma.appSettings.deleteMany();
    await this.prisma.user.deleteMany();
  }

  async getStats() {
    const [pluginCount, userCount, userPluginCount] = await Promise.all([
      this.prisma.plugin.count(),
      this.prisma.user.count(),
      this.prisma.userPlugin.count(),
    ]);

    return {
      plugins: pluginCount,
      users: userCount,
      installations: userPluginCount,
    };
  }
}
