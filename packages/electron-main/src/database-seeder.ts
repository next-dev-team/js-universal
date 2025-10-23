import { DatabaseService } from './database-service'
import { Plugin, UserPlugin, AppSettings } from './types'
import * as path from 'path'
import * as fs from 'fs/promises'

export class DatabaseSeeder {
  private databaseService: DatabaseService

  constructor(databaseService: DatabaseService) {
    this.databaseService = databaseService
  }

  async seedDatabase(): Promise<void> {
    console.log('Starting database seeding...')

    try {
      // Seed default settings
      await this.seedDefaultSettings()
      
      // Seed sample plugins
      await this.seedSamplePlugins()
      
      // Seed user plugins (installed plugins)
      await this.seedUserPlugins()

      console.log('Database seeding completed successfully')
    } catch (error) {
      console.error('Database seeding failed:', error)
      throw error
    }
  }

  private async seedDefaultSettings(): Promise<void> {
    console.log('Seeding default settings...')

    const defaultSettings: Partial<AppSettings> = {
      theme: 'light',
      language: 'en',
      autoLaunch: false,
      autoUpdate: true,
      maxConcurrentPlugins: 5,
      enableNotifications: true,
      enableSounds: true,
      notificationPosition: 'topRight',
      developerMode: false,
      logLevel: 'info',
      dataRetentionDays: 30,
      allowTelemetry: true,
      autoBackup: true,
      backupInterval: 24
    }

    try {
      // Check if settings already exist
      const existingSettings = await this.databaseService.getAppSettings()
      if (!existingSettings) {
        await this.databaseService.updateAppSettings(defaultSettings)
        console.log('Default settings created')
      } else {
        console.log('Settings already exist, skipping...')
      }
    } catch (error) {
      console.error('Failed to seed default settings:', error)
    }
  }

  private async seedSamplePlugins(): Promise<void> {
    console.log('Seeding sample plugins...')

    const samplePlugins: Omit<Plugin, 'createdAt' | 'updatedAt'>[] = [
      {
        id: 'text-editor-pro',
        name: 'Text Editor Pro',
        description: 'A powerful text editor with syntax highlighting and advanced features',
        version: '2.1.0',
        author: 'DevTools Inc',
        category: 'Productivity',
        tags: ['editor', 'text', 'syntax', 'productivity'],
        iconUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20text%20editor%20icon%20with%20syntax%20highlighting%20colors&image_size=square',
        size: 2048000, // 2MB
        downloadCount: 15420,
        averageRating: 4.7,
        isActive: true,
        isVerified: true,
        requiredPermissions: ['filesystem', 'clipboard']
      },
      {
        id: 'task-manager-deluxe',
        name: 'Task Manager Deluxe',
        description: 'Organize your tasks and boost productivity with this comprehensive task management tool',
        version: '1.5.2',
        author: 'Productivity Labs',
        category: 'Productivity',
        tags: ['tasks', 'productivity', 'organization', 'planning'],
        iconUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=task%20management%20checklist%20icon%20modern%20design&image_size=square',
        size: 1536000, // 1.5MB
        downloadCount: 8934,
        averageRating: 4.5,
        isActive: true,
        isVerified: true,
        requiredPermissions: ['notifications', 'storage']
      },
      {
        id: 'weather-widget',
        name: 'Weather Widget',
        description: 'Beautiful weather widget with forecasts and customizable themes',
        version: '3.0.1',
        author: 'Weather Apps Co',
        category: 'Utilities',
        tags: ['weather', 'widget', 'forecast', 'utility'],
        iconUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=weather%20widget%20icon%20with%20sun%20and%20clouds&image_size=square',
        size: 512000, // 512KB
        downloadCount: 23456,
        averageRating: 4.3,
        isActive: true,
        isVerified: true,
        requiredPermissions: ['network', 'geolocation']
      },
      {
        id: 'code-snippet-manager',
        name: 'Code Snippet Manager',
        description: 'Store, organize, and quickly access your favorite code snippets',
        version: '1.8.0',
        author: 'CodeTools Studio',
        category: 'Development',
        tags: ['code', 'snippets', 'development', 'programming'],
        iconUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=code%20snippet%20manager%20icon%20with%20brackets%20and%20code&image_size=square',
        size: 1024000, // 1MB
        downloadCount: 12789,
        averageRating: 4.6,
        isActive: true,
        isVerified: true,
        requiredPermissions: ['clipboard', 'filesystem']
      },
      {
        id: 'music-player-mini',
        name: 'Music Player Mini',
        description: 'Lightweight music player with playlist support and audio visualization',
        version: '2.3.1',
        author: 'Audio Solutions',
        category: 'Entertainment',
        tags: ['music', 'audio', 'player', 'entertainment'],
        iconUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=music%20player%20icon%20with%20play%20button%20and%20sound%20waves&image_size=square',
        size: 3072000, // 3MB
        downloadCount: 18765,
        averageRating: 4.4,
        isActive: true,
        isVerified: false,
        requiredPermissions: ['filesystem', 'media']
      }
    ]

    try {
      // Check if plugins already exist
      const existingPlugins = await this.databaseService.getAllPlugins()
      if (existingPlugins.length === 0) {
        for (const plugin of samplePlugins) {
          await this.databaseService.createPlugin(plugin)
        }
        console.log(`Created ${samplePlugins.length} sample plugins`)
      } else {
        console.log('Plugins already exist, skipping...')
      }
    } catch (error) {
      console.error('Failed to seed sample plugins:', error)
    }
  }

  private async seedUserPlugins(): Promise<void> {
    console.log('Seeding user plugins...')

    try {
      // Get existing plugins
      const plugins = await this.databaseService.getAllPlugins()
      if (plugins.length === 0) {
        console.log('No plugins found, skipping user plugin seeding')
        return
      }

      // Check if user plugins already exist
      const existingUserPlugins = await this.databaseService.getUserPlugins('default-user')
      if (existingUserPlugins.length === 0) {
        // Install first 3 plugins for the default user
        const pluginsToInstall = plugins.slice(0, 3)
        
        for (const plugin of pluginsToInstall) {
          const userPlugin: Omit<UserPlugin, 'id'> = {
            userId: 'default-user',
            pluginId: plugin.id,
            installedVersion: plugin.version,
            installedAt: new Date(),
            lastUsedAt: new Date(),
            isEnabled: true,
            settings: {}
          }
          
          await this.databaseService.createUserPlugin(userPlugin)
        }
        
        console.log(`Installed ${pluginsToInstall.length} plugins for default user`)
      } else {
        console.log('User plugins already exist, skipping...')
      }
    } catch (error) {
      console.error('Failed to seed user plugins:', error)
    }
  }

  async clearDatabase(): Promise<void> {
    console.log('Clearing database...')
    
    try {
      // Clear all data
      await this.databaseService.clearAllData()
      console.log('Database cleared successfully')
    } catch (error) {
      console.error('Failed to clear database:', error)
      throw error
    }
  }

  async resetDatabase(): Promise<void> {
    console.log('Resetting database...')
    
    try {
      await this.clearDatabase()
      await this.seedDatabase()
      console.log('Database reset completed successfully')
    } catch (error) {
      console.error('Database reset failed:', error)
      throw error
    }
  }
}