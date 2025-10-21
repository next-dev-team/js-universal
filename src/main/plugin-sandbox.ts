import { BrowserWindow, ipcMain, app, dialog, shell } from 'electron'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readFile, writeFile, access, mkdir } from 'fs/promises'
import { PluginContext, PluginManifest, IPC_CHANNELS } from '../../shared/types'
import { DatabaseService } from './database-service'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export class PluginSandbox {
  private pluginWindows: Map<string, BrowserWindow> = new Map()
  private pluginContexts: Map<string, PluginContext> = new Map()
  private databaseService: DatabaseService

  constructor(databaseService: DatabaseService) {
    this.databaseService = databaseService
    this.setupIPCHandlers()
  }

  async createSandbox(pluginId: string, manifest: PluginManifest): Promise<BrowserWindow> {
    const pluginDataPath = join(app.getPath('userData'), 'plugins', pluginId)
    const pluginTempPath = join(app.getPath('temp'), 'electron-plugin-app', pluginId)
    
    // Ensure plugin directories exist
    await mkdir(pluginDataPath, { recursive: true })
    await mkdir(pluginTempPath, { recursive: true })

    const context: PluginContext = {
      pluginId,
      pluginName: manifest.name,
      version: manifest.version,
      permissions: manifest.permissions || [],
      dataPath: pluginDataPath,
      tempPath: pluginTempPath
    }

    this.pluginContexts.set(pluginId, context)

    const windowOptions = {
      width: manifest.window?.width || 800,
      height: manifest.window?.height || 600,
      minWidth: manifest.window?.minWidth || 400,
      minHeight: manifest.window?.minHeight || 300,
      maxWidth: manifest.window?.maxWidth,
      maxHeight: manifest.window?.maxHeight,
      resizable: manifest.window?.resizable !== false,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        sandbox: true,
        preload: join(__dirname, '../preload/plugin-preload.js'),
        additionalArguments: [`--plugin-id=${pluginId}`]
      }
    }

    const window = new BrowserWindow(windowOptions)
    this.pluginWindows.set(pluginId, window)

    // Set up window event handlers
    this.setupWindowEventHandlers(window, pluginId)

    return window
  }

  async loadPlugin(pluginId: string, pluginPath: string): Promise<void> {
    const window = this.pluginWindows.get(pluginId)
    if (!window) {
      throw new Error(`No sandbox window found for plugin ${pluginId}`)
    }

    const manifestPath = join(pluginPath, 'package.json')
    const manifest: PluginManifest = JSON.parse(await readFile(manifestPath, 'utf-8'))
    
    const entryPoint = join(pluginPath, manifest.main || 'index.js')
    
    try {
      await access(entryPoint)
    } catch {
      throw new Error(`Entry point not found: ${entryPoint}`)
    }

    // Check if it's a JS plugin or HTML plugin
    if (entryPoint.endsWith('.js')) {
      // For JS plugins, create an HTML wrapper
      const htmlContent = this.createHTMLWrapper(entryPoint, manifest)
      const tempHtmlPath = join(this.pluginContexts.get(pluginId)!.tempPath, 'index.html')
      await writeFile(tempHtmlPath, htmlContent)
      await window.loadFile(tempHtmlPath)
    } else if (entryPoint.endsWith('.html')) {
      // For HTML plugins, load directly
      await window.loadFile(entryPoint)
    } else {
      throw new Error(`Unsupported entry point type: ${entryPoint}`)
    }

    window.show()
  }

  private createHTMLWrapper(jsPath: string, manifest: PluginManifest): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${manifest.name}</title>
    <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval'; script-src 'self' 'unsafe-inline' 'unsafe-eval';">
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
        }
        .plugin-container {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="plugin-container">
        <h1>${manifest.name}</h1>
        <p>${manifest.description}</p>
        <div id="plugin-content"></div>
    </div>
    <script src="${jsPath}"></script>
</body>
</html>`
  }

  private setupWindowEventHandlers(window: BrowserWindow, pluginId: string): void {
    window.on('closed', () => {
      this.pluginWindows.delete(pluginId)
      this.pluginContexts.delete(pluginId)
    })

    window.on('unresponsive', () => {
      console.warn(`Plugin ${pluginId} became unresponsive`)
    })

    window.on('responsive', () => {
      console.log(`Plugin ${pluginId} became responsive again`)
    })

    window.webContents.on('crashed', () => {
      console.error(`Plugin ${pluginId} crashed`)
      this.closePlugin(pluginId)
    })
  }

  closePlugin(pluginId: string): void {
    const window = this.pluginWindows.get(pluginId)
    if (window && !window.isDestroyed()) {
      window.close()
    }
    this.pluginWindows.delete(pluginId)
    this.pluginContexts.delete(pluginId)
  }

  getRunningPlugins(): string[] {
    return Array.from(this.pluginWindows.keys())
  }

  isPluginRunning(pluginId: string): boolean {
    return this.pluginWindows.has(pluginId)
  }

  private setupIPCHandlers(): void {
    // Plugin API handler
    ipcMain.handle(IPC_CHANNELS.PLUGIN_API_CALL, async (event, { pluginId, api, method, args }) => {
      try {
        const context = this.pluginContexts.get(pluginId)
        if (!context) {
          throw new Error(`Plugin context not found for ${pluginId}`)
        }

        switch (api) {
          case 'storage':
            return await this.handleStorageAPI(context, method, args)
          case 'notifications':
            return await this.handleNotificationsAPI(context, method, args)
          case 'network':
            return await this.handleNetworkAPI(context, method, args)
          case 'filesystem':
            return await this.handleFilesystemAPI(context, method, args)
          default:
            throw new Error(`Unknown API: ${api}`)
        }
      } catch (error) {
        console.error(`Plugin API error for ${pluginId}:`, error)
        throw error
      }
    })

    // Note: PLUGIN_MESSAGE handler is now registered in main.ts to avoid duplicate registrations
  }

  private async handleStorageAPI(context: PluginContext, method: string, args: any[]): Promise<any> {
    const storageFile = join(context.dataPath, 'storage.json')
    
    let storage: Record<string, any> = {}
    try {
      const data = await readFile(storageFile, 'utf-8')
      storage = JSON.parse(data)
    } catch {
      // File doesn't exist or is invalid, start with empty storage
    }

    switch (method) {
      case 'get':
        return storage[args[0]]
      
      case 'set':
        storage[args[0]] = args[1]
        await writeFile(storageFile, JSON.stringify(storage, null, 2))
        break
      
      case 'remove':
        delete storage[args[0]]
        await writeFile(storageFile, JSON.stringify(storage, null, 2))
        break
      
      case 'clear':
        await writeFile(storageFile, '{}')
        break
      
      default:
        throw new Error(`Unknown storage method: ${method}`)
    }
  }

  private async handleNotificationsAPI(context: PluginContext, method: string, args: any[]): Promise<any> {
    if (!context.permissions.includes('notifications')) {
      throw new Error('Plugin does not have notification permission')
    }

    switch (method) {
      case 'show':
        const [title, body, options] = args
        // Use Electron's notification system
        const { Notification } = require('electron')
        if (Notification.isSupported()) {
          new Notification({
            title: `${context.pluginName}: ${title}`,
            body,
            ...options
          }).show()
        }
        break
      
      default:
        throw new Error(`Unknown notifications method: ${method}`)
    }
  }

  private async handleNetworkAPI(context: PluginContext, method: string, args: any[]): Promise<any> {
    if (!context.permissions.includes('network')) {
      throw new Error('Plugin does not have network permission')
    }

    switch (method) {
      case 'fetch':
        const [url, options] = args
        // Use node-fetch or similar for network requests
        const response = await fetch(url, options)
        return {
          ok: response.ok,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          text: await response.text()
        }
      
      default:
        throw new Error(`Unknown network method: ${method}`)
    }
  }

  private async handleFilesystemAPI(context: PluginContext, method: string, args: any[]): Promise<any> {
    if (!context.permissions.includes('filesystem')) {
      throw new Error('Plugin does not have filesystem permission')
    }

    // Restrict file operations to plugin's data directory
    const [relativePath] = args
    const fullPath = join(context.dataPath, relativePath)
    
    // Security check: ensure path is within plugin's data directory
    if (!fullPath.startsWith(context.dataPath)) {
      throw new Error('File access outside plugin directory is not allowed')
    }

    switch (method) {
      case 'readFile':
        return await readFile(fullPath, 'utf-8')
      
      case 'writeFile':
        const [, content] = args
        await writeFile(fullPath, content, 'utf-8')
        break
      
      case 'exists':
        try {
          await access(fullPath)
          return true
        } catch {
          return false
        }
      
      default:
        throw new Error(`Unknown filesystem method: ${method}`)
    }
  }
}