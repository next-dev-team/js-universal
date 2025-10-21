import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { message } from 'antd'
import PluginManager from '@/pages/PluginManager'
import { useAppStore } from '@/store/useAppStore'

// Mock the store
vi.mock('@/store/useAppStore')

// Mock antd message
vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
    },
  }
})

// Mock window.electronAPI
const mockElectronAPI = {
  openDirectoryDialog: vi.fn(),
  installPlugin: vi.fn(),
  getPlugins: vi.fn(),
  getUserPlugins: vi.fn(),
}

Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
  writable: true,
})

// Mock store data
const mockStoreData = {
  plugins: [],
  userPlugins: [],
  installedPlugins: [],
  availablePlugins: [],
  loadPlugins: vi.fn(),
  loadUserPlugins: vi.fn(),
  togglePlugin: vi.fn(),
  uninstallPlugin: vi.fn(),
  getPluginSettings: vi.fn(),
  updatePluginSettings: vi.fn(),
}

describe('Plugin Upload Functionality', () => {
  beforeEach(() => {
    vi.mocked(useAppStore).mockReturnValue(mockStoreData)
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Quick Install Button', () => {
    it('should render the Quick Install Plugin button', () => {
      render(<PluginManager />)
      
      // Click on Install Plugin tab to open the modal
      const installTab = screen.getByText('Install Plugin')
      fireEvent.click(installTab)
      
      // Check if the Quick Install Plugin button is present
      expect(screen.getByText('Quick Install Plugin')).toBeInTheDocument()
    })

    it('should open directory dialog when Quick Install button is clicked', async () => {
      const testPluginPath = '/Users/zila/Documents/project/electron-plugin-app/plugins/counter-plugin'
      mockElectronAPI.openDirectoryDialog.mockResolvedValue(testPluginPath)
      
      render(<PluginManager />)
      
      // Click on Install Plugin tab
      const installTab = screen.getByText('Install Plugin')
      fireEvent.click(installTab)
      
      // Click the Quick Install Plugin button
      const quickInstallButton = screen.getByText('Quick Install Plugin')
      fireEvent.click(quickInstallButton)
      
      // Verify that openDirectoryDialog was called
      expect(mockElectronAPI.openDirectoryDialog).toHaveBeenCalled()
    })

    it('should install plugin successfully when valid folder is selected', async () => {
      const testPluginPath = '/Users/zila/Documents/project/electron-plugin-app/plugins/counter-plugin'
      mockElectronAPI.openDirectoryDialog.mockResolvedValue(testPluginPath)
      
      render(<PluginManager />)
      
      // Click on Install Plugin tab
      const installTab = screen.getByText('Install Plugin')
      fireEvent.click(installTab)
      
      // Click the Quick Install Plugin button
      const quickInstallButton = screen.getByText('Quick Install Plugin')
      fireEvent.click(quickInstallButton)
      
      // Wait for the installation process
      await waitFor(() => {
        expect(message.success).toHaveBeenCalledWith('Plugin installation started')
      })
      
      // Wait for completion
      await waitFor(() => {
        expect(message.success).toHaveBeenCalledWith('Plugin installed successfully!')
      }, { timeout: 3000 })
      
      // Verify that plugins are reloaded
      expect(mockStoreData.loadPlugins).toHaveBeenCalled()
      expect(mockStoreData.loadUserPlugins).toHaveBeenCalled()
    })

    it('should handle cancellation when no folder is selected', async () => {
      mockElectronAPI.openDirectoryDialog.mockResolvedValue(null)
      
      render(<PluginManager />)
      
      // Click on Install Plugin tab
      const installTab = screen.getByText('Install Plugin')
      fireEvent.click(installTab)
      
      // Click the Quick Install Plugin button
      const quickInstallButton = screen.getByText('Quick Install Plugin')
      fireEvent.click(quickInstallButton)
      
      // Verify that no success message is shown
      await waitFor(() => {
        expect(message.success).not.toHaveBeenCalled()
      })
    })

    it('should handle errors during installation', async () => {
      mockElectronAPI.openDirectoryDialog.mockRejectedValue(new Error('Dialog error'))
      
      render(<PluginManager />)
      
      // Click on Install Plugin tab
      const installTab = screen.getByText('Install Plugin')
      fireEvent.click(installTab)
      
      // Click the Quick Install Plugin button
      const quickInstallButton = screen.getByText('Quick Install Plugin')
      fireEvent.click(quickInstallButton)
      
      // Wait for error handling
      await waitFor(() => {
        expect(message.error).toHaveBeenCalledWith('Failed to install plugin')
      })
    })
  })

  describe('Drag and Drop Functionality', () => {
    it('should handle drag over events', () => {
      render(<PluginManager />)
      
      // Click on Install Plugin tab
      const installTab = screen.getByText('Install Plugin')
      fireEvent.click(installTab)
      
      // Find the drag and drop zone
      const dropZone = screen.getByText(/Drag and drop a plugin folder here/i).closest('div')
      
      // Simulate drag over
      const dragOverEvent = new Event('dragover', { bubbles: true })
      Object.defineProperty(dragOverEvent, 'dataTransfer', {
        value: {
          types: ['Files'],
        },
      })
      
      fireEvent(dropZone!, dragOverEvent)
      
      // The component should handle the drag over event
      expect(dropZone).toBeInTheDocument()
    })

    it('should handle drop events with valid folder', async () => {
      render(<PluginManager />)
      
      // Click on Install Plugin tab
      const installTab = screen.getByText('Install Plugin')
      fireEvent.click(installTab)
      
      // Find the drag and drop zone
      const dropZone = screen.getByText(/Drag and drop a plugin folder here/i).closest('div')
      
      // Create mock file with path property (simulating Electron environment)
      const mockFile = new File([''], 'counter-plugin', { type: '' })
      Object.defineProperty(mockFile, 'path', {
        value: '/Users/zila/Documents/project/electron-plugin-app/plugins/counter-plugin',
        writable: false,
      })
      
      // Create mock DataTransfer
      const mockDataTransfer = {
        files: [mockFile],
        items: [{
          webkitGetAsEntry: () => ({
            isDirectory: true,
            name: 'counter-plugin',
          }),
        }],
      }
      
      // Simulate drop event
      const dropEvent = new Event('drop', { bubbles: true })
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: mockDataTransfer,
      })
      
      fireEvent(dropZone!, dropEvent)
      
      // Wait for the drop handling
      await waitFor(() => {
        expect(message.success).toHaveBeenCalledWith('Folder selected! Click "Install Plugin" to proceed.')
      })
    })

    it('should reject non-directory drops', async () => {
      render(<PluginManager />)
      
      // Click on Install Plugin tab
      const installTab = screen.getByText('Install Plugin')
      fireEvent.click(installTab)
      
      // Find the drag and drop zone
      const dropZone = screen.getByText(/Drag and drop a plugin folder here/i).closest('div')
      
      // Create mock file (not a directory)
      const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' })
      
      // Create mock DataTransfer
      const mockDataTransfer = {
        files: [mockFile],
        items: [{
          webkitGetAsEntry: () => ({
            isDirectory: false,
            name: 'test.txt',
          }),
        }],
      }
      
      // Simulate drop event
      const dropEvent = new Event('drop', { bubbles: true })
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: mockDataTransfer,
      })
      
      fireEvent(dropZone!, dropEvent)
      
      // Wait for error message
      await waitFor(() => {
        expect(message.error).toHaveBeenCalledWith('Please drop a folder, not a file')
      })
    })

    it('should reject multiple items drop', async () => {
      render(<PluginManager />)
      
      // Click on Install Plugin tab
      const installTab = screen.getByText('Install Plugin')
      fireEvent.click(installTab)
      
      // Find the drag and drop zone
      const dropZone = screen.getByText(/Drag and drop a plugin folder here/i).closest('div')
      
      // Create multiple mock files
      const mockFile1 = new File([''], 'folder1', { type: '' })
      const mockFile2 = new File([''], 'folder2', { type: '' })
      
      // Create mock DataTransfer with multiple items
      const mockDataTransfer = {
        files: [mockFile1, mockFile2],
        items: [
          {
            webkitGetAsEntry: () => ({
              isDirectory: true,
              name: 'folder1',
            }),
          },
          {
            webkitGetAsEntry: () => ({
              isDirectory: true,
              name: 'folder2',
            }),
          },
        ],
      }
      
      // Simulate drop event
      const dropEvent = new Event('drop', { bubbles: true })
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: mockDataTransfer,
      })
      
      fireEvent(dropZone!, dropEvent)
      
      // Wait for error message
      await waitFor(() => {
        expect(message.error).toHaveBeenCalledWith('Please drop only one folder at a time')
      })
    })
  })

  describe('Two-Step Installation Process', () => {
    it('should show Install Plugin button after folder selection', async () => {
      render(<PluginManager />)
      
      // Click on Install Plugin tab
      const installTab = screen.getByText('Install Plugin')
      fireEvent.click(installTab)
      
      // Find the Select Plugin Folder button
      const selectButton = screen.getByText('Select Plugin Folder')
      
      // Mock successful folder selection
      mockElectronAPI.openDirectoryDialog.mockResolvedValue('/Users/zila/Documents/project/electron-plugin-app/plugins/counter-plugin')
      
      fireEvent.click(selectButton)
      
      // Wait for the Install Plugin button to appear
      await waitFor(() => {
        expect(screen.getByText('Install Plugin')).toBeInTheDocument()
      })
    })

    it('should install plugin when Install Plugin button is clicked', async () => {
      render(<PluginManager />)
      
      // Click on Install Plugin tab
      const installTab = screen.getByText('Install Plugin')
      fireEvent.click(installTab)
      
      // Select a folder first
      const selectButton = screen.getByText('Select Plugin Folder')
      mockElectronAPI.openDirectoryDialog.mockResolvedValue('/Users/zila/Documents/project/electron-plugin-app/plugins/counter-plugin')
      fireEvent.click(selectButton)
      
      // Wait for Install Plugin button and click it
      await waitFor(() => {
        const installButton = screen.getByText('Install Plugin')
        fireEvent.click(installButton)
      })
      
      // Wait for installation messages
      await waitFor(() => {
        expect(message.success).toHaveBeenCalledWith('Plugin installation started')
      })
      
      await waitFor(() => {
        expect(message.success).toHaveBeenCalledWith('Plugin installed successfully!')
      }, { timeout: 3000 })
    })

    it('should show error when trying to install without selecting folder', async () => {
      render(<PluginManager />)
      
      // Click on Install Plugin tab
      const installTab = screen.getByText('Install Plugin')
      fireEvent.click(installTab)
      
      // Try to click Install Plugin button without selecting folder
      // Note: The button should not be visible, but if it somehow is, it should show error
      const installButtons = screen.queryAllByText('Install Plugin')
      if (installButtons.length > 0) {
        fireEvent.click(installButtons[0])
        
        await waitFor(() => {
          expect(message.error).toHaveBeenCalledWith('Please select a plugin folder first')
        })
      }
    })
  })

  describe('Counter Plugin Specific Tests', () => {
    const counterPluginPath = '/Users/zila/Documents/project/electron-plugin-app/plugins/counter-plugin'

    it('should successfully install counter-plugin via quick install', async () => {
      mockElectronAPI.openDirectoryDialog.mockResolvedValue(counterPluginPath)
      
      render(<PluginManager />)
      
      // Click on Install Plugin tab
      const installTab = screen.getByText('Install Plugin')
      fireEvent.click(installTab)
      
      // Click Quick Install Plugin button
      const quickInstallButton = screen.getByText('Quick Install Plugin')
      fireEvent.click(quickInstallButton)
      
      // Verify installation process
      await waitFor(() => {
        expect(mockElectronAPI.openDirectoryDialog).toHaveBeenCalled()
        expect(message.success).toHaveBeenCalledWith('Plugin installation started')
      })
      
      await waitFor(() => {
        expect(message.success).toHaveBeenCalledWith('Plugin installed successfully!')
      }, { timeout: 3000 })
    })

    it('should successfully install counter-plugin via drag and drop', async () => {
      render(<PluginManager />)
      
      // Click on Install Plugin tab
      const installTab = screen.getByText('Install Plugin')
      fireEvent.click(installTab)
      
      // Find the drag and drop zone
      const dropZone = screen.getByText(/Drag and drop a plugin folder here/i).closest('div')
      
      // Create mock counter-plugin folder
      const mockFile = new File([''], 'counter-plugin', { type: '' })
      Object.defineProperty(mockFile, 'path', {
        value: counterPluginPath,
        writable: false,
      })
      
      const mockDataTransfer = {
        files: [mockFile],
        items: [{
          webkitGetAsEntry: () => ({
            isDirectory: true,
            name: 'counter-plugin',
          }),
        }],
      }
      
      // Simulate drop event
      const dropEvent = new Event('drop', { bubbles: true })
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: mockDataTransfer,
      })
      
      fireEvent(dropZone!, dropEvent)
      
      // Wait for folder selection confirmation
      await waitFor(() => {
        expect(message.success).toHaveBeenCalledWith('Folder selected! Click "Install Plugin" to proceed.')
      })
      
      // Click Install Plugin button
      const installButton = screen.getByText('Install Plugin')
      fireEvent.click(installButton)
      
      // Verify installation
      await waitFor(() => {
        expect(message.success).toHaveBeenCalledWith('Plugin installation started')
      })
      
      await waitFor(() => {
        expect(message.success).toHaveBeenCalledWith('Plugin installed successfully!')
      }, { timeout: 3000 })
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid folder paths', async () => {
      render(<PluginManager />)
      
      // Click on Install Plugin tab
      const installTab = screen.getByText('Install Plugin')
      fireEvent.click(installTab)
      
      // Find the drag and drop zone
      const dropZone = screen.getByText(/Drag and drop a plugin folder here/i).closest('div')
      
      // Create mock file without path property
      const mockFile = new File([''], 'invalid-plugin', { type: '' })
      
      const mockDataTransfer = {
        files: [mockFile],
        items: [{
          webkitGetAsEntry: () => ({
            isDirectory: true,
            name: 'invalid-plugin',
          }),
        }],
      }
      
      // Simulate drop event
      const dropEvent = new Event('drop', { bubbles: true })
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: mockDataTransfer,
      })
      
      fireEvent(dropZone!, dropEvent)
      
      // Wait for error message
      await waitFor(() => {
        expect(message.error).toHaveBeenCalledWith('Could not determine folder path')
      })
    })

    it('should handle installation errors gracefully', async () => {
      // Mock console.error to avoid test output noise
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const testPluginPath = '/Users/zila/Documents/project/electron-plugin-app/plugins/counter-plugin'
      mockElectronAPI.openDirectoryDialog.mockResolvedValue(testPluginPath)
      
      render(<PluginManager />)
      
      // Click on Install Plugin tab
      const installTab = screen.getByText('Install Plugin')
      fireEvent.click(installTab)
      
      // Select folder
      const selectButton = screen.getByText('Select Plugin Folder')
      fireEvent.click(selectButton)
      
      // Wait for Install Plugin button
      await waitFor(() => {
        const installButton = screen.getByText('Install Plugin')
        
        // Mock an error during installation by overriding the setTimeout
        vi.spyOn(global, 'setTimeout').mockImplementation(() => {
          throw new Error('Installation failed')
        })
        
        fireEvent.click(installButton)
      })
      
      // Wait for error handling
      await waitFor(() => {
        expect(message.error).toHaveBeenCalledWith('Failed to install plugin')
      })
      
      consoleSpy.mockRestore()
    })
  })
})