// Direct Plugin System
// This allows developers to create plugins directly within the main app structure

export interface DirectPlugin {
  id: string;
  name: string;
  version: string;
  description?: string;
  component: React.ComponentType<any>;
  icon?: string;
  category?: string;
  enabled?: boolean;
}

export interface DirectPluginManifest {
  id: string;
  name: string;
  version: string;
  description?: string;
  main: string; // Path to the main component file
  icon?: string;
  category?: string;
  dependencies?: string[];
}

// Plugin registry for direct plugins
class DirectPluginRegistry {
  private plugins: Map<string, DirectPlugin> = new Map();
  private manifests: Map<string, DirectPluginManifest> = new Map();

  register(plugin: DirectPlugin, manifest?: DirectPluginManifest) {
    this.plugins.set(plugin.id, plugin);
    if (manifest) {
      this.manifests.set(plugin.id, manifest);
    }
    console.log(`[DirectPluginRegistry] Registered plugin: ${plugin.name} (${plugin.id})`);
  }

  unregister(pluginId: string) {
    this.plugins.delete(pluginId);
    this.manifests.delete(pluginId);
    console.log(`[DirectPluginRegistry] Unregistered plugin: ${pluginId}`);
  }

  get(pluginId: string): DirectPlugin | undefined {
    return this.plugins.get(pluginId);
  }

  getAll(): DirectPlugin[] {
    return Array.from(this.plugins.values());
  }

  getManifest(pluginId: string): DirectPluginManifest | undefined {
    return this.manifests.get(pluginId);
  }

  getAllManifests(): DirectPluginManifest[] {
    return Array.from(this.manifests.values());
  }

  getEnabled(): DirectPlugin[] {
    return this.getAll().filter(plugin => plugin.enabled !== false);
  }
}

export const directPluginRegistry = new DirectPluginRegistry();

// Auto-discovery function for plugins in src/plugins directory
export async function discoverDirectPlugins(): Promise<DirectPlugin[]> {
  const plugins: DirectPlugin[] = [];
  
  try {
    // This will be populated by the build system or runtime discovery
    const pluginModules = import.meta.glob('./*/index.{ts,tsx,js,jsx}', { eager: true });
    
    for (const [path, module] of Object.entries(pluginModules)) {
      try {
        const pluginModule = module as any;
        
        if (pluginModule.default && typeof pluginModule.default === 'object') {
          const plugin = pluginModule.default as DirectPlugin;
          
          // Validate plugin structure
          if (plugin.id && plugin.name && plugin.component) {
            plugins.push(plugin);
            directPluginRegistry.register(plugin);
          } else {
            console.warn(`[DirectPluginRegistry] Invalid plugin structure in ${path}:`, plugin);
          }
        }
      } catch (error) {
        console.error(`[DirectPluginRegistry] Error loading plugin from ${path}:`, error);
      }
    }
  } catch (error) {
    console.error('[DirectPluginRegistry] Error discovering plugins:', error);
  }
  
  return plugins;
}

// Helper function to create a plugin
export function createDirectPlugin(config: Omit<DirectPlugin, 'enabled'>): DirectPlugin {
  return {
    enabled: true,
    ...config,
  };
}