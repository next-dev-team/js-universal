import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { DatabaseService } from '../../src/main/database-service'

describe('DatabaseService', () => {
  let databaseService: DatabaseService
  let mockPrisma: any

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      plugin: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      userPlugin: {
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        deleteMany: vi.fn(),
      },
      appSettings: {
        findMany: vi.fn(),
        upsert: vi.fn(),
        deleteMany: vi.fn(),
      },
      $disconnect: vi.fn(),
    }

    databaseService = new DatabaseService(mockPrisma)
  })

  describe('User Operations', () => {
    it('should get user by id', async () => {
      const mockUser = { id: 'test-id', username: 'testuser', email: 'test@example.com' }
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)

      const result = await databaseService.getUser('test-id')

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' }
      })
      expect(result).toEqual(mockUser)
    })

    it('should create user', async () => {
      const userData = { username: 'newuser', email: 'new@example.com' }
      const mockCreatedUser = { id: 'new-id', ...userData }
      mockPrisma.user.create.mockResolvedValue(mockCreatedUser)

      const result = await databaseService.createUser(userData)

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: userData
      })
      expect(result).toEqual(mockCreatedUser)
    })

    it('should update user', async () => {
      const userId = 'test-id'
      const updateData = { username: 'updateduser', email: 'updated@example.com' }
      const mockUpdatedUser = { id: userId, ...updateData }
      mockPrisma.user.update.mockResolvedValue(mockUpdatedUser)

      const result = await databaseService.updateUser(userId, updateData)

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateData
      })
      expect(result).toEqual(mockUpdatedUser)
    })

    it('should handle update user errors', async () => {
      const userId = 'test-id'
      const updateData = { username: 'updateduser' }
      const error = new Error('Database connection failed')
      mockPrisma.user.update.mockRejectedValue(error)

      await expect(databaseService.updateUser(userId, updateData)).rejects.toThrow('Database connection failed')
    })
  })

  describe('Plugin Operations', () => {
    it('should get all plugins', async () => {
      const mockPlugins = [
        { id: 'plugin1', name: 'Test Plugin 1' },
        { id: 'plugin2', name: 'Test Plugin 2' }
      ]
      mockPrisma.plugin.findMany.mockResolvedValue(mockPlugins)

      const result = await databaseService.getPlugins()

      expect(mockPrisma.plugin.findMany).toHaveBeenCalled()
      expect(result).toEqual(mockPlugins)
    })

    it('should get plugin by id', async () => {
      const mockPlugin = { id: 'plugin1', name: 'Test Plugin' }
      mockPrisma.plugin.findUnique.mockResolvedValue(mockPlugin)

      const result = await databaseService.getPluginById('plugin1')

      expect(mockPrisma.plugin.findUnique).toHaveBeenCalledWith({
        where: { id: 'plugin1' }
      })
      expect(result).toEqual(mockPlugin)
    })

    it('should create plugin', async () => {
      const pluginData = { name: 'New Plugin', version: '1.0.0' }
      const mockCreatedPlugin = { id: 'new-plugin', ...pluginData }
      mockPrisma.plugin.create.mockResolvedValue(mockCreatedPlugin)

      const result = await databaseService.createPlugin(pluginData)

      expect(mockPrisma.plugin.create).toHaveBeenCalledWith({
        data: pluginData
      })
      expect(result).toEqual(mockCreatedPlugin)
    })
  })

  describe('User Plugin Operations', () => {
    it('should get user plugins', async () => {
      const mockUserPlugins = [
        { userId: 'user1', pluginId: 'plugin1', isEnabled: true },
        { userId: 'user1', pluginId: 'plugin2', isEnabled: false }
      ]
      mockPrisma.userPlugin.findMany.mockResolvedValue(mockUserPlugins)

      const result = await databaseService.getUserPlugins('user1')

      expect(mockPrisma.userPlugin.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        include: { plugin: true }
      })
      expect(result).toEqual(mockUserPlugins)
    })

    it('should enable user plugin', async () => {
      const mockUserPlugin = { userId: 'user1', pluginId: 'plugin1', isEnabled: true }
      mockPrisma.userPlugin.update.mockResolvedValue(mockUserPlugin)

      const result = await databaseService.enableUserPlugin('user1', 'plugin1')

      expect(result).toEqual(mockUserPlugin)
    })

    it('should disable user plugin', async () => {
      const mockUserPlugin = { userId: 'user1', pluginId: 'plugin1', isEnabled: false }
      mockPrisma.userPlugin.update.mockResolvedValue(mockUserPlugin)

      const result = await databaseService.disableUserPlugin('user1', 'plugin1')

      expect(result).toEqual(mockUserPlugin)
    })
  })

  describe('App Settings Operations', () => {
    it('should get app settings', async () => {
      const mockSettings = [
        { key: 'theme', value: 'dark' },
        { key: 'language', value: 'en' }
      ]
      mockPrisma.appSettings.findMany.mockResolvedValue(mockSettings)

      const result = await databaseService.getAppSettings()

      expect(mockPrisma.appSettings.findMany).toHaveBeenCalled()
      expect(result).toEqual({
        theme: 'dark',
        language: 'en'
      })
    })

    it('should update setting', async () => {
      const mockSetting = { key: 'theme', value: 'light' }
      mockPrisma.appSettings.upsert.mockResolvedValue(mockSetting)

      const result = await databaseService.updateSetting('theme', 'light')

      expect(mockPrisma.appSettings.upsert).toHaveBeenCalledWith({
        where: { key: 'theme' },
        update: { value: 'light' },
        create: { key: 'theme', value: 'light' }
      })
      expect(result).toEqual(mockSetting)
    })
  })

  describe('Utility Operations', () => {
    it('should clear all data', async () => {
      mockPrisma.userPlugin.deleteMany.mockResolvedValue({ count: 2 })
      mockPrisma.plugin.deleteMany.mockResolvedValue({ count: 3 })
      mockPrisma.appSettings.deleteMany.mockResolvedValue({ count: 5 })
      mockPrisma.user.deleteMany.mockResolvedValue({ count: 1 })

      await databaseService.clearAllData()

      expect(mockPrisma.userPlugin.deleteMany).toHaveBeenCalled()
      expect(mockPrisma.plugin.deleteMany).toHaveBeenCalled()
      expect(mockPrisma.appSettings.deleteMany).toHaveBeenCalled()
      expect(mockPrisma.user.deleteMany).toHaveBeenCalled()
    })
  })
})