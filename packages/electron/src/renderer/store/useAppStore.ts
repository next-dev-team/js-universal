import { create } from "zustand";
import { Plugin, UserPlugin, AppSettings, User } from "../types";

interface AppState {
  // User state
  currentUser: User | null;

  // Plugin state
  plugins: Plugin[];
  userPlugins: UserPlugin[];
  installedPlugins: Plugin[];
  runningPlugins: string[];

  // Settings state
  settings: Record<string, any>;

  // UI state
  currentPage: string;
  sidebarCollapsed: boolean;
  theme: "light" | "dark";
  loading: boolean;

  // Actions
  setCurrentUser: (user: User | null) => void;
  setPlugins: (plugins: Plugin[]) => void;
  setUserPlugins: (userPlugins: UserPlugin[]) => void;
  setInstalledPlugins: (plugins: Plugin[]) => void;
  setRunningPlugins: (pluginIds: string[]) => void;
  setSetting: (key: string, value: any) => void;
  setSettings: (settings: Record<string, any>) => void;
  setCurrentPage: (page: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: "light" | "dark") => void;
  setLoading: (loading: boolean) => void;

  // Plugin actions
  installPlugin: (
    pluginPath: string
  ) => Promise<{ success: boolean; message: string }>;
  uninstallPlugin: (
    pluginId: string
  ) => Promise<{ success: boolean; message: string }>;
  enablePlugin: (
    pluginId: string
  ) => Promise<{ success: boolean; message: string }>;
  disablePlugin: (
    pluginId: string
  ) => Promise<{ success: boolean; message: string }>;
  enableUserPlugin: (
    userId: string,
    pluginId: string
  ) => Promise<{ success: boolean; data?: any; error?: string }>;
  disableUserPlugin: (
    userId: string,
    pluginId: string
  ) => Promise<{ success: boolean; data?: any; error?: string }>;
  launchPlugin: (
    pluginId: string
  ) => Promise<{ success: boolean; message: string }>;
  closePlugin: (
    pluginId: string
  ) => Promise<{ success: boolean; message: string }>;

  // Data loading actions
  loadPlugins: () => Promise<void>;
  loadUserPlugins: () => Promise<void>;
  loadSettings: () => Promise<void>;
  updateSetting: (key: string, value: any) => Promise<void>;
  updateSettings: (settings: Record<string, any>) => Promise<void>;
  updateUser: (user: Partial<User>) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  currentUser: null,
  plugins: [],
  userPlugins: [],
  installedPlugins: [],
  runningPlugins: [],
  settings: {},
  currentPage: "dashboard",
  sidebarCollapsed: false,
  theme: "light",
  loading: false,

  // Basic setters
  setCurrentUser: (user) => set({ currentUser: user }),
  setPlugins: (plugins) => set({ plugins }),
  setUserPlugins: (userPlugins) => set({ userPlugins }),
  setInstalledPlugins: (plugins) => set({ installedPlugins: plugins }),
  setRunningPlugins: (pluginIds) => set({ runningPlugins: pluginIds }),
  setSetting: (key, value) =>
    set((state) => ({
      settings: { ...state.settings, [key]: value },
    })),
  setSettings: (settings) => set({ settings }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setTheme: (theme) => set({ theme }),
  setLoading: (loading) => set({ loading }),

  // Plugin actions
  installPlugin: async (pluginPath: string) => {
    set({ loading: true });
    try {
      const result = await window.electronAPI.installPlugin(pluginPath);
      if (result.success) {
        // Reload plugins after successful installation
        await get().loadPlugins();
        await get().loadUserPlugins();
      }
      return result;
    } finally {
      set({ loading: false });
    }
  },

  uninstallPlugin: async (pluginId: string) => {
    set({ loading: true });
    try {
      const result = await window.electronAPI.uninstallPlugin(pluginId);
      if (result.success) {
        // Reload plugins after successful uninstallation
        await get().loadPlugins();
        await get().loadUserPlugins();
        // Remove from running plugins if it was running
        const runningPlugins = get().runningPlugins.filter(
          (id) => id !== pluginId
        );
        set({ runningPlugins });
      }
      return result;
    } finally {
      set({ loading: false });
    }
  },

  enablePlugin: async (pluginId: string) => {
    const result = await window.electronAPI.enablePlugin(pluginId);
    if (result.success) {
      await get().loadPlugins();
      await get().loadUserPlugins();
    }
    return result;
  },

  disablePlugin: async (pluginId: string) => {
    const result = await window.electronAPI.disablePlugin(pluginId);
    if (result.success) {
      await get().loadPlugins();
      await get().loadUserPlugins();
      // Remove from running plugins if it was running
      const runningPlugins = get().runningPlugins.filter(
        (id) => id !== pluginId
      );
      set({ runningPlugins });
    }
    return result;
  },

  enableUserPlugin: async (userId: string, pluginId: string) => {
    try {
      const result = await window.electronAPI.enableUserPlugin(
        userId,
        pluginId
      );
      if (result) {
        await get().loadUserPlugins();
      }
      return { success: true, data: result };
    } catch (error) {
      console.error("Failed to enable user plugin:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },

  disableUserPlugin: async (userId: string, pluginId: string) => {
    try {
      const result = await window.electronAPI.disableUserPlugin(
        userId,
        pluginId
      );
      if (result) {
        await get().loadUserPlugins();
        // Remove from running plugins if it was running
        const runningPlugins = get().runningPlugins.filter(
          (id) => id !== pluginId
        );
        set({ runningPlugins });
      }
      return { success: true, data: result };
    } catch (error) {
      console.error("Failed to disable user plugin:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },

  launchPlugin: async (pluginId: string) => {
    const result = await window.electronAPI.launchPlugin(pluginId);
    if (result.success) {
      const runningPlugins = [...get().runningPlugins];
      if (!runningPlugins.includes(pluginId)) {
        runningPlugins.push(pluginId);
        set({ runningPlugins });
      }
    }
    return result;
  },

  closePlugin: async (pluginId: string) => {
    const result = await window.electronAPI.closePlugin(pluginId);
    if (result.success) {
      const runningPlugins = get().runningPlugins.filter(
        (id) => id !== pluginId
      );
      set({ runningPlugins });
    }
    return result;
  },

  // Data loading actions
  loadPlugins: async () => {
    try {
      const plugins = await window.electronAPI.getPlugins();
      set({ plugins });
    } catch (error) {
      console.error("Failed to load plugins:", error);
    }
  },

  loadUserPlugins: async () => {
    try {
      const currentUser = get().currentUser;
      if (currentUser) {
        const userPlugins = await window.electronAPI.getUserPlugins(
          currentUser.id
        );
        set({ userPlugins });

        // Update installed plugins list
        const installedPlugins = get().plugins.filter((plugin) =>
          userPlugins.some((up) => up.pluginId === plugin.id)
        );
        set({ installedPlugins });
      }
    } catch (error) {
      console.error("Failed to load user plugins:", error);
    }
  },

  loadSettings: async () => {
    try {
      const appSettings =
        (await window.electronAPI.getSettings()) as unknown as AppSettings | null;
      if (appSettings) {
        const settings: Record<string, any> = {
          "ui.theme": appSettings.theme,
          "ui.language": appSettings.language,
          "app.autoLaunch": appSettings.autoLaunch,
          "app.autoUpdate": appSettings.autoUpdate,
          "app.maxConcurrentPlugins": appSettings.maxConcurrentPlugins,
          "notifications.enabled": appSettings.enableNotifications,
          "notifications.sounds": appSettings.enableSounds,
          "notifications.position": appSettings.notificationPosition,
          "developer.mode": appSettings.developerMode,
          "developer.logLevel": appSettings.logLevel,
          "data.retentionDays": appSettings.dataRetentionDays,
          "privacy.allowTelemetry": appSettings.allowTelemetry,
          "backup.auto": appSettings.autoBackup,
          "backup.interval": appSettings.backupInterval,
        };
        set({ settings });

        // Apply theme setting
        if (settings["ui.theme"]) {
          set({ theme: settings["ui.theme"] });
        }
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  },

  updateSetting: async (key: string, value: any) => {
    try {
      await window.electronAPI.updateSettings(key, value);
      get().setSetting(key, value);

      // Apply theme changes immediately
      if (key === "ui.theme") {
        set({ theme: value });
      }
    } catch (error) {
      console.error("Failed to update setting:", error);
    }
  },

  updateSettings: async (settings: Record<string, any>) => {
    try {
      for (const [key, value] of Object.entries(settings)) {
        await window.electronAPI.updateSettings(key, value);
      }
      set((state) => ({ settings: { ...state.settings, ...settings } }));

      // Apply theme changes immediately
      if (settings["ui.theme"]) {
        set({ theme: settings["ui.theme"] });
      }
    } catch (error) {
      console.error("Failed to update settings:", error);
    }
  },

  updateUser: async (user: Partial<User>) => {
    try {
      const currentUser = get().currentUser;
      if (currentUser) {
        const updatedUser = await window.electronAPI.updateUser(
          currentUser.id,
          user
        );
        set({ currentUser: updatedUser });
      }
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  },
}));
